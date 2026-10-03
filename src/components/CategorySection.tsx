import React from 'react';
import { ArrowRight, Smartphone, Laptop, Watch, Headphones, Gamepad2, Camera, Speaker, ShieldCheck } from 'lucide-react';

interface CategorySectionProps {
  onSelectCategory: (category: string) => void;
}

const FEATURED_CATEGORIES = [
  { name: 'Smartphones', icon: Smartphone, count: '30+ Models', color: 'from-blue-500/10 to-indigo-500/10', textColor: 'text-indigo-700' },
  { name: 'Laptops', icon: Laptop, count: '24+ Models', color: 'from-emerald-500/10 to-teal-500/10', textColor: 'text-emerald-700' },
  { name: 'Smartwatches', icon: Watch, count: '20+ Models', color: 'from-amber-500/10 to-orange-500/10', textColor: 'text-amber-700' },
  { name: 'Headphones', icon: Headphones, count: '22+ Models', color: 'from-purple-500/10 to-pink-500/10', textColor: 'text-purple-700' },
  { name: 'Gaming', icon: Gamepad2, count: '22+ Gear', color: 'from-rose-500/10 to-red-500/10', textColor: 'text-rose-700' },
  { name: 'Cameras', icon: Camera, count: '14+ Cameras', color: 'from-cyan-500/10 to-blue-500/10', textColor: 'text-cyan-700' },
  { name: 'Speakers', icon: Speaker, count: '20+ Audio', color: 'from-orange-500/10 to-amber-500/10', textColor: 'text-orange-700' },
  { name: 'Accessories', icon: ShieldCheck, count: '34+ Items', color: 'from-emerald-500/10 to-green-500/10', textColor: 'text-emerald-800' }
];

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
            Shop By Tech Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Browse our 300-device catalog across gadgets, gaming, computing, and smart wearables
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {FEATURED_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.name}
              onClick={() => onSelectCategory(cat.name)}
              className="group flex flex-col items-center bg-white rounded-3xl p-4 border border-stone-200/80 shadow-xs hover:shadow-lg hover:border-emerald-300 transition-all duration-300 cursor-pointer text-center"
            >
              {/* Icon Container */}
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-7 h-7 ${cat.textColor}`} />
              </div>

              {/* Title & Count */}
              <h3 className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-[#0B3B2C] transition-colors truncate max-w-full">
                {cat.name}
              </h3>
              <span className="text-[10px] text-stone-400 font-medium mt-0.5">
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
