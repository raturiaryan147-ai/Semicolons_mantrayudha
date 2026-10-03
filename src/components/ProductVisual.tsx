import React, { useState } from 'react';

interface ProductVisualProps {
  imageKey: string;
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export const ProductVisual: React.FC<ProductVisualProps> = ({
  imageKey,
  imageUrl,
  alt = 'NovaMart Product',
  className = ''
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // If realistic photo URL is provided and has not errored, render it with smooth fade-in
  if (imageUrl && !imageError) {
    return (
      <div className={`relative w-full h-full overflow-hidden bg-[#FBFBFA] flex items-center justify-center ${className}`}>
        {/* Soft skeleton / background placeholder while loading */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#F4F4F1] animate-pulse" />
        )}
        <img
          src={imageUrl}
          alt={alt}
          referrerPolicy="no-referrer"
          loading="lazy"
          onLoad={() => setIsLoaded(true)}
          onError={() => setImageError(true)}
          className={`w-full h-full object-cover object-center transition-all duration-500 ${
            isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
          }`}
        />
      </div>
    );
  }

  // Graceful fallback to crisp vector design
  switch (imageKey) {
    case 'smartwatch':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#F1F3F2] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <div className="absolute w-36 h-36 bg-amber-500/5 rounded-full blur-2xl" />
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-xl" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sw-strap" x1="100" y1="0" x2="100" y2="200" gradientUnits="userSpaceOnUse">
                <stop stopColor="#1E293B" />
                <stop offset="0.5" stopColor="#0F172A" />
                <stop offset="1" stopColor="#1E293B" />
              </linearGradient>
              <linearGradient id="sw-case" x1="60" y1="50" x2="140" y2="150" gradientUnits="userSpaceOnUse">
                <stop stopColor="#334155" />
                <stop offset="1" stopColor="#090D16" />
              </linearGradient>
              <linearGradient id="sw-screen" x1="70" y1="60" x2="130" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#0A0F1D" />
                <stop offset="1" stopColor="#030712" />
              </linearGradient>
              <linearGradient id="ring-orange" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#FF5B26" />
                <stop offset="1" stopColor="#F59E0B" />
              </linearGradient>
              <linearGradient id="ring-emerald" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#10B981" />
                <stop offset="1" stopColor="#065F46" />
              </linearGradient>
            </defs>
            <path d="M72 15 C72 12, 76 10, 80 10 L120 10 C124 10, 128 12, 128 15 L126 55 L74 55 Z" fill="url(#sw-strap)" />
            <path d="M74 145 L126 145 L128 185 C128 188, 124 190, 120 190 L80 190 C76 190, 72 188, 72 185 Z" fill="url(#sw-strap)" />
            <rect x="58" y="48" width="84" height="104" rx="22" fill="url(#sw-case)" stroke="#475569" strokeWidth="2.5" />
            <rect x="142" y="76" width="6" height="18" rx="3" fill="#64748B" />
            <rect x="142" y="106" width="4" height="12" rx="2" fill="#475569" />
            <rect x="66" y="56" width="68" height="88" rx="16" fill="url(#sw-screen)" />
            <path d="M68 62 C85 62, 115 75, 124 95" stroke="rgba(255,255,255,0.18)" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="94" r="24" stroke="#1E293B" strokeWidth="5" fill="none" />
            <circle cx="100" cy="94" r="24" stroke="url(#ring-orange)" strokeWidth="5" strokeDasharray="150" strokeDashoffset="40" strokeLinecap="round" fill="none" />
            <circle cx="100" cy="94" r="17" stroke="#1E293B" strokeWidth="4.5" fill="none" />
            <circle cx="100" cy="94" r="17" stroke="url(#ring-emerald)" strokeWidth="4.5" strokeDasharray="100" strokeDashoffset="30" strokeLinecap="round" fill="none" />
            <text x="100" y="99" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="system-ui">09:42</text>
            <text x="100" y="112" textAnchor="middle" fill="#94A3B8" fontSize="6" fontFamily="system-ui">142 BPM · 6.4 KM</text>
          </svg>
        </div>
      );

    case 'hoodie':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#F1EFEA] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hoodie-fabric" x1="100" y1="20" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#E0CEB5" />
                <stop offset="0.6" stopColor="#D2BCA2" />
                <stop offset="1" stopColor="#C4AC90" />
              </linearGradient>
            </defs>
            <path d="M60 55 L22 105 C20 108, 25 116, 32 114 L55 92 L55 160 Z" fill="#CBB397" />
            <path d="M140 55 L178 105 C180 108, 175 116, 168 114 L145 92 L145 160 Z" fill="#CBB397" />
            <path d="M54 55 L146 55 L152 170 C152 173, 148 175, 144 175 L56 175 C52 175, 48 173, 48 170 Z" fill="url(#hoodie-fabric)" />
            <path d="M68 125 L132 125 L138 160 L62 160 Z" fill="#C4AC90" stroke="#B89E80" strokeWidth="1.5" />
            <rect x="74" y="80" width="16" height="12" rx="2" fill="#3D3833" opacity="0.8" />
            <rect x="48" y="165" width="104" height="10" rx="3" fill="#BFA78B" />
            <path d="M70 55 C70 30, 85 20, 100 20 C115 20, 130 30, 130 55 C120 62, 100 66, 70 55 Z" fill="#BFA78B" />
            <path d="M82 48 C92 58, 108 58, 118 48 C112 68, 88 68, 82 48 Z" fill="#9E856A" />
            <line x1="92" y1="58" x2="92" y2="92" stroke="#4B443B" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="108" y1="58" x2="108" y2="88" stroke="#4B443B" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="92" cy="94" r="2" fill="#D97706" />
            <circle cx="108" cy="90" r="2" fill="#D97706" />
          </svg>
        </div>
      );

    case 'handbag':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#F3EFEA] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="leather-grad" x1="100" y1="70" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#9C5127" />
                <stop offset="0.6" stopColor="#823F1A" />
                <stop offset="1" stopColor="#693010" />
              </linearGradient>
              <linearGradient id="gold-metal" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#FDE68A" />
                <stop offset="0.7" stopColor="#D97706" />
                <stop offset="1" stopColor="#92400E" />
              </linearGradient>
            </defs>
            <path d="M72 85 C72 38, 128 38, 128 85" stroke="#693010" strokeWidth="7" strokeLinecap="round" fill="none" />
            <path d="M72 85 C72 40, 128 40, 128 85" stroke="#A75D32" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M42 85 L158 85 L168 165 C168 172, 162 175, 154 175 L46 175 C38 175, 32 172, 32 165 Z" fill="url(#leather-grad)" />
            <path d="M44 85 L156 85 L150 125 C150 128, 146 130, 140 130 L60 130 C54 130, 50 128, 50 125 Z" fill="#A0522D" stroke="#6E3414" strokeWidth="1" />
            <path d="M52 89 L148 89 L144 123 L56 123 Z" stroke="#E29F74" strokeWidth="1" strokeDasharray="3 3" fill="none" opacity="0.7" />
            <rect x="92" y="118" width="16" height="20" rx="3" fill="url(#gold-metal)" stroke="#92400E" strokeWidth="1" />
            <circle cx="100" cy="128" r="3.5" fill="#451A03" />
            <circle cx="44" cy="90" r="5" stroke="url(#gold-metal)" strokeWidth="2.5" fill="none" />
            <circle cx="156" cy="90" r="5" stroke="url(#gold-metal)" strokeWidth="2.5" fill="none" />
          </svg>
        </div>
      );

    case 'sneakers':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#EDF0EF] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sole-grad" x1="100" y1="140" x2="100" y2="168" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="1" stopColor="#E2E8F0" />
              </linearGradient>
              <linearGradient id="leather-white" x1="80" y1="80" x2="140" y2="140" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FFFFFF" />
                <stop offset="0.7" stopColor="#F8FAFC" />
                <stop offset="1" stopColor="#E2E8F0" />
              </linearGradient>
            </defs>
            <g opacity="0.65" transform="translate(18, -12) scale(0.92)">
              <path d="M26 142 L164 142 C172 142, 178 138, 174 130 L158 95 C154 86, 142 82, 130 84 L96 90 L60 98 C46 102, 32 118, 26 142 Z" fill="#E2E8F0" />
              <rect x="22" y="142" width="154" height="18" rx="8" fill="#CBD5E1" />
            </g>
            <path d="M24 145 C24 120, 42 102, 60 98 L98 90 L134 84 C148 82, 160 88, 165 98 L180 134 C184 142, 176 148, 168 148 L28 148 Z" fill="url(#leather-white)" stroke="#CBD5E1" strokeWidth="1" />
            <path d="M50 102 C60 98, 75 106, 85 110 L68 126 C58 126, 52 118, 50 102 Z" fill="#0B3B2C" />
            <path d="M96 92 L142 86 L134 116 L88 120 Z" fill="#F1F5F9" />
            <line x1="102" y1="96" x2="124" y2="106" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="108" y1="102" x2="130" y2="112" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="116" y1="108" x2="136" y2="118" stroke="#94A3B8" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="20" y="146" width="164" height="20" rx="9" fill="url(#sole-grad)" stroke="#CBD5E1" strokeWidth="1.5" />
            <line x1="24" y1="156" x2="180" y2="156" stroke="#E2E8F0" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'perfume':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#FBF3EA] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="amber-liquid" x1="100" y1="90" x2="100" y2="170" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
              <linearGradient id="gold-cap" x1="0" y1="0" x2="1" y2="0">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#D97706" />
                <stop offset="1" stopColor="#FBBF24" />
              </linearGradient>
            </defs>
            <rect x="93" y="55" width="14" height="15" fill="url(#gold-cap)" />
            <rect x="80" y="24" width="40" height="32" rx="4" fill="url(#gold-cap)" stroke="#B45309" strokeWidth="1" />
            <rect x="52" y="70" width="96" height="106" rx="14" fill="#FEFCE8" stroke="#E2E8F0" strokeWidth="2.5" />
            <rect x="62" y="86" width="76" height="80" rx="8" fill="url(#amber-liquid)" opacity="0.9" />
            <rect x="74" y="104" width="52" height="32" rx="4" fill="#FFFFFF" stroke="#FDE68A" strokeWidth="1" />
            <text x="100" y="118" textAnchor="middle" fill="#0B3B2C" fontSize="8" fontWeight="bold" fontFamily="serif" letterSpacing="2">L’AURA</text>
            <text x="100" y="128" textAnchor="middle" fill="#64748B" fontSize="5" fontFamily="system-ui" letterSpacing="1">PARIS · 100ML</text>
          </svg>
        </div>
      );

    case 'headphones':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#F1F3F5] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="hp-cushion" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#334155" />
                <stop offset="1" stopColor="#0F172A" />
              </linearGradient>
            </defs>
            <path d="M48 115 C48 45, 152 45, 152 115" stroke="#1E293B" strokeWidth="14" strokeLinecap="round" fill="none" />
            <path d="M52 105 C52 50, 148 50, 148 105" stroke="#0F172A" strokeWidth="8" strokeLinecap="round" fill="none" />
            <g transform="rotate(-10 50 125)">
              <rect x="36" y="95" width="28" height="58" rx="14" fill="url(#hp-cushion)" stroke="#475569" strokeWidth="1.5" />
              <rect x="42" y="103" width="16" height="42" rx="8" fill="#FF5B26" opacity="0.15" />
              <circle cx="50" cy="124" r="5" fill="#475569" />
            </g>
            <g transform="rotate(10 150 125)">
              <rect x="136" y="95" width="28" height="58" rx="14" fill="url(#hp-cushion)" stroke="#475569" strokeWidth="1.5" />
              <rect x="142" y="103" width="16" height="42" rx="8" fill="#FF5B26" opacity="0.15" />
              <circle cx="150" cy="124" r="5" fill="#475569" />
            </g>
          </svg>
        </div>
      );

    case 'vase':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#EDF3EE] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="vase-grad" x1="100" y1="80" x2="100" y2="180" gradientUnits="userSpaceOnUse">
                <stop stopColor="#14532D" />
                <stop offset="0.6" stopColor="#0B3B2C" />
                <stop offset="1" stopColor="#052E16" />
              </linearGradient>
            </defs>
            <path d="M100 90 Q80 40 45 35 Q65 60 95 85" fill="#15803D" />
            <path d="M100 85 Q115 30 150 25 Q135 55 105 80" fill="#16A34A" />
            <path d="M100 80 Q100 20 100 15 Q105 45 102 75" stroke="#166534" strokeWidth="3" />
            <path d="M78 85 L122 85 L136 172 C136 176, 130 178, 124 178 L76 178 C70 178, 64 176, 64 172 Z" fill="url(#vase-grad)" stroke="#064E3B" strokeWidth="1.5" />
            <line x1="84" y1="88" x2="80" y2="174" stroke="rgba(255,255,255,0.15)" strokeWidth="2.5" />
            <line x1="96" y1="86" x2="94" y2="176" stroke="rgba(255,255,255,0.2)" strokeWidth="2.5" />
            <line x1="108" y1="86" x2="110" y2="176" stroke="rgba(0,0,0,0.2)" strokeWidth="2.5" />
            <ellipse cx="100" cy="85" rx="22" ry="6" fill="#14532D" stroke="#22C55E" strokeWidth="1" />
          </svg>
        </div>
      );

    case 'serum':
      return (
        <div className={`relative flex items-center justify-center bg-gradient-to-b from-[#FBFBFA] to-[#FFF8F0] p-4 overflow-hidden rounded-2xl select-none ${className}`}>
          <svg viewBox="0 0 200 200" className="w-full h-full max-h-56 drop-shadow-md" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="88" y="24" width="24" height="24" rx="12" fill="#1E293B" />
            <rect x="86" y="44" width="28" height="16" rx="3" fill="#D97706" />
            <rect x="68" y="65" width="64" height="110" rx="12" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="1.5" />
            <rect x="72" y="90" width="56" height="80" rx="8" fill="#FBBF24" opacity="0.8" />
            <rect x="74" y="105" width="52" height="42" rx="4" fill="#FFFFFF" />
            <text x="100" y="122" textAnchor="middle" fill="#0B3B2C" fontSize="7" fontWeight="bold">VITAMIN C</text>
            <text x="100" y="132" textAnchor="middle" fill="#EA580C" fontSize="5" fontWeight="bold">15% GLOW</text>
          </svg>
        </div>
      );

    default:
      return (
        <div className={`flex items-center justify-center bg-[#F4F4F1] rounded-2xl ${className}`}>
          <span className="text-stone-400 text-xs font-semibold">NovaMart</span>
        </div>
      );
  }
};

/**
 * Enhanced HeroVisual with realistic photography composition on architectural travertine pedestals,
 * perfectly echoing the ShopEase reference.
 */
export const HeroVisual: React.FC = () => {
  const [photoError, setPhotoError] = useState(false);

  return (
    <div className="relative w-full h-[360px] md:h-[450px] flex items-center justify-center select-none">
      {/* Background emerald aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Floating UP TO 50% OFF badge */}
      <div className="absolute top-4 right-4 md:right-8 z-30 w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr from-[#FF5B26] to-[#FF8149] text-white flex flex-col items-center justify-center shadow-2xl shadow-orange-950/40 border-2 border-white/20 animate-bounce [animation-duration:3s]">
        <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">UP TO</span>
        <span className="text-2xl md:text-3xl font-extrabold leading-none">50%</span>
        <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase opacity-90">OFF</span>
      </div>

      {/* Realistic Photo Showcase / Composition */}
      <div className="relative w-full max-w-[500px] h-full flex items-end justify-center pb-4">
        {/* Architectural Tiered Pedestals */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-80 md:w-[420px] h-28 bg-gradient-to-b from-[#EFEAE2] to-[#E5DDD2] rounded-3xl shadow-inner border border-stone-300/40" />
        <div className="absolute bottom-10 left-8 md:left-12 w-44 h-36 bg-[#F7F2EB] rounded-2xl shadow-lg border border-stone-300/40" />
        <div className="absolute bottom-14 right-8 md:right-10 w-36 h-28 bg-[#E9E2D7] rounded-2xl shadow-md border border-stone-300/40" />

        {/* 1. Realistic Tote Bag (Left/Center) */}
        <div className="relative z-10 -ml-16 mb-12 w-44 md:w-56 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-lg border border-stone-200/50">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80"
              alt="Artisan Leather Bag"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          </div>
        </div>

        {/* 2. Pristine White Sneaker (Foreground Center) */}
        <div className="relative z-20 -ml-10 mb-2 w-44 md:w-52 drop-shadow-2xl hover:scale-105 transition-transform duration-300">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-xl border border-stone-200/60 bg-white">
            <img
              src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
              alt="Classic White Sneakers"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          </div>
        </div>

        {/* 3. Forest Green Ceramic Vase with Botanicals (Right) */}
        <div className="relative z-10 -ml-6 mb-8 w-36 md:w-44 drop-shadow-xl hover:scale-105 transition-transform duration-300">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-md border border-stone-200/50 bg-[#F4F6F4]">
            <img
              src="https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80"
              alt="Ceramic Planter"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={() => setPhotoError(true)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
