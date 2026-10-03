import React from 'react';
import { Truck, RotateCcw, Award, Headphones } from 'lucide-react';

interface ValuePropsStripProps {
  onOpenAiSupport: () => void;
}

export const ValuePropsStrip: React.FC<ValuePropsStripProps> = ({ onOpenAiSupport }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-[#FFF8F3] border border-orange-100/60 rounded-2xl py-6 px-4 sm:px-8 grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        
        {/* Item 1 */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#0B3B2C] shrink-0 border border-stone-200/60">
            <Truck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Free Shipping</h4>
            <p className="text-[11px] text-stone-500 font-medium">On orders over $75</p>
          </div>
        </div>

        {/* Item 2 */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#0B3B2C] shrink-0 border border-stone-200/60">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Easy Returns</h4>
            <p className="text-[11px] text-stone-500 font-medium">30-day risk-free returns</p>
          </div>
        </div>

        {/* Item 3 */}
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#0B3B2C] shrink-0 border border-stone-200/60">
            <Award className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900">Premium Quality</h4>
            <p className="text-[11px] text-stone-500 font-medium">100% verified authentic</p>
          </div>
        </div>

        {/* Item 4 */}
        <button
          onClick={onOpenAiSupport}
          className="flex items-center gap-3.5 text-left group cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xs text-[#FF5B26] shrink-0 border border-stone-200/60 group-hover:scale-105 transition-transform">
            <Headphones className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-1.5">
              <span>24/7 Support</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </h4>
            <p className="text-[11px] text-stone-500 font-medium">Ask Nova AI anytime</p>
          </div>
        </button>

      </div>
    </section>
  );
};
