import React from 'react';
import { X, Package, Truck, Clock, CheckCircle2, Bot, MapPin, CreditCard, ChevronRight } from 'lucide-react';
import { Order } from '../types';
import { storeService } from '../services/storeService';
import { ProductVisual } from './ProductVisual';

interface OrderDetailModalProps {
  order: Order | null;
  onClose: () => void;
  onAskAi: (order: Order) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  onClose,
  onAskAi
}) => {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-stone-100 my-auto text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-stone-900">Order #{order.id}</span>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                order.status === 'Delivered'
                  ? 'bg-emerald-100 text-emerald-800'
                  : order.status === 'In Transit'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-stone-200 text-stone-800'
              }`}>
                {order.status}
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">Placed on {order.date}</p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer border border-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Tracking Strip */}
          <div className="bg-[#FFF8F3] border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#FF5B26]">
                Shipment Tracking
              </div>
              <div className="text-xs font-bold text-stone-900 font-mono mt-0.5">
                {order.trackingNumber}
              </div>
              <div className="text-xs text-stone-600 mt-0.5">
                Estimated Delivery: <span className="font-bold text-stone-900">{order.estimatedDelivery}</span>
              </div>
            </div>

            {/* Ask Nova AI Button */}
            <button
              onClick={() => onAskAi(order)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#0B3B2C] hover:bg-[#07291F] text-white text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
            >
              <Bot className="w-4 h-4 text-[#FF8149] group-hover:scale-110 transition-transform" />
              <span>Ask Nova AI About Order</span>
            </button>
          </div>

          {/* Stepper Timeline */}
          <div>
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-4">
              Real-Time Tracking Progress
            </h4>
            
            <div className="relative pl-6 space-y-5 border-l-2 border-stone-200 ml-3">
              {order.timeline.map((step, idx) => (
                <div key={idx} className="relative text-left">
                  {/* Step node dot */}
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                    step.completed
                      ? 'border-[#0B3B2C] text-[#0B3B2C]'
                      : 'border-stone-300 text-stone-300'
                  }`}>
                    {step.completed && (
                      <div className="w-2 h-2 rounded-full bg-[#0B3B2C]" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`font-bold ${step.completed ? 'text-stone-900' : 'text-stone-400'}`}>
                        {step.status}
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">{step.date}</span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Itemized Products */}
          <div className="pt-2 border-t border-stone-100">
            <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-3">
              Items Ordered ({order.items.reduce((s, i) => s + i.quantity, 0)})
            </h4>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl bg-white p-1 border border-stone-200 shrink-0 overflow-hidden">
                      <ProductVisual
                        imageKey={item.imageKey}
                        imageUrl={storeService.getProductById(item.productId)?.imageUrl}
                        alt={item.productName}
                        className="w-full h-full"
                      />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-stone-900">{item.productName}</h5>
                      <div className="text-[11px] text-stone-500 mt-0.5 flex items-center gap-2">
                        <span>Qty: {item.quantity}</span>
                        {item.selectedColor && <span>· Color: {item.selectedColor}</span>}
                        {item.selectedSize && <span>· Size: {item.selectedSize}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-stone-900 font-mono tabular-nums">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-[10px] text-stone-400">
                      ${item.price.toFixed(2)} each
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Shipping Address & Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100 text-xs">
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <MapPin className="w-3.5 h-3.5 text-[#0B3B2C]" />
                <span>Shipping Address</span>
              </div>
              <p className="font-semibold text-stone-900">{order.shippingAddress.name}</p>
              <p className="text-stone-600">{order.shippingAddress.street}</p>
              <p className="text-stone-600">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
            </div>

            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <CreditCard className="w-3.5 h-3.5 text-[#0B3B2C]" />
                <span>Payment Summary</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Payment:</span>
                <span className="font-medium text-stone-900">{order.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Subtotal:</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Discount:</span>
                  <span className="font-mono">-${order.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>Shipping:</span>
                <span className="font-mono">{order.shipping === 0 ? 'FREE' : `$${order.shipping.toFixed(2)}`}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total Paid:</span>
                <span className="text-[#FF5B26] font-mono text-sm">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-100 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
