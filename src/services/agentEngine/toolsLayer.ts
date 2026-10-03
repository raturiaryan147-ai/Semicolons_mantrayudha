import { ToolCallTrace } from '../../types/agentReasoning';
import { storeService } from '../storeService';
import { Order, Product } from '../../types';

export class ToolsLayer {
  static executeTools(
    intents: Array<{ type: string; extractedEntities: any }>,
    orderId?: string
  ): {
    toolsCalled: ToolCallTrace[];
    retrievedOrder?: Order;
    retrievedProducts?: Product[];
    returnReceipt?: any;
    escalationTicket?: any;
    orderLookupFailed?: boolean;
    missingOrderId?: boolean;
  } {
    const toolsCalled: ToolCallTrace[] = [];
    let retrievedOrder: Order | undefined;
    let retrievedProducts: Product[] | undefined;
    let returnReceipt: any;
    let escalationTicket: any;
    let orderLookupFailed = false;
    let missingOrderId = false;

    const allOrders = storeService.getOrders();
    const allProducts = storeService.getProducts();

    // 1. Order Fetch Tool
    const needsOrder = intents.some(i => ['TRACK_ORDER', 'RETURN_REFUND_REQUEST', 'CANCEL_ORDER'].includes(i.type));
    if (needsOrder) {
      if (orderId) {
        const cleanId = orderId.toUpperCase().replace(/\s+/g, '');
        retrievedOrder = allOrders.find(
          o => o.id.toUpperCase() === cleanId || o.id.replace('-', '').toUpperCase() === cleanId.replace('-', '')
        );

        if (retrievedOrder) {
          toolsCalled.push({
            toolName: 'database.verifyOrderRecord',
            parameters: { orderId: retrievedOrder.id },
            executionStatus: 'success',
            resultSummary: `Verified Order #${retrievedOrder.id} in system: Status ${retrievedOrder.status}, ${retrievedOrder.items.length} items, total $${retrievedOrder.total.toFixed(2)}.`,
            dataPayload: retrievedOrder
          });
        } else {
          orderLookupFailed = true;
          toolsCalled.push({
            toolName: 'database.verifyOrderRecord',
            parameters: { orderId },
            executionStatus: 'failed',
            resultSummary: `Order lookup returned zero records for ID "${orderId}".`,
            dataPayload: null
          });
        }
      } else {
        // Essential information missing: customer did not provide order ID
        missingOrderId = true;
        toolsCalled.push({
          toolName: 'database.verifyOrderRecord',
          parameters: { query: 'unspecified_order_id' },
          executionStatus: 'skipped',
          resultSummary: 'Order ID not provided in request. Clarification required.',
          dataPayload: null
        });
      }
    }

    // 2. Return Authorization Tool (Strict Verification: Order must exist and be Delivered)
    const hasReturn = intents.some(i => i.type === 'RETURN_REFUND_REQUEST');
    if (hasReturn && retrievedOrder && retrievedOrder.status === 'Delivered') {
      const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      returnReceipt = {
        returnId,
        orderId: retrievedOrder.id,
        itemNames: retrievedOrder.items.map(i => i.productName),
        refundAmount: retrievedOrder.total,
        status: 'Label Generated - Ready to Ship' as const,
        refundMethod: `Reversal to ${retrievedOrder.paymentMethod}`,
        dropoffCarrier: 'USPS Priority or FedEx Ground (Prepaid)'
      };

      toolsCalled.push({
        toolName: 'logistics.issueReturnLabel',
        parameters: {
          orderId: retrievedOrder.id,
          refundAmount: retrievedOrder.total,
          carrier: 'FedEx / USPS Prepaid'
        },
        executionStatus: 'success',
        resultSummary: `Generated prepaid return RMA #${returnId} for $${retrievedOrder.total.toFixed(2)}.`,
        dataPayload: returnReceipt
      });
    }

    // 3. Product Catalog Query Tool
    const productIntent = intents.find(i => i.type === 'PRODUCT_INQUIRY' || i.type === 'PROMO_DISCOUNT');
    if (productIntent) {
      const cat = productIntent.extractedEntities?.category;
      const budget = productIntent.extractedEntities?.maxBudget;

      let matched = allProducts;
      if (cat) {
        matched = matched.filter(p => p.category === cat);
      }
      if (budget) {
        matched = matched.filter(p => p.price <= budget);
      }

      retrievedProducts = matched.slice(0, 3);

      toolsCalled.push({
        toolName: 'inventory.queryVerifiedCatalog',
        parameters: { category: cat || 'ALL', maxBudget: budget || 'NONE' },
        executionStatus: 'success',
        resultSummary: `Retrieved ${retrievedProducts.length} verified in-stock items.`,
        dataPayload: retrievedProducts
      });
    }

    // 4. Escalation Tool (For human handover or sensitive cases)
    const hasEscalate = intents.some(i => i.type === 'ESCALATE_HUMAN');
    if (hasEscalate) {
      const ticketId = `TKT-${Math.floor(20000 + Math.random() * 80000)}`;
      escalationTicket = {
        ticketId,
        status: 'Pending Assignment' as const,
        priority: 'High' as const,
        assignedTeam: 'Tier-1 Customer Support Specialist',
        estimatedWaitTime: 'Under 2 minutes'
      };

      toolsCalled.push({
        toolName: 'support.createEscalationTicket',
        parameters: { ticketId, priority: 'High' },
        executionStatus: 'success',
        resultSummary: `Created ticket #${ticketId} and queued for human specialist.`,
        dataPayload: escalationTicket
      });
    }

    return {
      toolsCalled,
      retrievedOrder,
      retrievedProducts,
      returnReceipt,
      escalationTicket,
      orderLookupFailed,
      missingOrderId
    };
  }
}
