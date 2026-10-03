import React, { useState } from 'react';
import { Package, Truck, Clock, ArrowRight, Bot, Search, ExternalLink } from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';
import { ProductVisual } from './ProductVisual';

interface OrderHistorySectionProps {
  orders: Order[];
  onViewOrderDetails: (order: Order) => void;
  onAskAi: (order: Order) => void;
  onShopNow: () => void;
}

export const OrderHistorySection: React.FC<OrderHistorySectionProps> = ({
  orders,
  onViewOrderDetails,
  onAskAi,
  onShopNow
}) => {
  const [filter, setFilter] = useState<'All' | 'In Transit' | 'Delivered' | 'Processing'>('All');
  const [searchOrder, setSearchOrder] = useState('');

  const filteredOrders = orders.filter(order => {
    if (filter !== 'All' && order.status !== filter) return false;
    if (searchOrder.trim()) {
      const q = searchOrder.toLowerCase();
      const matchId = order.id.toLowerCase().includes(q);
      const matchTrack = order.trackingNumber.toLowerCase().includes(q);
      const matchItem = order.items.some(i => i.productName.toLowerCase().includes(q));
      return matchId || matchTrack || matchItem;
    }
    return true;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
            Your Order History
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track active shipments, download receipts, and manage returns
          </p>
        </div>

        <button
          onClick={onShopNow}
          className="inline-flex items-center gap-2 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold px-6 py-2.5 rounded-full text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mb-6">
        
        {/* Status filter tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['All', 'In Transit', 'Delivered', 'Processing'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filter === tab
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Quick Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search order ID or item..."
            value={searchOrder}
            onChange={e => setSearchOrder(e.target.value)}
            className="w-full bg-stone-50 text-stone-900 placeholder-stone-400 pl-8 pr-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200 focus:outline-none focus:border-stone-400"
          />
        </div>

      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
            <Package className="w-12 h-12 text-stone-300 mx-auto" />
            <h4 className="text-base font-bold text-stone-800">No orders found</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any orders matching your selected criteria. Ready to start shopping?
            </p>
            <button
              onClick={onShopNow}
              className="mt-2 bg-[#0B3B2C] text-white px-5 py-2 rounded-full text-xs font-bold hover:bg-[#07251C] transition-colors cursor-pointer"
            >
              Explore NovaMart Collections
            </button>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              className="bg-white rounded-3xl border border-stone-200/80 p-5 sm:p-6 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all space-y-4"
            >
              {/* Order Meta Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-base font-extrabold text-stone-900">
                    Order #{order.id}
                  </span>
                  <span className="text-xs text-stone-400 font-medium">·</span>
                  <span className="text-xs text-stone-500 font-medium">{order.date}</span>
                  <span className="text-xs text-stone-400 font-medium">·</span>
                  <span className="text-xs font-mono font-bold text-stone-900">${order.total.toFixed(2)}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    order.status === 'Delivered'
                      ? 'bg-emerald-100 text-emerald-800'
                      : order.status === 'In Transit'
                      ? 'bg-amber-100 text-amber-900'
                      : 'bg-stone-200 text-stone-800'
                  }`}>
                    {order.status === 'In Transit' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                    )}
                    {order.status}
                  </span>

                  <button
                    onClick={() => onViewOrderDetails(order)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5B26] hover:underline cursor-pointer"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Products Thumbnails & Summary */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                
                {/* Product previews */}
                <div className="md:col-span-8 flex flex-wrap items-center gap-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 p-2 bg-[#FBFBFA] rounded-2xl border border-stone-200/60 max-w-xs"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white p-1 border border-stone-200 shrink-0 overflow-hidden">
                        <ProductVisual
                          imageKey={item.imageKey}
                          imageUrl={storeService.getProductById(item.productId)?.imageUrl}
                          alt={item.productName}
                          className="w-full h-full"
                        />
                      </div>
                      <div className="text-left pr-2">
                        <div className="text-xs font-bold text-stone-900 line-clamp-1">{item.productName}</div>
                        <div className="text-[10px] text-stone-500 mt-0.5">
                          Qty: {item.quantity} · ${item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Quick Action Button */}
                <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col items-start md:items-end justify-between gap-2 text-left md:text-right">
                  <div>
                    <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                      Tracking Number
                    </div>
                    <div className="text-xs font-mono font-bold text-stone-700">
                      {order.trackingNumber}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      {order.status === 'Delivered' ? 'Delivered successfully' : `Estimated: ${order.estimatedDelivery}`}
                    </div>
                  </div>

                  <button
                    onClick={() => onAskAi(order)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0B3B2C] text-xs font-bold border border-emerald-200/80 transition-colors cursor-pointer group mt-1"
                  >
                    <Bot className="w-3.5 h-3.5 text-[#FF8149] group-hover:scale-110 transition-transform" />
                    <span>Track with Nova AI</span>
                  </button>
                </div>

              </div>

            </div>
          ))
        )}
      </div>

    </section>
  );
};
