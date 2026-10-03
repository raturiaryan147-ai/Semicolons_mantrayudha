import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../types';
import { ProductVisual } from './ProductVisual';

interface ProductCardProps {
  product: Product;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onViewDetails
}) => {
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product.id);
  };

  return (
    <div
      onClick={() => onViewDetails(product)}
      className="group flex flex-col bg-white rounded-3xl p-3.5 border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-emerald-200 transition-all duration-300 cursor-pointer relative"
    >
      {/* Visual Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FBFBFA]">
        
        {/* Badge (NEW, 50% OFF, etc) */}
        {product.tag && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase ${
              product.tag === '50% OFF'
                ? 'bg-[#FF5B26] text-white'
                : product.tag === 'BESTSELLER'
                ? 'bg-[#0B3B2C] text-white'
                : 'bg-stone-900 text-white'
            }`}>
              {product.tag}
            </span>
          </div>
        )}

        {/* Wishlist Heart Button */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500'
              : 'bg-white/80 text-stone-500 hover:text-rose-500 hover:bg-white'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
        </button>

        {/* Product Visual */}
        <ProductVisual 
          imageKey={product.imageKey}
          imageUrl={product.imageUrl}
          alt={product.name}
          className="w-full h-full group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Product Information */}
      <div className="pt-3.5 pb-1 px-1 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-xs text-stone-500 mb-1">
            <span className="font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
              {product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-[#0B3B2C] transition-colors line-clamp-1">
            {product.name}
          </h3>
        </div>

        {/* Price & Add to Cart Action */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-extrabold text-stone-900 font-mono tabular-nums">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && (
                <span className="text-xs text-stone-400 line-through font-mono tabular-nums">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Cart Button */}
          <button
            onClick={handleAddToCart}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-stone-100 hover:bg-[#FF5B26] text-stone-700 hover:text-white'
            }`}
            title="Add to Cart"
          >
            {justAdded ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : (
              <ShoppingBag className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
