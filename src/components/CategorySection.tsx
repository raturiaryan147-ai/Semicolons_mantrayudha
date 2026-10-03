import React from 'react';
import { ArrowRight } from 'lucide-react';
import { CategoryVisual } from './CategoryVisual';

interface CategorySectionProps {
  onSelectCategory: (category: 'Women' | 'Men' | 'Home & Living' | 'Beauty' | 'Electronics') => void;
}

const CATEGORIES: Array<{
  name: 'Women' | 'Men' | 'Home & Living' | 'Beauty' | 'Electronics';
  count: string;
}> = [
  { name: 'Women', count: '120+ Items' },
  { name: 'Men', count: '85+ Items' },
  { name: 'Home & Living', count: '64+ Items' },
  { name: 'Beauty', count: '92+ Items' },
  { name: 'Electronics', count: '48+ Items' }
];

export const CategorySection: React.FC<CategorySectionProps> = ({ onSelectCategory }) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
            Shop By Category
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Curated collections crafted for every corner of your lifestyle
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className="group flex flex-col bg-white rounded-3xl p-3 border border-stone-200/80 shadow-xs hover:shadow-lg hover:border-emerald-200 transition-all duration-300 cursor-pointer text-center"
          >
            {/* Visual Frame */}
            <div className="overflow-hidden rounded-2xl mb-3 aspect-[4/5] bg-[#F7F7F5]">
              <CategoryVisual category={cat.name} />
            </div>

            {/* Title & Shop Now */}
            <div className="py-1">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 group-hover:text-[#0B3B2C] transition-colors">
                {cat.name}
              </h3>
              <div className="inline-flex items-center gap-1 text-xs font-semibold text-stone-600 group-hover:text-[#FF5B26] mt-1 transition-colors">
                <span>Shop Now</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
