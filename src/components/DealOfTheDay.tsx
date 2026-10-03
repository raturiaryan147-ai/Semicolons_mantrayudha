import React, { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Flame, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductVisual } from './ProductVisual';

interface DealOfTheDayProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const DealOfTheDay: React.FC<DealOfTheDayProps> = ({
  product,
  onAddToCart,
  onViewDetails
}) => {
  const [added, setAdded] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 12,
    seconds: 45,
    msecs: 30
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let m = prev.msecs - 1;
        let s = prev.seconds;
        let min = prev.minutes;
        let h = prev.hours;

        if (m < 0) {
          m = 99;
          s -= 1;
        }
        if (s < 0) {
          s = 59;
          min -= 1;
        }
        if (min < 0) {
          min = 59;
          h -= 1;
        }
        if (h < 0) {
          h = 23;
        }

        return { hours: h, minutes: min, seconds: s, msecs: m };
      });
    }, 100);

    return () => clearInterval(timer);
  }, []);

  const handleQuickAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-[#FFF6F0] border border-orange-200/70 rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
        
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 relative z-10">
          
          {/* Left Deal Information */}
          <div className="lg:col-span-6 space-y-5 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5B26]/10 text-[#FF5B26] text-xs font-bold uppercase tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Deal of the Day</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#0B3B2C] tracking-tight leading-tight">
              Grab It Before <br />
              <span className="text-[#FF5B26]">It’s Gone!</span>
            </h2>

            <p className="text-stone-600 text-sm sm:text-base font-medium">
              Hurry! Limited flash stock available at exclusive 50% discount.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={handleQuickAdd}
                className="inline-flex items-center gap-2 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold px-7 py-3.5 rounded-full text-sm transition-all shadow-md shadow-orange-500/20 cursor-pointer"
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>ADDED TO CART!</span>
                  </>
                ) : (
                  <>
                    <span>SHOP THE DEAL</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={() => onViewDetails(product)}
                className="px-6 py-3.5 rounded-full border border-stone-300 hover:border-stone-400 text-stone-700 hover:text-stone-900 text-sm font-semibold transition-colors cursor-pointer bg-white"
              >
                View Specifications
              </button>
            </div>

          </div>

          {/* Center/Right Product Visual & Countdown */}
          <div className="lg:col-span-6 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/70 backdrop-blur-sm p-6 rounded-2xl border border-orange-100">
            
            {/* Visual Box */}
            <div 
              onClick={() => onViewDetails(product)}
              className="w-48 h-48 sm:w-56 sm:h-56 shrink-0 cursor-pointer hover:scale-105 transition-transform"
            >
              <ProductVisual
                imageKey={product.imageKey}
                imageUrl={product.imageUrl}
                alt={product.name}
                className="w-full h-full rounded-2xl shadow-sm"
              />
            </div>

            {/* Price & Timer Details */}
            <div className="space-y-4 text-left w-full">
              <div>
                <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">Electronics · Fitness</span>
                <h3 className="text-xl font-bold text-stone-900 leading-snug">{product.name}</h3>
                <p className="text-xs text-stone-500 font-medium">Continuous Health & Sleep Tracking</p>
              </div>

              {/* Price Row */}
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-[#FF5B26] font-mono tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-stone-400 line-through font-mono tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Save ${(product.originalPrice! - product.price).toFixed(2)}
                </span>
              </div>

              {/* Stock Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className="text-stone-700 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#FF5B26] animate-ping" />
                    Only {product.stockCount} items left!
                  </span>
                  <span className="text-[#FF5B26]">85% Claimed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-stone-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-[#FF5B26] rounded-full w-[85%]" />
                </div>
              </div>

              {/* 4 Countdown Blocks */}
              <div className="pt-1">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-stone-900 text-white rounded-xl py-2 px-1">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums leading-none">
                      {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-stone-400 font-semibold tracking-wider uppercase mt-1">HRS</div>
                  </div>

                  <div className="bg-stone-900 text-white rounded-xl py-2 px-1">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums leading-none">
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-stone-400 font-semibold tracking-wider uppercase mt-1">MINS</div>
                  </div>

                  <div className="bg-stone-900 text-white rounded-xl py-2 px-1">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums leading-none">
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-stone-400 font-semibold tracking-wider uppercase mt-1">SECS</div>
                  </div>

                  <div className="bg-[#FF5B26] text-white rounded-xl py-2 px-1 shadow-sm">
                    <div className="text-base sm:text-lg font-bold font-mono tabular-nums leading-none">
                      {String(timeLeft.msecs).padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-white/80 font-semibold tracking-wider uppercase mt-1">MSEC</div>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
