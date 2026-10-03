import { IntentLayer } from './intentLayer';
import { MemoryLayer } from './memoryLayer';
import { PolicyLayer } from './policyLayer';
import { ToolsLayer } from './toolsLayer';
import { DecisionLayer } from './decisionLayer';
import { EnhancedChatMessage, LayeredReasoningTrace } from '../../types/agentReasoning';
import { GeminiChatService } from '../geminiChatService';
import { storeService } from '../storeService';

export class LayeredAgentOrchestrator {
  static async processMessage(
    userText: string,
    conversationHistory: EnhancedChatMessage[] = [],
    userName?: string
  ): Promise<EnhancedChatMessage> {
    const raw = userText.trim();

    // 1. LAYER 1: INTENT & COMPLEXITY
    const { intents, isMultiIntent, taskComplexity } = IntentLayer.parse(raw);

    // 2. LAYER 2: MEMORY
    const explicitOrderId = intents.find(i => i.extractedEntities?.orderId)?.extractedEntities.orderId;
    const memoryContext = MemoryLayer.retrieveContext(explicitOrderId);
    const resolvedOrderId = memoryContext.resolvedOrderId;

    // 3. LAYER 4: TOOLS EXECUTION
    const toolsResult = ToolsLayer.executeTools(intents, resolvedOrderId);
    const targetOrder = toolsResult.retrievedOrder;

    // 4. LAYER 3: POLICY EVALUATION
    const policyResult = PolicyLayer.evaluate(intents, targetOrder);

    // 5. LAYER 5: DECISION ENGINE (Ground-truth & Fallback Generator)
    const decisionResult = DecisionLayer.decide(
      intents,
      policyResult,
      toolsResult.toolsCalled,
      targetOrder,
      toolsResult.retrievedProducts,
      toolsResult.returnReceipt,
      toolsResult.escalationTicket,
      raw,
      {
        orderLookupFailed: toolsResult.orderLookupFailed,
        missingOrderId: toolsResult.missingOrderId
      }
    );

    // 6. MULTI-TURN GEMINI SYNTHESIS (Natural, Human & Policy-Grounded)
    let finalResponseText = decisionResult.responseText;
    let modelUsed: string | undefined;

    try {
      const historyTurns = conversationHistory.slice(-8).map(msg => ({
        role: msg.sender === 'user' ? ('user' as const) : ('model' as const),
        text: msg.text,
      }));

      const geminiResponse = await GeminiChatService.sendMessage(raw, historyTurns, {
        userName,
        targetOrder,
        verifiedOrders: storeService.getOrders(),
        verifiedProducts: toolsResult.retrievedProducts,
        activePolicies: policyResult,
        returnReceipt: toolsResult.returnReceipt,
        escalationTicket: toolsResult.escalationTicket,
        taskComplexity,
      });

      if (geminiResponse && geminiResponse.text.trim()) {
        finalResponseText = geminiResponse.text.trim();
        modelUsed = geminiResponse.modelUsed;
      }
    } catch (e) {
      // Deterministic decisionResult fallback is used if server call is unreachable
    }

    // Construct the complete Layered Reasoning Trace
    const reasoningTrace: LayeredReasoningTrace = {
      intentLayer: {
        intents,
        isMultiIntent,
        rawText: raw
      },
      memoryLayer: {
        retrievedContext: memoryContext.retrievedContext,
        reusedFacts: memoryContext.reusedFacts,
        avoidedRepetitions: memoryContext.avoidedRepetitions
      },
      policyLayer: policyResult,
      toolsLayer: {
        toolsCalled: toolsResult.toolsCalled
      },
      decisionLayer: {
        decision: decisionResult.decision,
        rationale: modelUsed 
          ? `${decisionResult.rationale} [Synthesized via ${modelUsed}]`
          : decisionResult.rationale,
        confidence: decisionResult.confidence,
        nextStep: decisionResult.nextStep
      }
    };

    // Construct the final EnhancedChatMessage
    return {
      id: `asst-${Date.now()}`,
      sender: 'assistant',
      text: finalResponseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      reasoningTrace,
      relatedOrder: targetOrder,
      relatedProducts: toolsResult.retrievedProducts,
      actionType: decisionResult.decision === 'ESCALATE' 
        ? 'escalation_ticket' 
        : toolsResult.returnReceipt 
        ? 'return_initiated' 
        : targetOrder 
        ? 'view_order' 
        : undefined,
      escalationTicket: toolsResult.escalationTicket,
      returnReceipt: toolsResult.returnReceipt,
      interactiveChips: decisionResult.interactiveChips,
      suggestedFollowUps: decisionResult.suggestedFollowUps
    };
  }
}
