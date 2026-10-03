import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, ArrowUpDown, X } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface ProductsCatalogProps {
  products: Product[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  wishlist: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  products,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  setSearchQuery,
  wishlist,
  onToggleWishlist,
  onAddToCart,
  onViewDetails
}) => {
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  const categories = ['All', 'Women', 'Men', 'Home & Living', 'Beauty', 'Electronics'];

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
            Explore All Products
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Premium quality essentials with 30-day money-back guarantee and free shipping over $75
          </p>
        </div>

        <div className="text-xs font-semibold text-stone-500">
          Showing <span className="text-[#FF5B26] font-bold font-mono">{filteredProducts.length}</span> of {products.length} products
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0B3B2C] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort and Search controls */}
        <div className="flex items-center gap-3">
          
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full text-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400" />
            <span className="font-bold text-stone-600">Sort:</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-1 bg-orange-50 text-[#FF5B26] px-3 py-1.5 rounded-full text-xs font-bold hover:bg-orange-100 transition-colors cursor-pointer"
            >
              <span>Clear "{searchQuery}"</span>
              <X className="w-3 h-3" />
            </button>
          )}

        </div>

      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500 space-y-3">
          <p className="text-base font-bold text-stone-800">No products match your search or filter</p>
          <p className="text-xs text-stone-400">Try choosing another category or clearing your search term.</p>
          <button
            onClick={() => {
              onSelectCategory('All');
              setSearchQuery('');
            }}
            className="mt-2 bg-[#FF5B26] text-white px-5 py-2 rounded-full text-xs font-bold cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWishlisted={wishlist.includes(product.id)}
              onToggleWishlist={onToggleWishlist}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}

    </section>
  );
};
