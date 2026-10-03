import React, { useState } from 'react';
import { X, Star, ShoppingBag, ShieldCheck, Truck, RotateCcw, Heart, Check, MessageSquare } from 'lucide-react';
import { Product, Review } from '../types';
import { ProductVisual } from './ProductVisual';

interface ProductDetailsModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color?: string, size?: string) => void;
  onBuyNow: (product: Product, quantity: number, color?: string, size?: string) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  reviews: Review[];
  onOpenWriteReview: (product: Product) => void;
}

export const ProductDetailsModal: React.FC<ProductDetailsModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
  reviews,
  onOpenWriteReview
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name);
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [addedAnimation, setAddedAnimation] = useState(false);

  const productReviews = reviews.filter(r => r.productId === product.id);

  const handleAdd = () => {
    onAddToCart(product, quantity, selectedColor, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 2000);
  };

  const handleBuy = () => {
    onBuyNow(product, quantity, selectedColor, selectedSize);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        className="relative bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden border border-stone-100 my-auto text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header bar with close */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500">
            <span>Catalog</span>
            <span>/</span>
            <span className="text-[#0B3B2C]">{product.category}</span>
            <span>/</span>
            <span className="text-stone-900 truncate max-w-[200px]">{product.name}</span>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[80vh] overflow-y-auto">
          
          {/* Left Visual Area */}
          <div className="md:col-span-6 bg-[#FBFBFA] p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-100">
            <div className="w-full aspect-square max-w-sm rounded-2xl overflow-hidden relative">
              <ProductVisual
                imageKey={product.imageKey}
                imageUrl={product.imageUrl}
                alt={product.name}
                className="w-full h-full shadow-inner"
              />
              
              {product.tag && (
                <span className="absolute top-4 left-4 text-xs font-extrabold px-3 py-1 rounded-full uppercase bg-[#FF5B26] text-white">
                  {product.tag}
                </span>
              )}

              <button
                onClick={() => onToggleWishlist(product.id)}
                className={`absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-md ${
                  isWishlisted ? 'bg-rose-50 text-rose-500' : 'bg-white text-stone-600 hover:text-rose-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {/* Quick trust strip under image */}
            <div className="grid grid-cols-3 gap-2 w-full max-w-sm mt-4 text-center">
              <div className="bg-white p-2 rounded-xl border border-stone-200/60 text-[10px] text-stone-600">
                <Truck className="w-3.5 h-3.5 text-[#0B3B2C] mx-auto mb-1" />
                <span>Fast Express</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-200/60 text-[10px] text-stone-600">
                <RotateCcw className="w-3.5 h-3.5 text-[#0B3B2C] mx-auto mb-1" />
                <span>30-Day Return</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-stone-200/60 text-[10px] text-stone-600">
                <ShieldCheck className="w-3.5 h-3.5 text-[#0B3B2C] mx-auto mb-1" />
                <span>Authentic</span>
              </div>
            </div>
          </div>

          {/* Right Product Purchase Module */}
          <div className="md:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category & Rating */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md">
                  {product.category}
                </span>
                
                <button
                  onClick={() => setActiveTab(activeTab === 'overview' ? 'reviews' : 'overview')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 hover:text-[#0B3B2C] cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-stone-400">({product.reviewCount} customer reviews)</span>
                </button>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 leading-tight">
                {product.name}
              </h1>

              {/* Pricing Box */}
              <div className="flex items-baseline gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/60">
                <span className="text-3xl font-extrabold text-[#FF5B26] font-mono tabular-nums">
                  ${product.price.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="text-base text-stone-400 line-through font-mono tabular-nums">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                    Save {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>In Stock — {product.stockCount} units available for dispatch today</span>
              </div>

              {/* Tab Selector: Overview vs Reviews */}
              <div className="flex border-b border-stone-200 gap-4 text-xs font-bold pt-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'overview'
                      ? 'border-[#0B3B2C] text-[#0B3B2C]'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  Product Highlights
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'reviews'
                      ? 'border-[#0B3B2C] text-[#0B3B2C]'
                      : 'border-transparent text-stone-400 hover:text-stone-700'
                  }`}
                >
                  <span>Verified Reviews</span>
                  <span className="bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded-full text-[10px]">
                    {productReviews.length}
                  </span>
                </button>
              </div>

              {/* Tab Content 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  <p className="text-stone-600 text-sm leading-relaxed">
                    {product.description}
                  </p>

                  {/* Bullet features */}
                  <div className="space-y-1.5">
                    {product.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-stone-700">
                        <Check className="w-3.5 h-3.5 text-[#0B3B2C] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Color Selector */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-stone-700 mb-2">
                        Select Color: <span className="font-normal text-stone-500">{selectedColor}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {product.colors.map(color => (
                          <button
                            key={color.name}
                            onClick={() => setSelectedColor(color.name)}
                            className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                              selectedColor === color.name ? 'ring-2 ring-stone-900 ring-offset-2 scale-110' : 'border-stone-300'
                            }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size Selector */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="pt-2">
                      <label className="block text-xs font-bold text-stone-700 mb-2">
                        Select Size: <span className="font-normal text-stone-500">{selectedSize}</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {product.sizes.map(size => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              selectedSize === size
                                ? 'bg-[#0B3B2C] text-white shadow-xs'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tab Content 2: Embedded Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-h-60 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-700">
                      Customer Feedback
                    </span>
                    <button
                      onClick={() => onOpenWriteReview(product)}
                      className="text-xs font-bold text-[#FF5B26] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Write Review</span>
                    </button>
                  </div>

                  {productReviews.length === 0 ? (
                    <div className="p-4 bg-stone-50 rounded-xl text-center text-xs text-stone-500">
                      No reviews yet for this product. Be the first to review!
                    </div>
                  ) : (
                    productReviews.map(r => (
                      <div key={r.id} className="p-3 bg-stone-50 rounded-xl border border-stone-200/50 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-900">{r.userName}</span>
                          <span className="text-stone-400 text-[10px]">{r.date}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                            />
                          ))}
                          {r.verified && (
                            <span className="ml-2 text-[10px] text-emerald-700 font-semibold">Verified Buyer</span>
                          )}
                        </div>
                        <div className="font-semibold text-stone-800">{r.title}</div>
                        <p className="text-stone-600 text-[11px] leading-relaxed">{r.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              )}

            </div>

            {/* Bottom Purchase Bar */}
            <div className="pt-4 border-t border-stone-100 space-y-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-stone-100 rounded-full p-1 border border-stone-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stockCount, quantity + 1))}
                    className="w-8 h-8 rounded-full bg-white hover:bg-stone-50 text-stone-700 flex items-center justify-center font-bold text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart CTA */}
                <button
                  onClick={handleAdd}
                  className="flex-1 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold py-3.5 px-4 rounded-full text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {addedAnimation ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>ADDED TO CART!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART · ${(product.price * quantity).toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Direct Button */}
              <button
                onClick={handleBuy}
                className="w-full bg-[#0B3B2C] hover:bg-[#07261C] active:scale-95 text-white font-bold py-3 rounded-full text-xs sm:text-sm transition-all cursor-pointer"
              >
                BUY NOW WITH 1-CLICK
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
