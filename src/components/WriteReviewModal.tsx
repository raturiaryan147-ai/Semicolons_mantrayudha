import React, { useState } from 'react';
import { X, Star, Check } from 'lucide-react';
import { Product, Review } from '../types';

interface WriteReviewModalProps {
  product: Product | null;
  products: Product[];
  onClose: () => void;
  onSubmit: (review: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  product,
  products,
  onClose,
  onSubmit
}) => {
  const [selectedProductId, setSelectedProductId] = useState(product?.id || products[0]?.id || '');
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [userName, setUserName] = useState('Aryan Raturi');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const currentProd = products.find(p => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !comment.trim() || !currentProd) return;

    onSubmit({
      productId: currentProd.id,
      productName: currentProd.name,
      userName: userName.trim() || 'Verified Shopper',
      rating,
      title: title.trim(),
      comment: comment.trim(),
      verified: true
    });

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-stone-100 p-6 sm:p-8 text-left relative animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div>
            <h3 className="text-xl font-bold text-[#0B3B2C]">Write a Review</h3>
            <p className="text-xs text-stone-500 mt-0.5">Share your authentic experience with the NovaMart community</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h4 className="text-lg font-bold text-stone-900">Review Submitted!</h4>
            <p className="text-xs text-stone-500">Thank you for helping other shoppers make better decisions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Product Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Product
              </label>
              <select
                value={selectedProductId}
                onChange={e => setSelectedProductId(e.target.value)}
                className="w-full bg-[#F5F5F3] text-stone-900 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
              >
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            {/* Star Rating Picker */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Overall Rating
              </label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-600 ml-2">
                  {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Average' : 'Could be better'}
                </span>
              </div>
            </div>

            {/* Reviewer Name */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={e => setUserName(e.target.value)}
                placeholder="e.g. Aryan R."
                className="w-full bg-[#F5F5F3] text-stone-900 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
                required
              />
            </div>

            {/* Review Headline */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Review Headline
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Summarize your experience (e.g. Incredibly comfy and durable)"
                className="w-full bg-[#F5F5F3] text-stone-900 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400"
                required
              />
            </div>

            {/* Review Details */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Detailed Feedback
              </label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                rows={3}
                placeholder="What did you love? How was the fit, material, packaging or delivery?"
                className="w-full bg-[#F5F5F3] text-stone-900 text-xs font-medium px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-stone-400 resize-none"
                required
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-[#FF5B26] hover:bg-[#F04F1B] text-white font-bold py-3 rounded-full text-xs transition-colors shadow-md shadow-orange-500/20 cursor-pointer"
              >
                SUBMIT VERIFIED REVIEW
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  );
};
