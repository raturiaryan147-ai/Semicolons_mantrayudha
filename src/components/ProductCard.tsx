import React, { useState } from 'react';
import { Heart, ShoppingBag, Star, Check, ShieldCheck } from 'lucide-react';
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

  const isOutOfStock = product.status === 'out_of_stock' || product.status === 'discontinued' || product.stockCount === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;
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
      className="group flex flex-col bg-white rounded-3xl p-3.5 border border-stone-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 cursor-pointer relative text-left"
    >
      {/* Visual Container */}
      <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-[#FBFBFA]">
        
        {/* Badges Stack */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          {product.discountPercent && product.discountPercent > 5 ? (
            <span className="text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase bg-[#FF5B26] text-white shadow-xs">
              {Math.round(product.discountPercent)}% OFF
            </span>
          ) : product.tag ? (
            <span className={`text-[10px] font-extrabold tracking-wider px-2 py-0.5 rounded-md uppercase shadow-xs ${
              product.tag === '50% OFF'
                ? 'bg-[#FF5B26] text-white'
                : product.tag === 'BESTSELLER'
                ? 'bg-[#0B3B2C] text-white'
                : 'bg-stone-900 text-white'
            }`}>
              {product.tag}
            </span>
          ) : null}

          {product.brand && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-white/90 text-stone-700 backdrop-blur-xs border border-stone-200 shadow-2xs">
              {product.brand}
            </span>
          )}
        </div>

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

        {/* Out of Stock Dimmer */}
        {isOutOfStock && (
          <div className="absolute inset-0 z-20 bg-stone-900/40 backdrop-blur-[1px] flex items-center justify-center">
            <span className="px-2.5 py-1 bg-white text-stone-900 text-[10px] font-bold uppercase rounded-md shadow-md">
              {product.status === 'discontinued' ? 'Discontinued' : 'Out of Stock'}
            </span>
          </div>
        )}

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
            <span className="font-semibold text-stone-400 uppercase tracking-wider text-[10px] truncate max-w-[120px]">
              {product.subcategory || product.category}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-stone-700 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-stone-400 text-[10px]">({product.reviewCount})</span>
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-stone-900 text-sm leading-snug group-hover:text-[#0B3B2C] transition-colors line-clamp-1">
            {product.name}
          </h3>

          {/* Warranty & Color Specs */}
          <div className="flex items-center gap-2 text-[10px] text-stone-500 mt-1">
            {product.warrantyMonths && (
              <span className="flex items-center gap-0.5 text-emerald-700 font-semibold">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {product.warrantyMonths}M Warranty
              </span>
            )}
            {product.color && (
              <span className="text-stone-400">· {product.color}</span>
            )}
          </div>
        </div>

        {/* Price & Add to Cart button */}
        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-extrabold text-base text-[#0B3B2C] font-mono">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs text-stone-400 line-through font-mono">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.stockCount > 0 && product.stockCount <= 10 && (
              <span className="text-[10px] text-amber-600 font-semibold">
                Only {product.stockCount} left
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`w-9 h-9 rounded-2xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white scale-105'
                : 'bg-[#FF5B26] hover:bg-[#E04815] text-white hover:scale-105 cursor-pointer shadow-xs'
            }`}
            title={isOutOfStock ? 'Out of Stock' : 'Add to cart'}
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
