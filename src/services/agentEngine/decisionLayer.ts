import { AgentDecisionType, ParsedIntent, PolicyEvaluation, ToolCallTrace } from '../../types/agentReasoning';
import { Order, Product } from '../../types';

export class DecisionLayer {
  static decide(
    intents: ParsedIntent[],
    policy: PolicyEvaluation,
    tools: ToolCallTrace[],
    order?: Order,
    products?: Product[],
    returnReceipt?: any,
    escalationTicket?: any
  ): {
    decision: AgentDecisionType;
    rationale: string;
    confidence: number;
    nextStep: string;
    responseText: string;
  } {
    // 1. ESCALATE Check
    if (intents.some(i => i.type === 'ESCALATE_HUMAN')) {
      return {
        decision: 'ESCALATE',
        rationale: 'Customer explicitly requested a human specialist or reported a critical condition (damaged/fraud item) requiring manual staff intervention.',
        confidence: 0.98,
        nextStep: 'Initiate Tier-1 live chat agent handover with order dossier.',
        responseText: `I have escalated your request directly to our **Priority Support Concierge Team** (Ticket **#${escalationTicket?.ticketId || 'TKT-99214'}**).\n\n• **Priority**: High\n• **Assigned Team**: Tier-1 Senior Specialist\n• **Estimated Wait**: Less than 2 minutes\n\nA human team member is reviewing your order history and will join this conversation momentarily.`
      };
    }

    // 2. ASK Check: Ambiguity or Missing Required Entity
    const hasReturn = intents.some(i => i.type === 'RETURN_REFUND_REQUEST');
    if (hasReturn && !order) {
      return {
        decision: 'ASK',
        rationale: 'Customer requested a return/refund but did not specify which order ID to process, and multiple orders exist on account.',
        confidence: 0.92,
        nextStep: 'Prompt customer to select which delivered order they wish to return.',
        responseText: `I would be happy to generate a free prepaid return label for you! Which of your previous orders would you like to return?\n\n• **Order #NM-8410** (Delivered Sep 28 · Essential Hoodie & Perfume)\n• **Order #NM-7921** (Delivered Sep 13 · Artisan Leather Handbag)\n\nPlease reply with the order number or click **View Details** in your Order History.`
      };
    }

    // 3. ACT Check: Actions like Return Label Generation, Live Order Tracking, or Cancellation
    if (returnReceipt && order) {
      return {
        decision: 'ACT',
        rationale: `Policy verification succeeded (Section 3.1: within 30-day window). Tool successfully generated prepaid return label #${returnReceipt.returnId}.`,
        confidence: 0.96,
        nextStep: 'Provide return label barcode and instructions for drop-off.',
        responseText: `✅ **Return Authorized!** Your prepaid return shipping label and QR code have been generated for **Order #${order.id}**.\n\n• **Return ID**: \`${returnReceipt.returnId}\`\n• **Refund Amount**: **$${order.total.toFixed(2)}**\n• **Refund Method**: Reversal to **${order.paymentMethod}** within 48 hours of carrier scan\n• **Carrier**: Drop off at any USPS or FedEx location (prepaid by NovaMart)\n\nA copy of the shipping label has also been sent to your email.`
      };
    }

    const hasTrack = intents.some(i => i.type === 'TRACK_ORDER');
    if (hasTrack && order) {
      const isMulti = intents.length > 1;
      let multiSupplement = '';

      // Check if second intent was product inquiry
      if (products && products.length > 0) {
        multiSupplement = `\n\nAdditionally, here are our recommended matches for your inquiry:`;
      }

      return {
        decision: 'ACT',
        rationale: `Direct database lookup succeeded. Located live shipment for Order #${order.id} with carrier status ${order.status}.`,
        confidence: 0.95,
        nextStep: 'Display interactive shipment timeline card and delivery date.',
        responseText: `I pulled up your order **#${order.id}** (${order.status})! Tracking number: **${order.trackingNumber}**. Estimated delivery is **${order.estimatedDelivery}**.${multiSupplement}`
      };
    }

    const hasCancel = intents.some(i => i.type === 'CANCEL_ORDER');
    if (hasCancel && order) {
      if (policy.isEligible) {
        return {
          decision: 'ACT',
          rationale: `Order #${order.id} is in Processing status prior to carrier handover. Cancellation authorized under Section 4.1.`,
          confidence: 0.94,
          nextStep: 'Trigger cancellation refund and update order state to Cancelled.',
          responseText: `✅ **Order #${order.id} has been cancelled.**\n\nSince this order was still processing at our fulfillment center, we have successfully stopped shipment and refunded **$${order.total.toFixed(2)}** back to your original payment method.`
        };
      } else {
        return {
          decision: 'ANSWER',
          rationale: `Order #${order.id} is already in transit with carrier. Cancellation blocked by policy; customer guided to 30-day return policy.`,
          confidence: 0.95,
          nextStep: 'Explain in-transit policy and offer automated return upon delivery.',
          responseText: `Order **#${order.id}** has already been dispatched with the carrier (**${order.trackingNumber}**) and cannot be cancelled mid-transit.\n\n**Don't worry**: You are fully covered by our **30-Day Risk-Free Return Guarantee**. Once it arrives on **${order.estimatedDelivery}**, you can initiate an instant free return right here for a 100% refund.`
        };
      }
    }

    // 4. ANSWER Check: Factual policy, product advice, or promo queries
    const hasPromo = intents.some(i => i.type === 'PROMO_DISCOUNT');
    if (hasPromo) {
      return {
        decision: 'ANSWER',
        rationale: 'Customer inquired about promotional codes. Retrieved active verified store promo NOVA10.',
        confidence: 0.95,
        nextStep: 'Provide promo code with discount terms and deal link.',
        responseText: `🎉 **Active VIP Savings for Today**:\n\n1. Use code **\`NOVA10\`** at checkout for **10% OFF** your entire order.\n2. **Deal of the Day**: Get **50% OFF** the **Smart Watch Pro** ($59.99 ~~$119.99~~).\n3. **Free Express Shipping** automatically applies to all orders over $75.`
      };
    }

    if (products && products.length > 0) {
      return {
        decision: 'ANSWER',
        rationale: `Retrieved ${products.length} catalog items matching customer specifications.`,
        confidence: 0.92,
        nextStep: 'Render product recommendation attachments with add-to-cart affordance.',
        responseText: `Here are our top-rated recommendations matching your criteria, backed by verified 4.8+ customer reviews:`
      };
    }

    // Default Informational Answer
    return {
      decision: 'ANSWER',
      rationale: 'General store assistance request processed through customer charter guidelines.',
      confidence: 0.9,
      nextStep: 'Offer menu of layered agent capabilities.',
      responseText: `Hello Aryan! I'm **Nova AI**, operating on our **Layered Reasoning System**:\n\n• **Order Tracking**: Ask *"Where is my order #NM-8492?"*\n• **Prepaid Returns**: Ask *"Start a return for my order"*\n• **Policy Checks**: Ask *"What is the return window?"*\n• **Recommendations**: Ask *"Suggest gifts under $50"*\n• **Human Escalation**: Say *"Talk to a human representative"*\n\nHow can I assist you right now?`
    };
  }
}
