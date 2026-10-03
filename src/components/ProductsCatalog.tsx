import React, { useState, useMemo } from 'react';
import { Filter, SlidersHorizontal, Search, ArrowUpDown, X, Cloud, Check, Loader2, Tag } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';
import { storeService } from '../services/storeService';

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
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating' | 'discount'>('featured');
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState<number>(32);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Compute categories dynamically from current dataset
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [products]);

  // Compute brands dynamically
  const brands = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.brand) set.add(p.brand);
    });
    return ['All', ...Array.from(set).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchBrand = selectedBrand === 'All' || p.brand === selectedBrand;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch = !query || 
        p.name.toLowerCase().includes(query) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(query)) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);
      return matchCat && matchBrand && matchSearch;
    });

    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'discount') {
      result.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
    }

    return result;
  }, [products, selectedCategory, selectedBrand, searchQuery, sortBy]);

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  const handleSyncToFirestore = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const res = await storeService.syncCatalogToFirestore();
      if (res.success) {
        setSyncMessage(`✓ Synced ${res.count} products to Firebase!`);
      } else {
        setSyncMessage('Sync finished');
      }
    } catch (e) {
      setSyncMessage('Sync error');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncMessage(null), 4000);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-left">
      
      {/* Title & Subtitle */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
              Explore Products Catalog
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold border border-emerald-300">
              300 Live Products
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Complete database of tech accessories, devices, smart gear with manufacturer warranties and 30-day returns
          </p>
        </div>

        {/* Database Sync Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSyncToFirestore}
            disabled={isSyncing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0B3B2C] hover:bg-[#07241A] text-white text-xs font-bold rounded-full transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Upload and sync all 300 products to Firebase Firestore"
          >
            {isSyncing ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : syncMessage ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-[#FF8149]" />
            )}
            <span>{syncMessage || (isSyncing ? 'Writing to Firestore...' : 'Sync to Database')}</span>
          </button>

          <div className="text-xs font-semibold text-stone-500">
            Showing <span className="text-[#FF5B26] font-bold font-mono">{displayedProducts.length}</span> of {filteredProducts.length}
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="bg-white p-3.5 rounded-3xl border border-stone-200/80 shadow-xs mb-8 flex flex-col gap-3">
        
        {/* Category Pills (Horizontal Scroll) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                onSelectCategory(cat);
                setVisibleCount(32);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#0B3B2C] text-white shadow-xs'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Brand & Sort controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-100">
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full text-xs">
              <Tag className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-bold text-stone-600">Brand:</span>
              <select
                value={selectedBrand}
                onChange={e => {
                  setSelectedBrand(e.target.value);
                  setVisibleCount(32);
                }}
                className="bg-transparent text-stone-900 font-semibold focus:outline-none cursor-pointer"
              >
                {brands.map(b => (
                  <option key={b} value={b}>{b === 'All' ? 'All Brands' : b}</option>
                ))}
              </select>
            </div>

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
                <option value="discount">Biggest Discount %</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Active Search Filter Badge */}
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
          <p className="text-xs text-stone-400">Try choosing another category, brand, or clearing your search term.</p>
          <button
            onClick={() => {
              onSelectCategory('All');
              setSelectedBrand('All');
              setSearchQuery('');
            }}
            className="mt-2 bg-[#FF5B26] text-white px-5 py-2 rounded-full text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayedProducts.map((product) => (
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

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="text-center mt-10">
              <button
                onClick={() => setVisibleCount(prev => prev + 32)}
                className="px-8 py-3 rounded-full bg-white hover:bg-[#0B3B2C] text-[#0B3B2C] hover:text-white font-bold text-xs uppercase tracking-wider border-2 border-[#0B3B2C] transition-all cursor-pointer shadow-sm hover:shadow-lg active:scale-95"
              >
                Load More Products ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}

    </section>
  );
};
