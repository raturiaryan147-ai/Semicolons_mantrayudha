import React, { useState } from 'react';
import { X, Check, ShieldCheck, CreditCard, MapPin, Truck } from 'lucide-react';
import { CartItem, UserProfile, UserAddress, Order } from '../types';
import { ProductVisual } from './ProductVisual';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  profile: UserProfile;
  discount: number;
  onPlaceOrder: (address: UserAddress, paymentMethod: string) => Order;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  profile,
  discount,
  onPlaceOrder
}) => {
  if (!isOpen) return null;

  const defaultAddr = profile.addresses.find(a => a.isDefault) || profile.addresses[0];
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?.id || '');
  const [selectedPayment, setSelectedPayment] = useState('Visa ending in 4242');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shipping = subtotal >= 75 ? 0 : 9.99;
  const total = Math.max(0, subtotal - discount + shipping);

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    const chosenAddr = profile.addresses.find(a => a.id === selectedAddressId) || defaultAddr;
    setTimeout(() => {
      onPlaceOrder(chosenAddr, selectedPayment);
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-100 p-6 sm:p-8 text-left relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-100">
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">Confirm & Place Order</h3>
            <p className="text-xs text-stone-500 mt-0.5">Review shipping destination and payment details</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          
          {/* Shipping Address Selection */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#0B3B2C]" />
              <span>Delivery Address</span>
            </label>
            <div className="space-y-2">
              {profile.addresses.map(addr => (
                <div
                  key={addr.id}
                  onClick={() => setSelectedAddressId(addr.id)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start justify-between ${
                    selectedAddressId === addr.id
                      ? 'border-[#0B3B2C] bg-emerald-50/40 ring-1 ring-[#0B3B2C]'
                      : 'border-stone-200 bg-stone-50 hover:bg-stone-100'
                  }`}
                >
                  <div>
                    <span className="font-bold text-stone-900">{addr.title}:</span>{' '}
                    <span className="text-stone-700">{addr.street}, {addr.city}, {addr.state} {addr.zip}</span>
                  </div>
                  {selectedAddressId === addr.id && (
                    <Check className="w-4 h-4 text-[#0B3B2C] shrink-0 ml-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#0B3B2C]" />
              <span>Payment Option</span>
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { name: 'Visa ending in 4242', label: 'Visa Card' },
                { name: 'Apple Pay', label: 'Apple Pay 1-Touch' },
                { name: 'Mastercard ending in 8819', label: 'Mastercard' },
                { name: 'Cash on Delivery (COD)', label: 'Pay on Delivery' }
              ].map(opt => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => setSelectedPayment(opt.name)}
                  className={`p-2.5 rounded-xl border font-semibold text-left transition-all cursor-pointer ${
                    selectedPayment === opt.name
                      ? 'border-[#0B3B2C] bg-emerald-50 text-[#0B3B2C]'
                      : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[10px] text-stone-500 font-mono mt-0.5">{opt.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Items Summary Strip */}
          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Items Total ({cartItems.reduce((s, i) => s + i.quantity, 0)})</span>
              <span className="font-mono font-bold">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>VIP Discount</span>
                <span className="font-mono">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>Express Shipping</span>
              <span className="font-mono font-bold">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-200">
              <span>Amount to Pay</span>
              <span className="text-[#FF5B26] font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            onClick={handleConfirmOrder}
            disabled={isSubmitting}
            className="w-full bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 disabled:opacity-50 text-white font-bold py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Authorizing & Placing Order...</span>
            ) : (
              <span>CONFIRM ORDER · ${total.toFixed(2)}</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
