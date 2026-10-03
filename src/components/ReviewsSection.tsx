import React, { useState } from 'react';
import { Star, ThumbsUp, CheckCircle, MessageSquare, Filter } from 'lucide-react';
import { Review, Product } from '../types';

interface ReviewsSectionProps {
  reviews: Review[];
  products: Product[];
  onOpenWriteReview: (product?: Product) => void;
  onUpvoteReview: (reviewId: string) => void;
  onSelectProduct?: (productId: string) => void;
}

export const ReviewsSection: React.FC<ReviewsSectionProps> = ({
  reviews,
  products,
  onOpenWriteReview,
  onUpvoteReview,
  onSelectProduct
}) => {
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | null>(null);
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('all');

  const filteredReviews = reviews.filter(r => {
    if (selectedRatingFilter && r.rating !== selectedRatingFilter) return false;
    if (selectedProductFilter !== 'all' && r.productId !== selectedProductFilter) return false;
    return true;
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '4.8';

  const starCounts = [5, 4, 3, 2, 1].map(star => {
    const count = reviews.filter(r => r.rating === star).length;
    const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
    return { star, count, percentage };
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0B3B2C] tracking-tight">
            Customer Reviews & Ratings
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Real feedback from verified NovaMart buyers across North America
          </p>
        </div>

        <button
          onClick={() => onOpenWriteReview()}
          className="inline-flex items-center gap-2 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold px-6 py-3 rounded-full text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
        >
          <MessageSquare className="w-4 h-4" />
          <span>Write a Review</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Rating Overview Card */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-6 text-left">
          
          <div className="flex items-center gap-4">
            <div className="text-4xl sm:text-5xl font-extrabold text-stone-900 font-mono">
              {averageRating}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-xs font-semibold text-stone-500 mt-1">
                Based on {totalReviews} verified reviews
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-stone-100">
            <div className="text-xs font-bold text-stone-700 mb-3">Rating Breakdown</div>
            <div className="space-y-2">
              {starCounts.map(({ star, count, percentage }) => (
                <button
                  key={star}
                  onClick={() => setSelectedRatingFilter(selectedRatingFilter === star ? null : star)}
                  className={`w-full flex items-center gap-2 text-xs transition-opacity hover:opacity-80 cursor-pointer ${
                    selectedRatingFilter === star ? 'font-bold text-[#FF5B26]' : 'text-stone-600'
                  }`}
                >
                  <span className="w-12 text-left shrink-0">{star} stars</span>
                  <div className="flex-1 h-2 rounded-full bg-stone-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedRatingFilter === star ? 'bg-[#FF5B26]' : 'bg-amber-400'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-stone-400 font-mono text-[11px] shrink-0">
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Guarantee stamp */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100 text-xs text-emerald-900 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">100% Authentic Feedback:</span>
              <p className="text-[11px] text-emerald-800/80 mt-0.5">
                Every review is submitted by customers with verified order history.
              </p>
            </div>
          </div>

        </div>

        {/* Right Reviews List & Filters */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-stone-400" />
              <span className="font-bold text-stone-600">Filter by Product:</span>
              <select
                value={selectedProductFilter}
                onChange={e => setSelectedProductFilter(e.target.value)}
                className="bg-stone-50 border border-stone-200 text-stone-800 rounded-lg px-2.5 py-1 text-xs font-medium focus:outline-none"
              >
                <option value="all">All Products ({reviews.length})</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedRatingFilter && (
              <div className="flex items-center gap-2">
                <span className="bg-orange-50 text-[#FF5B26] px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5">
                  Filtered by {selectedRatingFilter} Stars
                  <button onClick={() => setSelectedRatingFilter(null)} className="hover:text-stone-900 cursor-pointer">×</button>
                </span>
              </div>
            )}
          </div>

          {/* Review Cards Grid */}
          <div className="space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 text-stone-500">
                <p className="text-sm font-semibold">No reviews match the selected filter.</p>
                <button
                  onClick={() => {
                    setSelectedRatingFilter(null);
                    setSelectedProductFilter('all');
                  }}
                  className="mt-3 text-xs text-[#FF5B26] font-bold hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              filteredReviews.map(r => (
                <div
                  key={r.id}
                  className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-3 text-left transition-all hover:border-emerald-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#0B3B2C] text-white flex items-center justify-center text-xs font-bold">
                        {r.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">{r.userName}</span>
                          {r.verified && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                              <CheckCircle className="w-3 h-3" />
                              <span>Verified Purchase</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-stone-400">{r.date}</span>
                      </div>
                    </div>

                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Product tag */}
                  <div className="inline-block bg-stone-100 text-stone-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    Purchased: {r.productName}
                  </div>

                  {/* Review Title & Body */}
                  <h4 className="text-sm font-bold text-stone-900">{r.title}</h4>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">{r.comment}</p>

                  {/* Helpful vote action */}
                  <div className="pt-2 flex items-center justify-between text-xs border-t border-stone-100">
                    <button
                      onClick={() => onUpvoteReview(r.id)}
                      className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-900 transition-colors cursor-pointer text-[11px] font-semibold"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Helpful ({r.helpfulCount})</span>
                    </button>

                    <span className="text-stone-400 text-[10px]">Was this review helpful?</span>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>

      </div>

    </section>
  );
};
