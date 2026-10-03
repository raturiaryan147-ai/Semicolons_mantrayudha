import { ChatMessage, Order, Product } from '../types';
import { storeService } from './storeService';

export class NovaAiService {
  async processUserMessage(userText: string): Promise<ChatMessage> {
    const text = userText.trim().toLowerCase();
    const allOrders = storeService.getOrders();
    const allProducts = storeService.getProducts();

    // 1. Order Status / Tracking Query Check
    const orderMatch = userText.match(/NM[- ]?(\d+)/i) || text.match(/track/i) || text.match(/order/i) || text.match(/package/i);
    if (orderMatch) {
      // Find specific order if mentioned
      let targetOrder: Order | undefined;
      const idMatch = userText.match(/NM[- ]?(\d+)/i);
      if (idMatch) {
        targetOrder = allOrders.find(o => o.id.replace('-', '').toLowerCase() === `nm${idMatch[1]}`.toLowerCase());
      } else {
        // Default to the most recent active order
        targetOrder = allOrders.find(o => o.status !== 'Delivered') || allOrders[0];
      }

      if (targetOrder) {
        return {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: `I pulled up your order **#${targetOrder.id}** (${targetOrder.status})! It contains ${targetOrder.items.map(i => i.productName).join(' & ')}. Carrier tracking: **${targetOrder.trackingNumber}**. Estimated delivery is **${targetOrder.estimatedDelivery}**. Here is your real-time shipment breakdown:`,
          relatedOrder: targetOrder,
          actionType: 'view_order'
        };
      }
    }

    // 2. Returns & Refunds Policy
    if (text.includes('return') || text.includes('refund') || text.includes('exchange') || text.includes('money back')) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `### 📦 NovaMart 30-Day Hassle-Free Returns\n\n• **Return Window**: 30 days from delivery date for items in original condition.\n• **Prepaid Shipping**: We generate a free prepaid digital return label directly to your email.\n• **Instant Refund**: Processed back to your original payment method (Visa, Mastercard, or Apple Pay) within 48 hours of warehouse scan.\n• **Need to start a return?** Simply select your order in **Order History** or let me know which order you'd like to return!`,
        actionType: 'return_policy'
      };
    }

    // 3. Discount / Promo Codes
    if (text.includes('promo') || text.includes('discount') || text.includes('coupon') || text.includes('code') || text.includes('sale') || text.includes('deal')) {
      const dealProduct = allProducts.find(p => p.tag === '50% OFF') || allProducts[0];
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `🎉 You have access to exclusive VIP savings today!\n\n1. **Use code \`NOVA10\`** at checkout for **10% OFF** your entire cart.\n2. **Deal of the Day**: Get **50% OFF** the **${dealProduct.name}** ($59.99 ~~$119.99~~) — only limited stock remaining!\n3. **Free Express Shipping** applies automatically to all orders over $75.`,
        relatedProducts: [dealProduct],
        actionType: 'discount_info'
      };
    }

    // 4. Product Recommendations & Search
    let matchedProducts: Product[] = [];
    if (text.includes('watch') || text.includes('fitness') || text.includes('electronic')) {
      matchedProducts = allProducts.filter(p => p.category === 'Electronics');
    } else if (text.includes('bag') || text.includes('handbag') || text.includes('leather')) {
      matchedProducts = allProducts.filter(p => p.imageKey === 'handbag');
    } else if (text.includes('shoe') || text.includes('sneaker') || text.includes('footwear')) {
      matchedProducts = allProducts.filter(p => p.imageKey === 'sneakers');
    } else if (text.includes('hoodie') || text.includes('jacket') || text.includes('men') || text.includes('clothes')) {
      matchedProducts = allProducts.filter(p => p.category === 'Men');
    } else if (text.includes('perfume') || text.includes('scent') || text.includes('serum') || text.includes('beauty') || text.includes('skin')) {
      matchedProducts = allProducts.filter(p => p.category === 'Beauty');
    } else if (text.includes('home') || text.includes('vase') || text.includes('decor')) {
      matchedProducts = allProducts.filter(p => p.category === 'Home & Living');
    } else if (text.includes('under 50') || text.includes('cheap') || text.includes('gift')) {
      matchedProducts = allProducts.filter(p => p.price <= 50);
    }

    if (matchedProducts.length > 0) {
      return {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `I found ${matchedProducts.length} top-rated match${matchedProducts.length > 1 ? 'es' : ''} in our catalog with verified 4.8+ customer reviews and fast shipping:`,
        relatedProducts: matchedProducts.slice(0, 3),
        actionType: 'view_product'
      };
    }

    // 5. Default Intelligent Response
    return {
      id: `msg-${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Hello! I'm **Nova AI**, your dedicated NovaMart shopping assistant. I can help you with:\n\n• **Real-time Order Tracking** (e.g. *"Track my order #NM-8492"*)\n• **Returns & Refunds** (e.g. *"How do 30-day returns work?"*)\n• **Product Advice & Sizing** (e.g. *"Show bestsellers under $50"*)\n• **Active Discounts** (e.g. *"Do you have any promo codes?"*)\n\nWhat can I assist you with today?`
    };
  }
}

export const novaAiService = new NovaAiService();
