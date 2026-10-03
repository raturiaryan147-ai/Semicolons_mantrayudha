import React, { useState } from 'react';
import { X, ShoppingBag, Trash2, ArrowRight, Tag, Truck, ShieldCheck, Check } from 'lucide-react';
import { CartItem, UserProfile, Order } from '../types';
import { ProductVisual } from './ProductVisual';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: (discountAmount: number, code: string) => void;
  profile: UserProfile;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
  profile
}) => {
  if (!isOpen) return null;

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>({
    code: 'NOVA10',
    percent: 10
  });
  const [promoError, setPromoError] = useState('');

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountAmount = appliedDiscount ? (subtotal * appliedDiscount.percent) / 100 : 0;
  const isFreeShipping = subtotal >= 75 || subtotal === 0;
  const shippingFee = isFreeShipping ? 0 : 9.99;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const freeShippingThreshold = 75;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    const code = promoCode.trim().toUpperCase();
    if (code === 'NOVA10' || code === 'WELCOME10') {
      setAppliedDiscount({ code, percent: 10 });
      setPromoCode('');
    } else if (code === 'VIP20') {
      setAppliedDiscount({ code, percent: 20 });
      setPromoCode('');
    } else {
      setPromoError('Invalid coupon. Try NOVA10 for 10% off.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between text-left relative"
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#0B3B2C]" />
            <h3 className="font-extrabold text-base text-stone-900">Your Shopping Cart</h3>
            <span className="bg-[#0B3B2C] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/70 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Free Shipping Progress Indicator */}
        <div className="px-5 py-3 bg-[#FFF8F3] border-b border-orange-100 text-xs">
          <div className="flex items-center justify-between font-bold text-stone-800 mb-1.5">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-[#FF5B26]" />
              {isFreeShipping ? (
                <span className="text-emerald-800">You unlocked FREE Express Shipping!</span>
              ) : (
                <span>Add ${amountToFreeShipping.toFixed(2)} more for FREE Shipping</span>
              )}
            </span>
            <span className="text-[#FF5B26] font-mono">{Math.round(freeShippingProgress)}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-stone-200 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-[#FF5B26] rounded-full transition-all duration-300"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-stone-800">Your bag is empty</h4>
              <p className="text-xs text-stone-500 max-w-xs">
                Browse our new arrivals and grab exclusive 50% discount deals today.
              </p>
              <button
                onClick={onClose}
                className="mt-2 bg-[#FF5B26] text-white px-6 py-2.5 rounded-full text-xs font-bold hover:bg-[#F04F1B] transition-colors cursor-pointer shadow-md shadow-orange-500/20"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            cartItems.map((item) => (
              <div
                key={item.product.id}
                className="flex items-start justify-between gap-3 p-3 bg-stone-50/70 rounded-2xl border border-stone-200/60"
              >
                <div className="w-16 h-16 rounded-xl bg-white p-1 border border-stone-200 shrink-0 overflow-hidden">
                  <ProductVisual
                    imageKey={item.product.imageKey}
                    imageUrl={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full"
                  />
                </div>

                <div className="flex-1 text-left">
                  <h4 className="text-xs font-bold text-stone-900 leading-snug line-clamp-1">
                    {item.product.name}
                  </h4>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    ${item.product.price.toFixed(2)} each
                    {item.selectedColor && ` · ${item.selectedColor}`}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center bg-white rounded-lg border border-stone-200 px-1 py-0.5 shadow-2xs">
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-5 h-5 text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-mono font-bold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-5 h-5 text-stone-600 hover:text-stone-900 font-bold text-xs flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.product.id)}
                      className="text-stone-400 hover:text-rose-500 p-1 cursor-pointer transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold font-mono text-stone-900 tabular-nums">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer Calculation */}
        {cartItems.length > 0 && (
          <div className="p-5 border-t border-stone-200 bg-white space-y-3">
            
            {/* Promo code form */}
            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={e => setPromoCode(e.target.value)}
                placeholder="Promo Code (try NOVA10)"
                className="flex-1 bg-stone-50 border border-stone-200 text-stone-900 text-xs px-3 py-2 rounded-xl focus:outline-none uppercase"
              />
              <button
                type="submit"
                className="bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
              >
                Apply
              </button>
            </form>

            {promoError && (
              <p className="text-[11px] text-rose-500">{promoError}</p>
            )}

            {appliedDiscount && (
              <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-100">
                <span className="font-semibold flex items-center gap-1">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  Promo {appliedDiscount.code} applied ({appliedDiscount.percent}% OFF)
                </span>
                <button
                  onClick={() => setAppliedDiscount(null)}
                  className="text-stone-400 hover:text-stone-800 font-bold"
                >
                  ×
                </button>
              </div>
            )}

            {/* Calculations Breakdown */}
            <div className="space-y-1.5 text-xs text-stone-600 pt-1">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-mono text-stone-900 font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              {appliedDiscount && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>VIP Discount</span>
                  <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-mono text-stone-900 font-semibold">
                  {shippingFee === 0 ? 'FREE' : `$${shippingFee.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-stone-900 pt-2 border-t border-stone-100">
                <span>Estimated Total</span>
                <span className="text-[#FF5B26] font-mono">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => onCheckout(discountAmount, appliedDiscount?.code || '')}
              className="w-full bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold py-3.5 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer"
            >
              <span>PROCEED TO CHECKOUT · ${total.toFixed(2)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-4 text-[10px] text-stone-400 font-medium pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                256-Bit Encrypted
              </span>
              <span>·</span>
              <span>30-Day Money Back Guarantee</span>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
