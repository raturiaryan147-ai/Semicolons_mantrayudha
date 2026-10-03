import { ParsedIntent, AgentIntentType } from '../../types/agentReasoning';

export class IntentLayer {
  static parse(text: string): { intents: ParsedIntent[]; isMultiIntent: boolean } {
    const raw = text.trim();
    const lower = raw.toLowerCase();
    const intents: ParsedIntent[] = [];

    // Helper entity extractors
    const orderIdMatch = raw.match(/#?NM[- ]?(\d+)/i);
    const orderId = orderIdMatch ? `NM-${orderIdMatch[1]}` : undefined;

    const budgetMatch = raw.match(/under\s*\$?(\d+)|less\s*than\s*\$?(\d+)|\$?(\d+)\s*budget/i);
    const maxBudget = budgetMatch ? Number(budgetMatch[1] || budgetMatch[2] || budgetMatch[3]) : undefined;

    // 1. Human Escalation Intent
    const escalationTriggers = ['human', 'agent', 'representative', 'supervisor', 'real person', 'manager', 'speak to someone', 'talk to human', 'damaged', 'broken item', 'fraud', 'stolen'];
    if (escalationTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'ESCALATE_HUMAN',
        confidence: 0.96,
        extractedEntities: {
          orderId,
          actionRequired: 'Handover to priority human support concierge',
          returnReason: lower.includes('damaged') ? 'Damaged / Broken item delivered' : 'Customer requested human agent'
        },
        summary: 'Customer requests direct human escalation or reported damaged/fraud goods.'
      });
    }

    // 2. Track Order Intent
    const trackingTriggers = ['track', 'where is my', 'order status', 'shipment', 'delivery date', 'when will', 'carrier', 'package', 'tracking number'];
    if (trackingTriggers.some(t => lower.includes(t)) || (orderId && !lower.includes('return') && !lower.includes('cancel'))) {
      intents.push({
        type: 'TRACK_ORDER',
        confidence: 0.95,
        extractedEntities: {
          orderId
        },
        summary: `Tracking request for shipment status ${orderId ? `(${orderId})` : '(unspecified ID)'}.`
      });
    }

    // 3. Return / Refund Request Intent
    const returnTriggers = ['return', 'refund', 'send back', 'exchange', 'money back', 'drop off'];
    if (returnTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'RETURN_REFUND_REQUEST',
        confidence: 0.94,
        extractedEntities: {
          orderId,
          returnReason: lower.includes('size') ? 'Size/Fit issue' : lower.includes('damaged') ? 'Item damaged' : 'Customer preference'
        },
        summary: `Customer requesting return or refund authorization ${orderId ? `for ${orderId}` : ''}.`
      });
    }

    // 4. Cancel Order Intent
    const cancelTriggers = ['cancel order', 'cancel my order', 'stop shipment', 'do not ship'];
    if (cancelTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'CANCEL_ORDER',
        confidence: 0.93,
        extractedEntities: {
          orderId
        },
        summary: `Cancellation request for order ${orderId || 'unspecified'}.`
      });
    }

    // 5. Product Recommendation / Inquiry Intent
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
          productName: lower.includes('watch') ? 'Smart Watch / Chrono' : lower.includes('hoodie') ? 'Hoodie' : undefined
        },
        summary: `Product discovery query for ${category || 'general catalog'}${maxBudget ? ` under $${maxBudget}` : ''}.`
      });
    }

    // 6. Discount & Promo Intent
    const promoTriggers = ['discount', 'promo', 'coupon', 'code', 'voucher', 'sale', 'deal of the day'];
    if (promoTriggers.some(t => lower.includes(t))) {
      intents.push({
        type: 'PROMO_DISCOUNT',
        confidence: 0.92,
        extractedEntities: {},
        summary: 'Query regarding VIP promo codes, discounts, or daily flash deals.'
      });
    }

    // 7. General Store Policy Question
    const policyTriggers = ['shipping policy', 'return policy', 'how long to ship', 'free shipping threshold', 'guarantee'];
    if (policyTriggers.some(t => lower.includes(t)) && !intents.some(i => i.type === 'RETURN_REFUND_REQUEST')) {
      intents.push({
        type: 'POLICY_QUESTION',
        confidence: 0.89,
        extractedEntities: {},
        summary: 'General informational question regarding store shipping or return policies.'
      });
    }

    // Default fallback if no specific intent caught
    if (intents.length === 0) {
      intents.push({
        type: 'GENERAL_CONVERSATION',
        confidence: 0.85,
        extractedEntities: {},
        summary: 'General customer greeting, greeting inquiry, or guidance request.'
      });
    }

    return {
      intents,
      isMultiIntent: intents.length > 1
    };
  }
}
