import { ConversationMemoryState } from '../../types/agentReasoning';
import { storeService } from '../storeService';
import { auth } from '../../firebase';

export class MemoryLayer {
  private static memoryState: ConversationMemoryState = {
    userId: 'guest-user',
    userName: 'Valued Customer',
    previouslyAnswered: [],
    sessionFacts: {},
    cartCount: 0,
    totalOrdersCount: 0
  };

  static getMemoryState(): ConversationMemoryState {
    const profile = storeService.getProfile();
    const orders = storeService.getOrders();
    const currentUser = auth.currentUser;

    this.memoryState.userId = currentUser?.uid || 'guest-user';
    this.memoryState.userName = currentUser?.displayName || profile.name;
    this.memoryState.totalOrdersCount = orders.length;
    return { ...this.memoryState };
  }


  static rememberActiveOrder(orderId: string): void {
    this.memoryState.activeOrderId = orderId;
    this.recordFact('last_referenced_order', orderId);
  }

  static rememberActiveProduct(productId: string): void {
    this.memoryState.activeProductId = productId;
    this.recordFact('last_referenced_product', productId);
  }

  static recordFact(key: string, value: any): void {
    this.memoryState.sessionFacts[key] = value;
  }

  static markAnswered(topic: string): void {
    if (!this.memoryState.previouslyAnswered.includes(topic)) {
      this.memoryState.previouslyAnswered.push(topic);
    }
  }

  static hasAnswered(topic: string): boolean {
    return this.memoryState.previouslyAnswered.includes(topic);
  }

  static retrieveContext(intentOrderId?: string): {
    retrievedContext: string[];
    reusedFacts: string[];
    avoidedRepetitions: string[];
    resolvedOrderId?: string;
  } {
    const profile = storeService.getProfile();
    const orders = storeService.getOrders();
    const currentUser = auth.currentUser;
    const customerName = currentUser?.displayName || profile.name;
    const customerEmail = currentUser?.email || profile.email;

    const retrievedContext: string[] = [
      `Customer profile: ${customerName} (${customerEmail})`,
      `Membership tier: ${profile.membershipTier} · ${profile.rewardPoints || 450} pts`,
      `Account lifetime orders: ${orders.length} orders on file`
    ];

    const reusedFacts: string[] = [];
    const avoidedRepetitions: string[] = [];

    // Resolve order ID from argument or memory
    let resolvedOrderId = intentOrderId || this.memoryState.activeOrderId;

    if (intentOrderId) {
      this.rememberActiveOrder(intentOrderId);
      reusedFacts.push(`Explicit order provided in current prompt: ${intentOrderId}`);
    } else if (this.memoryState.activeOrderId) {
      reusedFacts.push(`Reused active order from memory: ${this.memoryState.activeOrderId} (avoided asking customer to re-enter order number)`);
      avoidedRepetitions.push('Do NOT re-prompt user for order ID; already retained in active memory');
    }

    if (this.memoryState.previouslyAnswered.includes('return_policy_30_days')) {
      avoidedRepetitions.push('Customer already viewed general 30-day return policy; jump directly to specific order eligibility');
    }

    if (this.memoryState.previouslyAnswered.includes('promo_code_NOVA10')) {
      avoidedRepetitions.push('Customer already has NOVA10 coupon details');
    }

    return {
      retrievedContext,
      reusedFacts,
      avoidedRepetitions,
      resolvedOrderId
    };
  }
}
