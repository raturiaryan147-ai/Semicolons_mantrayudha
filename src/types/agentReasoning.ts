import { Order, Product } from './index';

export type AgentIntentType =
  | 'TRACK_ORDER'
  | 'RETURN_REFUND_REQUEST'
  | 'PRODUCT_INQUIRY'
  | 'PROMO_DISCOUNT'
  | 'CANCEL_ORDER'
  | 'POLICY_QUESTION'
  | 'ACCOUNT_HELP'
  | 'ESCALATE_HUMAN'
  | 'GENERAL_CONVERSATION';

export interface ParsedIntent {
  type: AgentIntentType;
  confidence: number;
  extractedEntities: {
    orderId?: string;
    productName?: string;
    category?: string;
    maxBudget?: number;
    returnReason?: string;
    actionRequired?: string;
  };
  summary: string;
}

export interface ConversationMemoryState {
  userId: string;
  userName: string;
  activeOrderId?: string;
  activeProductId?: string;
  lastIntent?: AgentIntentType;
  previouslyAnswered: string[];
  sessionFacts: Record<string, any>;
  cartCount: number;
  totalOrdersCount: number;
}

export interface PolicyEvaluation {
  policyVersion: string;
  ruleApplied: string;
  isEligible: boolean;
  reason: string;
  deadlineDate?: string;
  policyNotes: string[];
}

export interface ToolCallTrace {
  toolName: string;
  parameters: Record<string, any>;
  executionStatus: 'success' | 'failed' | 'skipped';
  resultSummary: string;
  dataPayload?: any;
}

export type AgentDecisionType = 'ANSWER' | 'ASK' | 'ACT' | 'ESCALATE';

export interface LayeredReasoningTrace {
  intentLayer: {
    intents: ParsedIntent[];
    isMultiIntent: boolean;
    rawText: string;
  };
  memoryLayer: {
    retrievedContext: string[];
    reusedFacts: string[];
    avoidedRepetitions: string[];
  };
  policyLayer: PolicyEvaluation;
  toolsLayer: {
    toolsCalled: ToolCallTrace[];
  };
  decisionLayer: {
    decision: AgentDecisionType;
    rationale: string;
    confidence: number;
    nextStep: string;
  };
}

export interface EnhancedChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  reasoningTrace?: LayeredReasoningTrace;
  relatedOrder?: Order;
  relatedProducts?: Product[];
  actionType?: 'view_order' | 'view_product' | 'return_policy' | 'discount_info' | 'return_initiated' | 'escalation_ticket';
  escalationTicket?: {
    ticketId: string;
    status: 'Pending Assignment' | 'Transferred';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    assignedTeam: string;
    estimatedWaitTime: string;
  };
  returnReceipt?: {
    returnId: string;
    orderId: string;
    itemNames: string[];
    refundAmount: number;
    status: 'Label Generated - Ready to Ship';
    refundMethod: string;
    dropoffCarrier: string;
  };
}
