import React, { useState } from 'react';

interface CategoryVisualProps {
  category: 'Women' | 'Men' | 'Home & Living' | 'Beauty' | 'Electronics';
}

const CATEGORY_IMAGES: Record<string, string> = {
  'Women': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
  'Men': 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
  'Home & Living': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=600&q=80',
  'Beauty': 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=600&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=600&q=80',
};

export const CategoryVisual: React.FC<CategoryVisualProps> = ({ category }) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const imageUrl = CATEGORY_IMAGES[category];

  if (imageUrl && !imageError) {
    return (
      <div className="w-full h-full bg-[#F4F4F1] rounded-2xl overflow-hidden relative group-hover:scale-105 transition-transform duration-500">
        {!isLoaded && <div className="absolute inset-0 bg-[#EFEFEA] animate-pulse" />}
        <img
          src={imageUrl}
          alt={category}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
      </div>
    );
  }

  // Fallback vector representation
  switch (category) {
    case 'Women':
      return (
        <div className="w-full h-40 bg-[#F5EDE4] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-md" fill="none">
            <path d="M40 30 C45 20, 75 20, 80 30 L95 65 L78 68 L70 45 L60 55 L50 45 L42 68 L25 65 Z" fill="#D4B996" />
            <path d="M50 45 L50 110 L70 110 L70 45 Z" fill="#C2A47F" />
            <circle cx="85" cy="75" r="14" fill="#A0522D" />
            <path d="M75 50 C75 35, 95 35, 95 65" stroke="#78350F" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      );

    case 'Men':
      return (
        <div className="w-full h-40 bg-[#EDF2EE] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-md" fill="none">
            <path d="M38 32 C44 24, 76 24, 82 32 L98 62 L82 66 L74 46 L60 52 L46 46 L38 66 L22 62 Z" fill="#4B6043" />
            <path d="M46 46 L46 110 L74 110 L74 46 Z" fill="#3D5036" />
            <rect x="49" y="58" width="10" height="12" rx="2" fill="#2E3C29" />
            <rect x="61" y="58" width="10" height="12" rx="2" fill="#2E3C29" />
          </svg>
        </div>
      );

    case 'Home & Living':
      return (
        <div className="w-full h-40 bg-[#FAF4ED] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-md" fill="none">
            <rect x="35" y="55" width="40" height="26" rx="6" fill="#0B3B2C" />
            <path d="M30 45 C30 35, 80 35, 80 45 L80 65 L30 65 Z" fill="#14532D" />
            <line x1="38" y1="81" x2="32" y2="105" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <line x1="72" y1="81" x2="78" y2="105" stroke="#92400E" strokeWidth="3" strokeLinecap="round" />
            <circle cx="92" cy="70" r="12" fill="#22C55E" opacity="0.8" />
            <rect x="86" y="80" width="12" height="14" rx="2" fill="#C2410C" />
          </svg>
        </div>
      );

    case 'Beauty':
      return (
        <div className="w-full h-40 bg-[#FFF2EB] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-md" fill="none">
            <rect x="32" y="42" width="22" height="52" rx="6" fill="#FBBF24" />
            <rect x="37" y="32" width="12" height="10" rx="2" fill="#78350F" />
            <rect x="62" y="28" width="28" height="66" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1.5" />
            <rect x="70" y="16" width="12" height="12" rx="3" fill="#D97706" />
            <circle cx="76" cy="62" r="5" fill="#FF5B26" opacity="0.3" />
          </svg>
        </div>
      );

    case 'Electronics':
      return (
        <div className="w-full h-40 bg-[#EDF3F7] rounded-2xl flex items-center justify-center p-3 relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
          <svg viewBox="0 0 120 120" className="w-24 h-24 drop-shadow-md" fill="none">
            <path d="M30 70 C30 35, 90 35, 90 70" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" fill="none" />
            <rect x="24" y="62" width="14" height="28" rx="6" fill="#0F172A" />
            <rect x="82" y="62" width="14" height="28" rx="6" fill="#0F172A" />
            <circle cx="60" cy="85" r="16" fill="#1E293B" />
            <circle cx="60" cy="85" r="12" fill="#090D16" />
            <circle cx="60" cy="85" r="8" stroke="#FF5B26" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      );
  }
};
