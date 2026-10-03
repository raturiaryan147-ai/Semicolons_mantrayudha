import { IntentLayer } from './intentLayer';
import { MemoryLayer } from './memoryLayer';
import { PolicyLayer } from './policyLayer';
import { ToolsLayer } from './toolsLayer';
import { DecisionLayer } from './decisionLayer';
import { EnhancedChatMessage, LayeredReasoningTrace } from '../../types/agentReasoning';

export class LayeredAgentOrchestrator {
  static async processMessage(userText: string): Promise<EnhancedChatMessage> {
    const raw = userText.trim();

    // 1. LAYER 1: INTENT
    const { intents, isMultiIntent } = IntentLayer.parse(raw);

    // 2. LAYER 2: MEMORY
    const explicitOrderId = intents.find(i => i.extractedEntities?.orderId)?.extractedEntities.orderId;
    const memoryContext = MemoryLayer.retrieveContext(explicitOrderId);
    const resolvedOrderId = memoryContext.resolvedOrderId;

    // 3. LAYER 4 PREVIEW / TOOLS EXECUTION:
    // Execute verified tools with validated parameters
    const toolsResult = ToolsLayer.executeTools(intents, resolvedOrderId);
    const targetOrder = toolsResult.retrievedOrder;

    // 4. LAYER 3: POLICY
    const policyResult = PolicyLayer.evaluate(intents, targetOrder);

    // 5. LAYER 5: DECISION
    const decisionResult = DecisionLayer.decide(
      intents,
      policyResult,
      toolsResult.toolsCalled,
      targetOrder,
      toolsResult.retrievedProducts,
      toolsResult.returnReceipt,
      toolsResult.escalationTicket
    );

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
        rationale: decisionResult.rationale,
        confidence: decisionResult.confidence,
        nextStep: decisionResult.nextStep
      }
    };

    // Construct the final EnhancedChatMessage
    return {
      id: `asst-${Date.now()}`,
      sender: 'assistant',
      text: decisionResult.responseText,
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
      returnReceipt: toolsResult.returnReceipt
    };
  }
}
