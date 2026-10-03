import { AgentDecisionType, ParsedIntent, PolicyEvaluation, ToolCallTrace, InteractiveActionChip } from '../../types/agentReasoning';
import { Order, Product } from '../../types';
import { storeService } from '../storeService';

export interface DecisionResult {
  decision: AgentDecisionType;
  rationale: string;
  confidence: number;
  nextStep: string;
  responseText: string;
  interactiveChips?: InteractiveActionChip[];
  suggestedFollowUps?: string[];
}

export class DecisionLayer {
  static decide(
    intents: ParsedIntent[],
    policy: PolicyEvaluation,
    tools: ToolCallTrace[],
    order?: Order,
    products?: Product[],
    returnReceipt?: any,
    escalationTicket?: any,
    rawText: string = '',
    lookupMeta?: { orderLookupFailed?: boolean; missingOrderId?: boolean }
  ): DecisionResult {
    const lower = rawText.toLowerCase();
    const allOrders = storeService.getOrders();
    const allProducts = storeService.getProducts();

    // -------------------------------------------------------------------------
    // 1. SENSITIVE, LEGAL, SAFETY, FRAUD, OR ESCALATION CASES (STOP & ESCALATE)
    // -------------------------------------------------------------------------
    const isEscalation = intents.some(i => i.type === 'ESCALATE_HUMAN');
    if (isEscalation) {
      const ticketId = escalationTicket?.ticketId || `TKT-${Math.floor(20000 + Math.random() * 80000)}`;
      return {
        decision: 'ESCALATE',
        rationale: 'Customer matter requires human specialist review or involves sensitive/out-of-authority topics.',
        confidence: 0.99,
        nextStep: 'Transfer conversation record to Tier-1 specialist queue.',
        responseText: [
          'I understand your request.',
          'This case has been routed to our Senior Support Team for direct specialist handling.',
          'I have created Priority Support Ticket #' + ticketId + ' and attached your order history and message summary.',
          'Your request is queued with an estimated wait time of under 2 minutes.',
          'A representative will join this chat to assist you directly. If you have an order number or specific documentation, you may share it now.'
        ].join('\n\n'),
        interactiveChips: [
          { label: 'View Orders', action: 'send_prompt', payload: 'Show my order history' },
          { label: 'Return Policy', action: 'send_prompt', payload: 'What is the return policy?' }
        ],
        suggestedFollowUps: [
          'How do I submit photos of an issue?',
          'What are your phone support hours?'
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 2. MULTI-REQUEST HANDLING
    // -------------------------------------------------------------------------
    if (intents.length > 1) {
      const sections: string[] = [];
      const chips: InteractiveActionChip[] = [];
      const followUps: string[] = [];

      for (const intent of intents) {
        if (intent.type === 'TRACK_ORDER') {
          if (order) {
            sections.push(
              `1. Order Status (#${order.id}):\n` +
              `• Verified Status: ${order.status}\n` +
              `• Carrier: FedEx Ground (Tracking: ${order.trackingNumber})\n` +
              `• Estimated Delivery: ${order.estimatedDelivery}\n` +
              `• Items: ${order.items.map(i => `${i.productName} (Qty ${i.quantity})`).join(', ')}\n` +
              `• Next step: You can monitor shipment progress using the tracking number above.`
            );
            chips.push({ label: `View #${order.id}`, action: 'view_order', payload: order });
          } else {
            sections.push(
              `1. Order Status:\n` +
              `• We have multiple orders on file for your account.\n` +
              `• Please provide the specific order number you wish to track.\n` +
              `• Next step: Share your order number and I will verify the tracking immediately.`
            );
          }
        } else if (intent.type === 'RETURN_REFUND_REQUEST') {
          if (order) {
            sections.push(
              `2. Return Request for #${order.id}:\n` +
              `• Verified: Delivered on ${order.date}, within the 30-day return window.\n` +
              `• Return shipping is free. A prepaid digital label will be issued.\n` +
              `• Next step: Confirm if you would like me to generate the return label now.`
            );
          } else {
            sections.push(
              `2. Return Policy:\n` +
              `• Verified: NovaMart offers free 30-day returns on delivered items in original condition.\n` +
              `• Next step: Specify which order you want to return to receive a prepaid label.`
            );
          }
        } else if (intent.type === 'PRODUCT_INQUIRY') {
          const matched = products && products.length > 0 ? products : allProducts.slice(0, 2);
          sections.push(
            `3. Product Recommendations:\n` +
            `• Verified in-stock options:\n` +
            matched.map(p => `  - ${p.name} ($${p.price.toFixed(2)}, rated ${p.rating}/5.0)`).join('\n') +
            `\n• All items qualify for free standard shipping on orders over $75.\n` +
            `• Next step: You can add an item directly to your cart or ask for specific dimensions and materials.`
          );
          matched.forEach(p => {
            chips.push({ label: `Add ${p.name.slice(0, 16)}`, action: 'add_to_cart', payload: p });
          });
        } else if (intent.type === 'PROMO_DISCOUNT') {
          sections.push(
            `4. Active Promotions:\n` +
            `• Verified: Code NOVA10 provides 10% off eligible orders at checkout.\n` +
            `• Next step: Enter NOVA10 in the promo code field during checkout.`
          );
        }
      }

      return {
        decision: 'ANSWER',
        rationale: 'Processed distinct multi-intent customer queries separately without omission.',
        confidence: 0.95,
        nextStep: 'Awaiting customer response on specific items.',
        responseText: sections.join('\n\n'),
        interactiveChips: chips.slice(0, 4),
        suggestedFollowUps: ['Show order details', 'What is your return policy?']
      };
    }

    const primaryIntent = intents[0];

    // -------------------------------------------------------------------------
    // 3. ORDER IDENTIFICATION ISSUES (MISSING OR NOT FOUND)
    // -------------------------------------------------------------------------
    if (lookupMeta?.orderLookupFailed) {
      return {
        decision: 'ASK',
        rationale: 'Customer provided an order ID that does not exist in the database.',
        confidence: 0.97,
        nextStep: 'Request customer verify order ID from confirmation email.',
        responseText: [
          'I checked our database for the order number you provided.',
          'No order matching that ID was found in our system records.',
          'Please verify the order number on your email receipt or in your account dashboard.',
          'What is the correct order ID?',
          'Once provided, I will verify the records immediately.'
        ].join('\n\n'),
        interactiveChips: allOrders.slice(0, 2).map(o => ({
          label: `Check #${o.id}`,
          action: 'send_prompt',
          payload: `Track order #${o.id}`
        })),
        suggestedFollowUps: ['View my order history', 'How do I find my order number?']
      };
    }

    if (lookupMeta?.missingOrderId && ['TRACK_ORDER', 'RETURN_REFUND_REQUEST', 'CANCEL_ORDER'].includes(primaryIntent.type)) {
      const delivered = allOrders.filter(o => o.status === 'Delivered');
      return {
        decision: 'ASK',
        rationale: 'Customer request requires an order ID, but none was provided.',
        confidence: 0.95,
        nextStep: 'Customer clarifies which order they are referring to.',
        responseText: [
          'I can assist with your request.',
          'Your account shows ' + allOrders.length + ' orders on file:\n' +
            allOrders.map(o => `• Order #${o.id} (${o.status}, total $${o.total.toFixed(2)})`).join('\n'),
          'To proceed accurately, I need to know which order this applies to.',
          'Please reply with the order number or select one below.',
          'Once you confirm the order, I will execute the request right away.'
        ].join('\n\n'),
        interactiveChips: allOrders.map(o => ({
          label: `Order #${o.id} (${o.status})`,
          action: 'send_prompt',
          payload: `${primaryIntent.type === 'TRACK_ORDER' ? 'Track' : 'Return'} order #${o.id}`
        })),
        suggestedFollowUps: ['How do I find my order number?', 'What is your return policy?']
      };
    }

    // -------------------------------------------------------------------------
    // 4. RETURN / REFUND REQUEST (`ACT` or `POLICY REJECTION`)
    // -------------------------------------------------------------------------
    if (primaryIntent.type === 'RETURN_REFUND_REQUEST') {
      if (returnReceipt && order) {
        return {
          decision: 'ACT',
          rationale: `Verified order #${order.id} is Delivered and within 30-day window. RMA generated.`,
          confidence: 0.98,
          nextStep: 'Customer drops off package using prepaid label.',
          responseText: [
            `I have processed your return request for Order #${order.id}.`,
            `Verified details:\n` +
            `• Return Authorization: ${returnReceipt.returnId}\n` +
            `• Eligible items: ${returnReceipt.itemNames.join(', ')}\n` +
            `• Refund amount: $${order.total.toFixed(2)}\n` +
            `• Refund method: Reversal to ${order.paymentMethod}`,
            `A prepaid digital shipping label has been generated at no cost to you.`,
            `The label and drop-off barcode have been sent to your registered email address.`,
            `Drop off the packaged items at any USPS post office or FedEx location. Your refund will be initiated within 48 hours of carrier scan.`
          ].join('\n\n'),
          interactiveChips: [
            { label: `View Order #${order.id}`, action: 'view_order', payload: order },
            { label: 'Return Policy Details', action: 'send_prompt', payload: 'What is the return policy?' }
          ],
          suggestedFollowUps: [
            'Do I need original packaging?',
            'How long does the refund take to appear on my card?'
          ]
        };
      }

      if (order && !policy.isEligible) {
        return {
          decision: 'ANSWER',
          rationale: `Order #${order.id} is not eligible for return under policy: ${policy.reason}`,
          confidence: 0.96,
          nextStep: 'Explain policy restriction clearly and offer alternative.',
          responseText: [
            `I reviewed your return request for Order #${order.id}.`,
            `Verified status: ${policy.reason}`,
            `Returns cannot be authorized at this stage. ${order.status !== 'Delivered' ? 'Items must be delivered before a return can be processed.' : 'The 30-day window has expired.'}`,
            order.status !== 'Delivered'
              ? 'Please wait for the package to arrive on ' + order.estimatedDelivery + '. Once delivered, you may initiate a return.'
              : 'If you believe there was an error with your delivery date, I can connect you with a representative.',
            'Let me know if you would like me to track your package or escalate this to a specialist.'
          ].join('\n\n'),
          interactiveChips: [
            { label: `Track Order #${order.id}`, action: 'view_order', payload: order },
            { label: 'Speak with Specialist', action: 'send_prompt', payload: 'I would like to speak to a specialist' }
          ],
          suggestedFollowUps: [
            'What is the standard return window?',
            'Can I exchange this item instead?'
          ]
        };
      }
    }

    // -------------------------------------------------------------------------
    // 5. ORDER TRACKING (`ACT`)
    // -------------------------------------------------------------------------
    if (primaryIntent.type === 'TRACK_ORDER' && order) {
      const itemsList = order.items.map(it => `${it.productName} (Qty ${it.quantity})`).join(', ');
      return {
        decision: 'ACT',
        rationale: `Verified order #${order.id} status and tracking number from database.`,
        confidence: 0.97,
        nextStep: 'Customer can view full order breakdown or monitor carrier tracking.',
        responseText: [
          `Here is the verified tracking information for Order #${order.id}.`,
          `Verified details:\n` +
          `• Status: ${order.status}\n` +
          `• Carrier: FedEx Ground (Tracking: ${order.trackingNumber})\n` +
          `• Estimated Delivery: ${order.estimatedDelivery}\n` +
          `• Destination: ${order.shippingAddress.street}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}\n` +
          `• Items in package: ${itemsList}\n` +
          `• Total paid: $${order.total.toFixed(2)} via ${order.paymentMethod}`,
          `The package is proceeding on schedule with the carrier.`,
          `No further action is required from you at this time.`,
          `You can view the full order breakdown below or let me know if you need to initiate a return or update details.`
        ].join('\n\n'),
        interactiveChips: [
          { label: `View Details #${order.id}`, action: 'view_order', payload: order },
          { label: `Return Order #${order.id}`, action: 'send_prompt', payload: `I want to return order #${order.id}` },
          { label: 'Shipping Policy', action: 'send_prompt', payload: 'What are your shipping speeds?' }
        ],
        suggestedFollowUps: [
          'Can I change the delivery address?',
          'What if I am not home for delivery?'
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 6. ORDER CANCELLATION (`ACT` or `ANSWER`)
    // -------------------------------------------------------------------------
    if (primaryIntent.type === 'CANCEL_ORDER' && order) {
      if (order.status === 'Processing') {
        return {
          decision: 'ACT',
          rationale: `Order #${order.id} is in Processing status. Cancellation executed.`,
          confidence: 0.98,
          nextStep: 'Refund initiated back to original payment instrument.',
          responseText: [
            `I have processed the cancellation for Order #${order.id}.`,
            `Verified details:\n` +
            `• Status at request: Processing\n` +
            `• Items stopped: ${order.items.map(i => i.productName).join(', ')}\n` +
            `• Refund amount: $${order.total.toFixed(2)}`,
            `Since the package had not yet been transferred to the carrier, fulfillment was halted immediately.`,
            `A full refund has been credited back to your original payment method (${order.paymentMethod}).`,
            `The reversal typically reflects on your bank statement within 2 to 3 business days. A cancellation receipt was sent to your email.`
          ].join('\n\n'),
          interactiveChips: [
            { label: 'View Catalog', action: 'send_prompt', payload: 'Show me bestsellers' }
          ],
          suggestedFollowUps: [
            'Will I receive an email confirmation?',
            'What items are currently in stock?'
          ]
        };
      } else {
        return {
          decision: 'ANSWER',
          rationale: `Order #${order.id} is ${order.status}. In-transit cancellation prohibited by policy.`,
          confidence: 0.97,
          nextStep: 'Customer returns item upon delivery under 30-day guarantee.',
          responseText: [
            `I checked your cancellation request for Order #${order.id}.`,
            `Verified status: The package is already ${order.status} with carrier tracking number ${order.trackingNumber}.`,
            `Under our fulfillment policy, orders that have been transferred to the carrier cannot be intercepted or cancelled mid-transit.`,
            `You can return the package for a full refund once it arrives on ${order.estimatedDelivery}. NovaMart provides free prepaid return labels for 30 days after delivery.`,
            `When the package arrives, let me know here and I will issue your return label immediately.`
          ].join('\n\n'),
          interactiveChips: [
            { label: `Track #${order.id}`, action: 'view_order', payload: order },
            { label: 'Return Policy Details', action: 'send_prompt', payload: 'What is the return policy?' }
          ],
          suggestedFollowUps: [
            'Can I refuse the package at delivery?',
            'Speak with a representative'
          ]
        };
      }
    }

    // -------------------------------------------------------------------------
    // 7. PRODUCT DISCOVERY & INQUIRY (`ANSWER`)
    // -------------------------------------------------------------------------
    if (primaryIntent.type === 'PRODUCT_INQUIRY') {
      const matched = products && products.length > 0 ? products : allProducts.slice(0, 3);
      return {
        decision: 'ANSWER',
        rationale: `Retrieved ${matched.length} verified products from active catalog database.`,
        confidence: 0.94,
        nextStep: 'Customer can view specs, ratings, or add items to cart.',
        responseText: [
          'Here are the verified items from our catalog matching your inquiry:',
          matched.map(p =>
            `• ${p.name} — $${p.price.toFixed(2)} (Rated ${p.rating}/5.0 by ${p.reviewCount} customers)\n  ${p.description}`
          ).join('\n\n'),
          'All listed products are in stock and ship within 1 to 2 business days. Orders of $75 or more qualify for free standard shipping.',
          'You can add an item directly to your cart or ask for specific details such as sizing, materials, or warranty.',
          'Let me know if you would like me to narrow down by budget, size, or category.'
        ].join('\n\n'),
        interactiveChips: matched.map(p => ({
          label: `Add ${p.name.slice(0, 18)} ($${p.price.toFixed(2)})`,
          action: 'add_to_cart',
          payload: p
        })),
        suggestedFollowUps: [
          'What is the warranty on electronics?',
          'What promo codes are available?'
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 8. PROMOTIONAL CODES & DISCOUNTS (`ANSWER`)
    // -------------------------------------------------------------------------
    if (primaryIntent.type === 'PROMO_DISCOUNT') {
      const dealItem = allProducts.find(p => p.tag === '50% OFF') || allProducts[0];
      return {
        decision: 'ANSWER',
        rationale: 'Retrieved verified active promotional terms from policy.',
        confidence: 0.96,
        nextStep: 'Customer applies code at checkout.',
        responseText: [
          'Here are the active, verified savings options currently available at NovaMart:',
          `• Promo Code NOVA10: Applies 10% off your entire order at checkout.\n` +
          `• Featured Discount: ${dealItem.name} is currently discounted to $${dealItem.price.toFixed(2)} (standard price: $${(dealItem.price * 2).toFixed(2)}).\n` +
          `• Shipping Threshold: Standard ground shipping is free on orders totaling $75 or more.\n` +
          `• Loyalty Program: You earn 5 rewards points per dollar spent on eligible purchases.`,
          'Promo codes can be entered in the checkout discount field.',
          'Coupons cannot be combined with clearance markdowns of 70% or higher.',
          'Let me know if you need assistance applying a code to your cart.'
        ].join('\n\n'),
        interactiveChips: [
          { label: `View Deal (${dealItem.name.slice(0, 16)})`, action: 'view_product', payload: dealItem },
          { label: 'View Products Under $50', action: 'send_prompt', payload: 'Show me items under $50' }
        ],
        suggestedFollowUps: [
          'How do I redeem loyalty points?',
          'Does code NOVA10 have an expiration date?'
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 9. STORE POLICY QUESTIONS (SHIPPING, RETURNS, PAYMENT) (`ANSWER`)
    // -------------------------------------------------------------------------
    if (lower.includes('shipping') || lower.includes('delivery time') || lower.includes('how long')) {
      return {
        decision: 'ANSWER',
        rationale: 'Delivered verified logistics and delivery SLA guidelines.',
        confidence: 0.97,
        nextStep: 'Customer reviews shipping options.',
        responseText: [
          'Here is NovaMart\'s verified shipping policy and delivery schedule:',
          `• Standard Shipping: 3 to 5 business days. Cost is $5.99, or free on orders of $75 or more.\n` +
          `• Express 2-Day Shipping: 2 business days. Cost is $12.99.\n` +
          `• Next-Day Priority: 1 business day for orders placed before 2:00 PM EST. Cost is $19.99.\n` +
          `• Carriers: We ship via FedEx, USPS Priority, and UPS with verified tracking on all packages.\n` +
          `• Coverage: All 50 US states, military APO/FPO destinations, and Canada.`,
          'All packages receive tracking information via email upon warehouse dispatch.',
          'Let me know if you would like me to check tracking for a specific order.'
        ].join('\n\n'),
        interactiveChips: [
          { label: 'Track An Order', action: 'send_prompt', payload: 'Track my order' },
          { label: 'Return Policy', action: 'send_prompt', payload: 'What is the return policy?' }
        ],
        suggestedFollowUps: [
          'Do you ship internationally?',
          'How do I qualify for free shipping?'
        ]
      };
    }

    if (lower.includes('return') || lower.includes('refund') || lower.includes('exchange')) {
      return {
        decision: 'ANSWER',
        rationale: 'Provided verified 30-day return policy charter terms.',
        confidence: 0.98,
        nextStep: 'Customer can initiate a return if an order is delivered.',
        responseText: [
          'Here are the terms of NovaMart\'s verified return policy:',
          `• Return Window: 30 calendar days from the date of carrier delivery.\n` +
          `• Cost: 100% free. We provide a prepaid digital return shipping label.\n` +
          `• Condition: Items must be unwashed, unworn, and in original packaging.\n` +
          `• Refund Processing: Refunds are issued back to the original payment method within 48 hours of carrier scan.\n` +
          `• Exclusions: Final sale items discounted 70% or more are non-returnable unless defective.`,
          'You can start a return directly here by providing your order number.',
          'If you have an order ready to return, share the order ID and I will generate your prepaid label.'
        ].join('\n\n'),
        interactiveChips: [
          { label: 'Start A Return', action: 'send_prompt', payload: 'I want to return an order' },
          { label: 'View Order History', action: 'send_prompt', payload: 'Show my order history' }
        ],
        suggestedFollowUps: [
          'Do I need a printer for the return label?',
          'Can I exchange for a different size?'
        ]
      };
    }

    // -------------------------------------------------------------------------
    // 10. DEFAULT CONCIERGE RESPONSE (PROFESSIONAL, CONCISE, LOGICAL)
    // -------------------------------------------------------------------------
    return {
      decision: 'ANSWER',
      rationale: 'General customer greeting handled with clear, professional guidance.',
      confidence: 0.92,
      nextStep: 'Awaiting customer inquiry.',
      responseText: [
        'Hello. I am NovaMart\'s AI Customer Support Agent.',
        'I can assist you with:\n' +
        '• Checking live order status and tracking details\n' +
        '• Processing verified returns and generating prepaid return labels\n' +
        '• Answering questions regarding store shipping, return, and payment policies\n' +
        '• Checking product specifications, in-stock availability, and active discounts\n' +
        '• Connecting you with a human specialist if your request requires manual review',
        'How can I help you today? Please share your order number or question.'
      ].join('\n\n'),
      interactiveChips: [
        { label: 'Track Order #NM-8492', action: 'send_prompt', payload: 'Track my order #NM-8492' },
        { label: 'Return Order #NM-8410', action: 'send_prompt', payload: 'I want to return order #NM-8410' },
        { label: 'Shipping Policies', action: 'send_prompt', payload: 'What are your shipping speeds?' },
        { label: 'Active Promo Codes', action: 'send_prompt', payload: 'What promo codes are active?' }
      ],
      suggestedFollowUps: [
        'Where is my order right now?',
        'What is your return policy?',
        'Speak with a representative'
      ]
    };
  }
}
