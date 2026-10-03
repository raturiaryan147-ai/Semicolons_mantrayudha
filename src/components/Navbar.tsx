import React from 'react';
import { Search, ShoppingBag, Heart, User, Bot, Sparkles, X, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  activeTab: 'home' | 'products' | 'orders' | 'reviews' | 'profile' | 'support';
  setActiveTab: (tab: 'home' | 'products' | 'orders' | 'reviews' | 'profile' | 'support') => void;
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAiSupport: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectCategory?: (category: string) => void;
}


export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenAiSupport,
  searchQuery,
  setSearchQuery,
  onSelectCategory
}) => {
  const { currentUser, userProfile, loginWithGoogle, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      {/* Top Announcement Banner */}
      <div className="bg-[#0B3B2C] text-white py-2 px-4 text-xs font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6 text-[11px] md:text-xs tracking-wide">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              FREE SHIPPING on orders over $75
            </span>
            <span className="hidden sm:inline-block text-emerald-400/40">|</span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-stone-200">
              EXTRA 10% OFF on prepaid orders · Use code <span className="font-bold text-[#FF8149]">NOVA10</span>
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setActiveTab('orders')}
              className="text-stone-300 hover:text-white transition-colors cursor-pointer"
            >
              Track Order
            </button>
            <span className="text-emerald-400/40">|</span>
            <button
              onClick={onOpenAiSupport}
              className="text-stone-300 hover:text-white flex items-center gap-1 cursor-pointer"
            >
              <Bot className="w-3.5 h-3.5 text-[#FF8149]" />
              <span>Nova AI Help</span>
            </button>
          </div>
        </div>
      </div>


      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo */}
          <button
            onClick={() => {
              setActiveTab('home');
              setSearchQuery('');
            }}
            className="flex items-center gap-3 group text-left cursor-pointer focus:outline-none"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#0B3B2C] to-[#06241B] flex items-center justify-center text-white shadow-md shadow-emerald-950/15 group-hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FF5B26] ring-2 ring-[#0B3B2C]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-bold tracking-tight text-[#0B3B2C]">Nova</span>
                <span className="text-2xl font-extrabold tracking-tight text-[#FF5B26]">Mart</span>
              </div>
              <p className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">Shop Smart. Live Better.</p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            <button
              onClick={() => {
                setActiveTab('home');
                setSearchQuery('');
              }}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'home'
                  ? 'text-[#0B3B2C]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Home
              {activeTab === 'home' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B26] rounded-full" />
              )}
            </button>

            <button
              onClick={() => {
                setActiveTab('products');
                if (onSelectCategory) onSelectCategory('All');
              }}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'products'
                  ? 'text-[#0B3B2C]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Products
              {activeTab === 'products' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B26] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'orders'
                  ? 'text-[#0B3B2C]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Orders
              {activeTab === 'orders' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B26] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'reviews'
                  ? 'text-[#0B3B2C]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Reviews
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B26] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`text-sm font-semibold transition-colors cursor-pointer relative py-2 ${
                activeTab === 'profile'
                  ? 'text-[#0B3B2C]'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Profile
              {activeTab === 'profile' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF5B26] rounded-full" />
              )}
            </button>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs md:max-w-sm relative hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search products, brands, deals..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (activeTab !== 'products') setActiveTab('products');
                }}
                className="w-full bg-[#F4F4F1] hover:bg-[#EFEFEA] focus:bg-white text-stone-800 placeholder-stone-400 pl-10 pr-9 py-2.5 rounded-full text-xs font-medium border border-transparent focus:border-stone-300 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Zone: AI Support, Auth / Profile, Wishlist, Cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Nova AI Quick Launcher in Header */}
            <button

              onClick={onOpenAiSupport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-emerald-50 hover:bg-emerald-100 text-[#0B3B2C] text-xs font-semibold border border-emerald-200 transition-colors cursor-pointer group"
              title="Open Nova AI Customer Support"
            >
              <Bot className="w-4 h-4 text-[#FF5B26] group-hover:rotate-12 transition-transform" />
              <span className="hidden xl:inline">Nova AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </button>

            {/* Auth / Profile Button */}
            {currentUser ? (
              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-[#0B3B2C] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                title={`Signed in as ${userProfile.name}`}
              >
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#FF5B26] text-white flex items-center justify-center text-[10px] font-bold">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
                <span className="hidden md:inline text-xs font-bold truncate max-w-[100px]">
                  {userProfile.name.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Sign in with Google"
              >
                <LogIn className="w-3.5 h-3.5 text-[#0B3B2C]" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}

            {/* Wishlist Button */}
            <button
              onClick={() => {
                setActiveTab('products');
              }}
              className="p-2.5 rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 relative transition-colors cursor-pointer"
              title="Wishlist"
            >
              <Heart className="w-4 h-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#0B3B2C] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Button */}
            <button
              onClick={onOpenCart}
              className="flex items-center gap-2 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white px-4 py-2.5 rounded-full text-xs font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-[11px] font-extrabold">
                {cartCount}
              </span>
            </button>
          </div>

        </div>

        {/* Mobile Search Bar Strip */}
        <div className="pb-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Search products, deals..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab !== 'products') setActiveTab('products');
              }}
              className="w-full bg-[#F4F4F1] text-stone-800 placeholder-stone-400 pl-10 pr-9 py-2 rounded-full text-xs font-medium border border-transparent focus:border-stone-300 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
