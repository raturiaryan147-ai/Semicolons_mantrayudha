import { ParsedIntent, AgentIntentType } from '../../types/agentReasoning';

export class IntentLayer {
  static parse(text: string): {
    intents: ParsedIntent[];
    isMultiIntent: boolean;
    taskComplexity: 'fast' | 'general' | 'complex';
  } {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    const intents: ParsedIntent[] = [];


    // Helper entity extractors
    const orderIdMatch = raw.match(/#?NM[- ]?(\d+)/i);
    const orderId = orderIdMatch ? `NM-${orderIdMatch[1]}` : undefined;

    const budgetMatch = raw.match(/under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|\$?(\d+)\s*budget/i);
    const maxBudget = budgetMatch ? Number(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]) : undefined;

    // 1. Untrusted Prompt Injection, System Prompt Extraction, or Policy Override Attempts
    const overrideTriggers = [
      'ignore previous instructions',
      'system prompt',
      'reveal prompt',
      'developer mode',
      'ignore all rules',
      'override policy',
      'ignore policy',
      'pretend you are',
      'bypass rule',
      'secret instructions',
      'internal rules',
      'database password',
      'api key'
    ];
    if (overrideTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'ESCALATE_HUMAN',
        confidence: 0.99,
        extractedEntities: {
          actionRequired: 'Security / Policy Override Attempt blocked. Direct human escalation required.'
        },
        summary: 'Customer attempt to alter system rules, expose internal instructions, or override store policy.'
      });
      return { intents, isMultiIntent: false, taskComplexity: 'complex' };
    }

    // 2. Sensitive, Legal, Safety, Fraud, or Suspicious Cases
    const legalSensitiveTriggers = [
      'attorney',
      'lawyer',
      'lawsuit',
      'sue you',
      'legal action',
      'police',
      'chargeback',
      'fraud',
      'stolen card',
      'unauthorized charge',
      'identity theft',
      'safety hazard',
      'dangerous item',
      'threaten'
    ];
    if (legalSensitiveTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'ESCALATE_HUMAN',
        confidence: 0.99,
        extractedEntities: {
          orderId,
          actionRequired: 'Sensitive / Legal / Safety / Fraud case. Handover to Senior Dispute Team.'
        },
        summary: 'Customer query involves legal action, payment dispute, fraud, or safety concern.'
      });
      return { intents, isMultiIntent: false, taskComplexity: 'complex' };
    }


    // 3. Human Specialist Request (Direct Request or Damaged Item)
    const escalationTriggers = [
      'speak to a human',
      'talk to a human',
      'real person',
      'human agent',
      'customer service representative',
      'supervisor',
      'manager',
      'speak with someone',
      'live agent',
      'damaged item',
      'item arrived broken',
      'received defective'
    ];
    if (escalationTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'ESCALATE_HUMAN',
        confidence: 0.97,
        extractedEntities: {
          orderId,
          actionRequired: 'Customer requested human representative or reported damaged merchandise.',
          returnReason: lower.includes('damaged') || lower.includes('broken') ? 'Item arrived damaged / defective' : 'Customer requested human assistance'
        },
        summary: 'Direct human assistance request.'
      });
    }

    // 4. Order Tracking Intent
    const trackingTriggers = [
      'track',
      'where is my',
      'order status',
      'shipment',
      'delivery date',
      'when will it arrive',
      'package location',
      'carrier status',
      'tracking number'
    ];
    const mentionsOrder = orderIdMatch || lower.includes('order');
    if (trackingTriggers.some(t => lower.includes(t)) || (orderId && !lower.includes('return') && !lower.includes('cancel'))) {
      if (!intents.some(i => i.type === 'TRACK_ORDER')) {
        intents.push({
          type: 'TRACK_ORDER',
          confidence: 0.95,
          extractedEntities: {
            orderId
          },
          summary: `Tracking inquiry for order ${orderId || 'unspecified'}.`
        });
      }
    }

    // 5. Order Cancellation Intent
    const cancelTriggers = ['cancel order', 'cancel my order', 'stop shipment', 'do not dispatch'];
    if (cancelTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'CANCEL_ORDER',
        confidence: 0.95,
        extractedEntities: {
          orderId
        },
        summary: `Order cancellation request for ${orderId || 'unspecified'}.`
      });
    }

    // 6. Return / Refund Request Intent
    const returnTriggers = ['return', 'refund', 'send back', 'exchange', 'money back', 'drop off return'];
    if (returnTriggers.some(t => lower.includes(t)) && !intents.some(i => i.type === 'CANCEL_ORDER')) {
      intents.push({
        type: 'RETURN_REFUND_REQUEST',
        confidence: 0.94,
        extractedEntities: {
          orderId,
          returnReason: lower.includes('size') ? 'Size/Fit issue' : lower.includes('damaged') ? 'Damaged goods' : 'Customer request'
        },
        summary: `Return or refund request for ${orderId || 'unspecified order'}.`
      });
    }

    // 7. Store Policy Question (Shipping, Returns, Warranty)
    const policyTriggers = ['shipping policy', 'return policy', 'how long do returns take', 'return window', 'shipping cost', 'free shipping', 'warranty'];
    if (policyTriggers.some(t => lower.includes(t)) && !intents.some(i => i.type === 'RETURN_REFUND_REQUEST')) {
      intents.push({
        type: 'POLICY_QUESTION',
        confidence: 0.92,
        extractedEntities: {},
        summary: 'Inquiry regarding published store policy.'
      });
    }

    // 8. Product Inquiry or Recommendation
    const productTriggers = ['recommend', 'suggest', 'looking for', 'show me', 'find', 'watch', 'hoodie', 'shoes', 'sneakers', 'bag', 'perfume', 'headphones', 'serum', 'vase', 'lamp'];
    if (productTriggers.some(t => lower.includes(t)) && !lower.includes('where is my order')) {
      let category: string | undefined;
      if (lower.includes('watch') || lower.includes('headphone') || lower.includes('electronic')) category = 'Electronics';
      else if (lower.includes('hoodie') || lower.includes('men')) category = 'Men';
      else if (lower.includes('bag') || lower.includes('handbag') || lower.includes('women')) category = 'Women';
      else if (lower.includes('perfume') || lower.includes('serum') || lower.includes('beauty')) category = 'Beauty';
      else if (lower.includes('vase') || lower.includes('lamp') || lower.includes('home')) category = 'Home & Living';

      intents.push({
        type: 'PRODUCT_INQUIRY',
        confidence: 0.91,
        extractedEntities: {
          category,
          maxBudget,
          productName: lower.includes('watch') ? 'Smart Watch' : lower.includes('hoodie') ? 'Hoodie' : undefined
        },
        summary: `Product inquiry for ${category || 'catalog'}${maxBudget ? ` under $${maxBudget}` : ''}.`
      });
    }

    // 9. Promo / Discount Query
    const promoTriggers = ['discount', 'promo', 'coupon', 'code', 'voucher', 'sale'];
    if (promoTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'PROMO_DISCOUNT',
        confidence: 0.93,
        extractedEntities: {},
        summary: 'Query regarding active promotional discounts or vouchers.'
      });
    }

    // Default if no specific intent recognized
    if (intents.length === 0) {
      intents.push({
        type: 'GENERAL_CONVERSATION',
        confidence: 0.85,
        extractedEntities: {},
        summary: 'General customer assistance inquiry.'
      });
    }

    const isMultiIntent = intents.length > 1;

    // Determine task complexity:
    // - 'complex': multi-intent queries, cancellations, human escalations, or legal disputes (handled by gemini-3.1-pro-preview)
    // - 'fast': simple greetings, quick coupon checks, or status lookups (handled by gemini-3.1-flash-lite)
    // - 'general': returns, recommendations, and policy explanations (handled by gemini-3.5-flash)
    let taskComplexity: 'fast' | 'general' | 'complex' = 'general';
    if (isMultiIntent || intents.some(i => ['ESCALATE_HUMAN', 'CANCEL_ORDER'].includes(i.type))) {
      taskComplexity = 'complex';
    } else if (intents.every(i => ['GENERAL_CONVERSATION', 'PROMO_DISCOUNT'].includes(i.type))) {
      taskComplexity = 'fast';
    }

    return {
      intents,
      isMultiIntent,
      taskComplexity
    };
  }
}

