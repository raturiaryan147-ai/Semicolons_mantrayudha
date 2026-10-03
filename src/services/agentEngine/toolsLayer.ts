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
  } {
    const toolsCalled: ToolCallTrace[] = [];
    let retrievedOrder: Order | undefined;
    let retrievedProducts: Product[] | undefined;
    let returnReceipt: any;
    let escalationTicket: any;

    const allOrders = storeService.getOrders();
    const allProducts = storeService.getProducts();

    // Tool 1: Order Fetch (Only called if tracking, returning, or cancelling an order)
    const needsOrder = intents.some(i => ['TRACK_ORDER', 'RETURN_REFUND_REQUEST', 'CANCEL_ORDER'].includes(i.type));
    if (needsOrder) {
      if (orderId) {
        retrievedOrder = allOrders.find(o => o.id.toUpperCase() === orderId.toUpperCase() || o.id.replace('-', '') === orderId.replace('-', ''));
      }
      if (!retrievedOrder) {
        // Fall back to most recent order if unstated
        retrievedOrder = allOrders.find(o => o.status !== 'Delivered') || allOrders[0];
      }

      toolsCalled.push({
        toolName: 'storeService.fetchOrderDetails',
        parameters: { orderId: retrievedOrder?.id || orderId || 'LATEST' },
        executionStatus: retrievedOrder ? 'success' : 'failed',
        resultSummary: retrievedOrder 
          ? `Found Order #${retrievedOrder.id} (${retrievedOrder.status}) with ${retrievedOrder.items.length} items, total $${retrievedOrder.total.toFixed(2)}.`
          : `Order lookup failed for query "${orderId}".`,
        dataPayload: retrievedOrder
      });
    }

    // Tool 2: Initiate Return (Only called if eligible return request with order)
    const hasReturn = intents.some(i => i.type === 'RETURN_REFUND_REQUEST');
    if (hasReturn && retrievedOrder && retrievedOrder.status === 'Delivered') {
      const returnId = `RET-${Math.floor(1000 + Math.random() * 9000)}`;
      returnReceipt = {
        returnId,
        orderId: retrievedOrder.id,
        itemNames: retrievedOrder.items.map(i => i.productName),
        refundAmount: retrievedOrder.total,
        status: 'Label Generated - Ready to Ship' as const,
        refundMethod: `Original instrument: ${retrievedOrder.paymentMethod}`,
        dropoffCarrier: 'USPS Priority or FedEx Drop Box (Prepaid)'
      };

      toolsCalled.push({
        toolName: 'logisticsService.generatePrepaidReturnLabel',
        parameters: {
          orderId: retrievedOrder.id,
          itemsCount: retrievedOrder.items.length,
          refundAmount: retrievedOrder.total,
          carrier: 'FedEx / USPS'
        },
        executionStatus: 'success',
        resultSummary: `Generated prepaid return QR & label #${returnId}. Estimated refund: $${retrievedOrder.total.toFixed(2)} within 48h of scan.`,
        dataPayload: returnReceipt
      });
    }

    // Tool 3: Product Catalog Search (Only called if product inquiry or discovery)
    const productIntent = intents.find(i => i.type === 'PRODUCT_INQUIRY' || i.type === 'PROMO_DISCOUNT');
    if (productIntent) {
      const cat = productIntent.extractedEntities.category;
      const budget = productIntent.extractedEntities.maxBudget;

      let matched = allProducts;
      if (cat) {
        matched = matched.filter(p => p.category === cat);
      }
      if (budget) {
        matched = matched.filter(p => p.price <= budget);
      }

      retrievedProducts = matched.slice(0, 3);

      toolsCalled.push({
        toolName: 'catalogService.queryProducts',
        parameters: { category: cat || 'ALL', maxBudget: budget || 'UNRESTRICTED' },
        executionStatus: 'success',
        resultSummary: `Retrieved ${retrievedProducts.length} verified products matching criteria from warehouse inventory.`,
        dataPayload: retrievedProducts
      });
    }

    // Tool 4: Escalate to Human Support Ticket (Only called if escalation intent)
    const hasEscalate = intents.some(i => i.type === 'ESCALATE_HUMAN');
    if (hasEscalate) {
      const ticketId = `TKT-${Math.floor(20000 + Math.random() * 80000)}`;
      escalationTicket = {
        ticketId,
        status: 'Pending Assignment' as const,
        priority: 'High' as const,
        assignedTeam: 'Priority Tier-1 Support Concierge',
        estimatedWaitTime: '< 2 minutes'
      };

      toolsCalled.push({
        toolName: 'crmService.createEscalationTicket',
        parameters: {
          ticketId,
          priority: 'High',
          orderId: retrievedOrder?.id,
          channel: 'Live Support Handover'
        },
        executionStatus: 'success',
        resultSummary: `Dispatched high-priority customer support ticket #${ticketId} to Tier-1 Concierge.`,
        dataPayload: escalationTicket
      });
    }

    return {
      toolsCalled,
      retrievedOrder,
      retrievedProducts,
      returnReceipt,
      escalationTicket
    };
  }
}
