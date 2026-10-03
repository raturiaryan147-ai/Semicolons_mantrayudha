import React from 'react';
import { ArrowRight, Tag, ShieldCheck, Truck, Sparkles } from 'lucide-react';
import { HeroVisual } from './ProductVisual';

interface HeroSectionProps {
  onExplore: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onExplore }) => {
  return (
    <section className="relative px-4 sm:px-6 lg:px-8 pt-4 pb-8 max-w-7xl mx-auto">
      <div className="relative bg-gradient-to-br from-[#0B3B2C] via-[#093527] to-[#06241B] rounded-3xl md:rounded-[36px] overflow-hidden text-white shadow-xl shadow-emerald-950/15">
        
        {/* Subtle decorative dot pattern */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 px-6 sm:px-10 lg:px-14 py-10 lg:py-16 relative z-10">
          
          {/* Left Hero Copy */}
          <div className="lg:col-span-7 space-y-6 text-left">
            
            {/* Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold uppercase tracking-wider text-emerald-200">
              <Sparkles className="w-3.5 h-3.5 text-[#FF8149]" />
              <span>Limited Time Only</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-white">
              Shop More,{' '}
              <span className="text-[#FF5B26] block sm:inline">Save More!</span>
            </h1>

            {/* Subtitle */}
            <p className="text-stone-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Discover amazing deals on your favorite products. Handcrafted leather, premium audio, signature fragrances, and modern lifestyle essentials.
            </p>

            {/* 3 Feature Guarantee Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <Tag className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Best Prices</div>
                  <div className="text-[10px] text-stone-300">Guaranteed</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Secure</div>
                  <div className="text-[10px] text-stone-300">Payments</div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-2xl p-2.5 backdrop-blur-sm">
                <div className="w-8 h-8 rounded-xl bg-emerald-400/10 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-emerald-300" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Fast Delivery</div>
                  <div className="text-[10px] text-stone-300">Worldwide</div>
                </div>
              </div>
            </div>

            {/* Primary Orange CTA */}
            <div className="pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center gap-2.5 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all shadow-lg shadow-orange-950/30 cursor-pointer group"
              >
                <span>EXPLORE COLLECTION</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

          {/* Right Hero Product Composition */}
          <div className="lg:col-span-5 flex items-center justify-center">
            <HeroVisual />
          </div>

        </div>
      </div>
    </section>
  );
};
