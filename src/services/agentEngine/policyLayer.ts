import { PolicyEvaluation, ParsedIntent } from '../../types/agentReasoning';
import { Order } from '../../types';

export class PolicyLayer {
  static readonly POLICY_VERSION = 'v2.4 (Store Governance Oct 2026)';
  static readonly RETURN_WINDOW_DAYS = 30;
  static readonly FREE_SHIPPING_MIN = 75.00;
  static readonly REFUND_SLA_HOURS = 48;

  static evaluate(intents: ParsedIntent[], targetOrder?: Order): PolicyEvaluation {
    const hasReturn = intents.some(i => i.type === 'RETURN_REFUND_REQUEST');
    const hasCancel = intents.some(i => i.type === 'CANCEL_ORDER');
    const hasShipping = intents.some(i => i.type === 'POLICY_QUESTION' || i.type === 'TRACK_ORDER');

    const policyNotes: string[] = [
      `Active Governance Version: ${this.POLICY_VERSION}`,
      `Standard Return Window: ${this.RETURN_WINDOW_DAYS} calendar days from verified delivery date`,
      `Refund Window SLA: Within ${this.REFUND_SLA_HOURS} hours of return scan to original payment instrument`,
      `Prepaid Return Shipping: 100% covered by NovaMart on eligible orders`
    ];

    // 1. Cancellation Policy Evaluation
    if (hasCancel && targetOrder) {
      if (targetOrder.status === 'Processing') {
        return {
          policyVersion: this.POLICY_VERSION,
          ruleApplied: 'Section 4.1: Order Cancellation Prior to Carrier Dispatch',
          isEligible: true,
          reason: `Order #${targetOrder.id} is currently in Processing state. Full cancellation and immediate reversal is permitted.`,
          policyNotes
        };
      } else {
        return {
          policyVersion: this.POLICY_VERSION,
          ruleApplied: 'Section 4.2: In-Transit / Dispatched Order Governance',
          isEligible: false,
          reason: `Order #${targetOrder.id} has already been transferred to carrier (${targetOrder.status}). Policy prohibits in-transit intercept. Customer may use 30-day free return upon delivery.`,
          policyNotes
        };
      }
    }

    // 2. Return & Refund Policy Evaluation
    if (hasReturn && targetOrder) {
      // Calculate delivery date relative to 30 days
      const orderDate = new Date(targetOrder.date);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - orderDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const isWithin30Days = diffDays <= this.RETURN_WINDOW_DAYS;

      if (targetOrder.status === 'Delivered' && isWithin30Days) {
        return {
          policyVersion: this.POLICY_VERSION,
          ruleApplied: 'Section 3.1: 30-Day Risk-Free Post-Delivery Return',
          isEligible: true,
          reason: `Delivered within ${diffDays} days (allowed up to ${this.RETURN_WINDOW_DAYS} days). Eligible for full refund of $${targetOrder.total.toFixed(2)} to ${targetOrder.paymentMethod}.`,
          deadlineDate: `Eligible through Day ${this.RETURN_WINDOW_DAYS - diffDays} remaining`,
          policyNotes
        };
      } else if (targetOrder.status === 'In Transit' || targetOrder.status === 'Processing') {
        return {
          policyVersion: this.POLICY_VERSION,
          ruleApplied: 'Section 3.4: Pre-Delivery Return Window',
          isEligible: false,
          reason: `Package is currently ${targetOrder.status}. Returns can only be officially initiated after final delivery scan to verify goods.`,
          policyNotes
        };
      } else {
        return {
          policyVersion: this.POLICY_VERSION,
          ruleApplied: 'Section 3.3: Expired Return Window',
          isEligible: false,
          reason: `Order exceeded the ${this.RETURN_WINDOW_DAYS}-day return threshold (${diffDays} days elapsed).`,
          policyNotes
        };
      }
    }

    // 3. Default General Policy
    return {
      policyVersion: this.POLICY_VERSION,
      ruleApplied: 'Section 1.0: NovaMart Standard Customer Charter',
      isEligible: true,
      reason: 'General compliance verified. All catalog items qualify for 100% authenticity guarantee and standard 30-day trial.',
      policyNotes
    };
  }
}
