import React, { useState, useEffect } from 'react';
import { Product, Review, Order, UserProfile, CartItem, UserAddress } from './types';
import { storeService } from './services/storeService';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ValuePropsStrip } from './components/ValuePropsStrip';
import { CategorySection } from './components/CategorySection';
import { DealOfTheDay } from './components/DealOfTheDay';
import { NewArrivalsSection } from './components/NewArrivalsSection';
import { ProductsCatalog } from './components/ProductsCatalog';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { OrderHistorySection } from './components/OrderHistorySection';
import { OrderDetailModal } from './components/OrderDetailModal';
import { ReviewsSection } from './components/ReviewsSection';
import { WriteReviewModal } from './components/WriteReviewModal';
import { ProfileSection } from './components/ProfileSection';
import { NovaAiChatPanel } from './components/NovaAiChatPanel';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { NewsletterBanner } from './components/NewsletterBanner';
import { Footer } from './components/Footer';
import { CsvImportModal } from './components/CsvImportModal';
import { useAuth } from './context/AuthContext';
import { db } from './firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Check, ShoppingBag, Heart } from 'lucide-react';

export default function App() {
  const { currentUser, userProfile, updateProfile, addAddress, deleteAddress } = useAuth();

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<'home' | 'products' | 'orders' | 'reviews' | 'profile' | 'support'>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Data State from storeService (with persistence)
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [profile, setProfile] = useState<UserProfile>(userProfile || storeService.getProfile());
  const [wishlist, setWishlist] = useState<string[]>(storeService.getWishlist());
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Modals & Panels State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAiSupportOpen, setIsAiSupportOpen] = useState(false);
  const [isCsvImportOpen, setIsCsvImportOpen] = useState(false);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string | undefined>(undefined);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [reviewTargetProduct, setReviewTargetProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutDiscount, setCheckoutDiscount] = useState<number>(0);


  // Micro-toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Initial Data Load & Profile Synchronization with Firebase Auth
  useEffect(() => {
    const loadedProducts = storeService.getProducts();
    const loadedReviews = storeService.getReviews();
    const loadedOrders = storeService.getOrders();
    const loadedProfile = storeService.getProfile();
    const loadedWishlist = storeService.getWishlist();

    setProducts(loadedProducts);
    setReviews(loadedReviews);
    setOrders(loadedOrders);
    setWishlist(loadedWishlist);
    if (!currentUser) {
      setProfile(loadedProfile);
    }
  }, []);

  useEffect(() => {
    if (userProfile) {
      setProfile(userProfile);
    }
  }, [userProfile]);

  // Cart Handlers
  const handleAddToCart = (product: Product, quantity = 1, color?: string, size?: string) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          product,
          quantity,
          selectedColor: color || product.colors?.[0]?.name,
          selectedSize: size || product.sizes?.[0]
        }
      ];
    });
    showToast(`Added "${product.name}" to your cart!`);
  };

  const handleBuyNow = (product: Product, quantity = 1, color?: string, size?: string) => {
    handleAddToCart(product, quantity, color, size);
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
    showToast('Item removed from cart', 'info');
  };

  // Wishlist Handlers
  const handleToggleWishlist = (productId: string) => {
    const updated = storeService.toggleWishlist(productId);
    setWishlist(updated);
    const added = updated.includes(productId);
    showToast(added ? 'Saved to your Wishlist!' : 'Removed from Wishlist', 'info');
  };

  // Checkout & Order Placement
  const handleInitiateCheckout = (discountAmount: number) => {
    setCheckoutDiscount(discountAmount);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = (shippingAddress: UserAddress, paymentMethod: string): Order => {
    const newOrder = storeService.createOrder(cartItems, shippingAddress, paymentMethod, checkoutDiscount);
    if (currentUser) {
      newOrder.userId = currentUser.uid;
      newOrder.userEmail = currentUser.email || '';
    }
    setOrders(storeService.getOrders());
    setCartItems([]);
    setIsCheckoutOpen(false);
    setSelectedOrder(newOrder);
    showToast(`Order #${newOrder.id} placed successfully!`);

    // Asynchronously sync order to Firestore
    setDoc(doc(db, 'orders', newOrder.id), {
      ...newOrder,
      userId: currentUser ? currentUser.uid : 'guest-user',
      createdAt: new Date().toISOString()
    }).catch(err => {
      console.warn('Could not write order directly to Firestore (offline cache active):', err);
    });

    return newOrder;
  };

  // Reviews Handlers
  const handleAddReview = (reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>) => {
    const newReview = storeService.addReview(reviewData);
    if (currentUser) {
      newReview.userId = currentUser.uid;
    }
    setReviews(storeService.getReviews());
    setProducts(storeService.getProducts());
    showToast('Thank you! Your verified review is published.');

    // Asynchronously sync review to Firestore
    setDoc(doc(db, 'reviews', newReview.id), {
      ...newReview,
      userId: currentUser ? currentUser.uid : 'anonymous',
      createdAt: new Date().toISOString()
    }).catch(err => {
      console.warn('Could not write review directly to Firestore:', err);
    });
  };

  const handleUpvoteReview = (reviewId: string) => {
    storeService.upvoteReview(reviewId);
    setReviews(storeService.getReviews());
    showToast('Feedback noted! Marked review as helpful.', 'info');
  };

  // Profile Handlers (Saved to Firebase Auth context and local store)
  const handleUpdateProfile = (data: Partial<UserProfile>) => {
    const updated = storeService.updateProfile(data);
    setProfile(updated);
    if (currentUser) {
      updateProfile(data);
    }
    showToast('Profile information saved to Firebase!');
  };

  const handleAddAddress = (address: Omit<UserAddress, 'id'>) => {
    const updated = storeService.addAddress(address);
    setProfile(updated);
    if (currentUser) {
      addAddress(address);
    }
    showToast('New shipping address saved to Firebase!');
  };

  const handleDeleteAddress = (id: string) => {
    const updated = storeService.deleteAddress(id);
    setProfile(updated);
    if (currentUser) {
      deleteAddress(id);
    }
    showToast('Address removed', 'info');
  };

  // CSV Import Handlers
  const handleProductsImported = (importedProducts: Product[]) => {
    storeService.saveProducts(importedProducts);
    setProducts(importedProducts);
    showToast(`Loaded ${importedProducts.length} products to store catalog & Firestore!`);
  };

  const handleOrdersImported = (importedOrders: Order[]) => {
    const existing = storeService.getOrders();
    const combined = [...importedOrders, ...existing];
    storeService.saveOrders(combined);
    setOrders(combined);
    showToast(`Imported ${importedOrders.length} orders into Firestore!`);
  };

  const handleReviewsImported = (importedReviews: Review[]) => {
    const existing = storeService.getReviews();
    const combined = [...importedReviews, ...existing];
    storeService.saveReviews(combined);
    setReviews(combined);
    showToast(`Imported ${importedReviews.length} reviews into Firestore!`);
  };


  // AI Support Helpers
  const handleAskAiAboutOrder = (order: Order) => {
    setSelectedOrder(null);
    setAiInitialPrompt(`Track my order #${order.id}`);
    setIsAiSupportOpen(true);
  };

  const handleCategoryClick = (cat: string) => {
    setSelectedCategory(cat);
    setActiveTab('products');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Deal of the Day Product (Smart Watch Pro)
  const dealProduct = products.find(p => p.id === 'prod-smartwatch-pro') || products[0];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAF8] text-stone-900 font-sans selection:bg-[#FF5B26] selection:text-white">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B3B2C] text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border border-white/20 animate-fadeIn text-xs font-semibold">
          <div className="w-5 h-5 rounded-full bg-emerald-400/20 flex items-center justify-center text-emerald-300">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </div>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAiSupport={() => {
          setAiInitialPrompt(undefined);
          setIsAiSupportOpen(true);
        }}
        onOpenCsvImport={() => setIsCsvImportOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSelectCategory={handleCategoryClick}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">
        
        {/* VIEW 1: HOME PAGE */}
        {activeTab === 'home' && (
          <div className="space-y-4">
            {/* 1. Hero Section matching ShopEase */}
            <HeroSection
              onExplore={() => {
                setActiveTab('products');
                setSelectedCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 2. Value Proposition Strip */}
            <ValuePropsStrip
              onOpenAiSupport={() => {
                setAiInitialPrompt(undefined);
                setIsAiSupportOpen(true);
              }}
            />

            {/* 3. Shop By Category */}
            <CategorySection
              onSelectCategory={handleCategoryClick}
            />

            {/* 4. Deal of the Day with Real-time Countdown */}
            {dealProduct && (
              <DealOfTheDay
                product={dealProduct}
                onAddToCart={handleAddToCart}
                onViewDetails={p => setSelectedProduct(p)}
              />
            )}

            {/* 5. New Arrivals Grid */}
            <NewArrivalsSection
              products={products}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onViewDetails={p => setSelectedProduct(p)}
              onViewAll={() => {
                setActiveTab('products');
                setSelectedCategory('All');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 6. Newsletter Banner */}
            <NewsletterBanner />
          </div>
        )}

        {/* VIEW 2: PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            <ProductsCatalog
              products={products}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onAddToCart={handleAddToCart}
              onViewDetails={p => setSelectedProduct(p)}
            />
            <NewsletterBanner />
          </div>
        )}

        {/* VIEW 3: ORDER HISTORY */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <OrderHistorySection
              orders={orders}
              onViewOrderDetails={order => setSelectedOrder(order)}
              onAskAi={handleAskAiAboutOrder}
              onShopNow={() => {
                setActiveTab('products');
                setSelectedCategory('All');
              }}
            />
          </div>
        )}

        {/* VIEW 4: REVIEWS SECTION */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <ReviewsSection
              reviews={reviews}
              products={products}
              onOpenWriteReview={(p) => {
                setReviewTargetProduct(p || products[0]);
                setIsWriteReviewOpen(true);
              }}
              onUpvoteReview={handleUpvoteReview}
              onSelectProduct={id => {
                const found = products.find(p => p.id === id);
                if (found) setSelectedProduct(found);
              }}
            />
          </div>
        )}

        {/* VIEW 5: USER PROFILE */}
        {activeTab === 'profile' && (
          <div className="space-y-4">
            <ProfileSection
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onAddAddress={handleAddAddress}
              onDeleteAddress={handleDeleteAddress}
              orderCount={orders.length}
              wishlistCount={wishlist.length}
              onViewOrders={() => setActiveTab('orders')}
            />
          </div>
        )}

        {/* VIEW 6: DEDICATED AI SUPPORT VIEW */}
        {activeTab === 'support' && (
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left space-y-8">
            {/* Header Hero */}
            <div className="bg-gradient-to-br from-[#0B3B2C] via-[#093527] to-[#06241B] text-white p-8 sm:p-10 rounded-3xl shadow-xl shadow-emerald-950/20 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-mono font-bold">
                <span>Enterprise Architecture</span>
                <span>·</span>
                <span>5-Layer Reasoning System</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Nova AI: Layered Reasoning Architecture
              </h2>
              <p className="text-stone-300 text-sm sm:text-base max-w-2xl leading-relaxed">
                Our agent is not a single prompt. Each layer has an explicit job — preventing hallucinations, wrong refunds, and premature escalations.
              </p>
              
              <button
                onClick={() => {
                  setAiInitialPrompt(undefined);
                  setIsAiSupportOpen(true);
                }}
                className="inline-flex items-center gap-2 bg-[#FF5B26] hover:bg-[#F04F1B] active:scale-95 text-white font-bold px-7 py-3 rounded-full text-xs transition-all shadow-md shadow-orange-950/30 cursor-pointer"
              >
                <span>Launch Interactive Nova AI Panel</span>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </button>
            </div>

            {/* 5-Layer Pillars Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5B26] flex items-center justify-center font-bold font-mono text-xs">
                  01
                </div>
                <h4 className="text-sm font-bold text-stone-900">Intent Layer</h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Parses what the customer actually wants — including simultaneous multi-intent requests without dropping context.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold font-mono text-xs">
                  02
                </div>
                <h4 className="text-sm font-bold text-stone-900">Memory Layer</h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Retrieves session context and user dossier; strictly prevents re-asking what the customer already answered.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold font-mono text-xs">
                  03
                </div>
                <h4 className="text-sm font-bold text-stone-900">Policy Layer</h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Evaluates active governance v2.4, 30-day delivery return windows, and in-transit cancellation rules before taking action.
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold font-mono text-xs">
                  04
                </div>
                <h4 className="text-sm font-bold text-stone-900">Tools Layer</h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Calls only verified tools with strictly validated parameters (order fetch, return label generator, catalog query).
                </p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                <div className="w-8 h-8 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center font-bold font-mono text-xs">
                  05
                </div>
                <h4 className="text-sm font-bold text-stone-900">Decision Layer</h4>
                <p className="text-xs text-stone-500 leading-normal">
                  Explicitly selects one outcome: <span className="font-bold text-emerald-700">ACT</span>, <span className="font-bold text-blue-700">ANSWER</span>, <span className="font-bold text-amber-700">ASK</span>, or <span className="font-bold text-rose-700">ESCALATE</span>.
                </p>
              </div>
            </div>

            {/* Interactive Test Scenario Cards */}
            <div className="bg-stone-50 p-6 sm:p-8 rounded-3xl border border-stone-200/80 space-y-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Interactive Reasoning Scenarios</h3>
                <p className="text-xs text-stone-500">Click any card to launch the Nova AI panel with real-time layer execution</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => {
                    setAiInitialPrompt('Where is my order #NM-8492 and can you suggest a watch under $100?');
                    setIsAiSupportOpen(true);
                  }}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">1. Multi-Intent Parsing</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold">ACT + ANSWER</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    "Where is my order #NM-8492 and can you suggest a watch under $100?"
                  </p>
                  <div className="text-[11px] text-[#FF5B26] font-semibold mt-2">Test Multi-Intent Layer →</div>
                </div>

                <div
                  onClick={() => {
                    setAiInitialPrompt('I want to return my order #NM-8410');
                    setIsAiSupportOpen(true);
                  }}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">2. Policy Window Check & Action</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">ACT</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    "I want to return my order #NM-8410" (Delivered 5 days ago · Generates real prepaid return label & QR).
                  </p>
                  <div className="text-[11px] text-[#FF5B26] font-semibold mt-2">Test Return Label Action →</div>
                </div>

                <div
                  onClick={() => {
                    setAiInitialPrompt('Can I return an item from my previous order?');
                    setIsAiSupportOpen(true);
                  }}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">3. Ambiguity Resolution (ASK)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">ASK</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    "Can I return an item from my previous order?" (Agent identifies multiple delivered orders and prompts for clarification).
                  </p>
                  <div className="text-[11px] text-[#FF5B26] font-semibold mt-2">Test Clarification Layer →</div>
                </div>

                <div
                  onClick={() => {
                    setAiInitialPrompt('I received a damaged package and need to speak with a human supervisor');
                    setIsAiSupportOpen(true);
                  }}
                  className="bg-white p-4 rounded-2xl border border-stone-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-stone-900">4. Tier-1 Escalation (ESCALATE)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">ESCALATE</span>
                  </div>
                  <p className="text-xs text-stone-600">
                    "I received a damaged package and need to speak with a human supervisor" (Dispatches High-Priority ticket).
                  </p>
                  <div className="text-[11px] text-[#FF5B26] font-semibold mt-2">Test Escalation Protocol →</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer matching ShopEase */}
      <Footer
        onNavigate={setActiveTab}
        onOpenAiSupport={() => {
          setAiInitialPrompt(undefined);
          setIsAiSupportOpen(true);
        }}
      />

      {/* FLOATING NOVI AI CHAT PANEL */}
      <NovaAiChatPanel
        isOpen={isAiSupportOpen}
        onClose={() => setIsAiSupportOpen(false)}
        onOpen={() => {
          setAiInitialPrompt(undefined);
          setIsAiSupportOpen(true);
        }}
        onViewOrder={order => {
          setIsAiSupportOpen(false);
          setSelectedOrder(order);
        }}
        onViewProduct={product => {
          setIsAiSupportOpen(false);
          setSelectedProduct(product);
        }}
        onAddToCart={product => {
          handleAddToCart(product);
        }}
        initialPrompt={aiInitialPrompt}
      />

      {/* SLIDE-OUT CART DRAWER */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleInitiateCheckout}
        profile={profile}
      />

      {/* PRODUCT DETAILS MODAL (PDP) */}
      <ProductDetailsModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
        reviews={reviews}
        onOpenWriteReview={p => {
          setReviewTargetProduct(p);
          setIsWriteReviewOpen(true);
        }}
      />

      {/* ORDER DETAILS MODAL */}
      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onAskAi={handleAskAiAboutOrder}
      />

      {/* WRITE REVIEW MODAL */}
      {isWriteReviewOpen && (
        <WriteReviewModal
          product={reviewTargetProduct}
          products={products}
          onClose={() => setIsWriteReviewOpen(false)}
          onSubmit={handleAddReview}
        />
      )}

      {/* CHECKOUT MODAL */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        profile={profile}
        discount={checkoutDiscount}
        onPlaceOrder={handlePlaceOrder}
      />

      {/* CSV DATASET IMPORTER */}
      <CsvImportModal
        isOpen={isCsvImportOpen}
        onClose={() => setIsCsvImportOpen(false)}
        onProductsImported={handleProductsImported}
        onOrdersImported={handleOrdersImported}
        onReviewsImported={handleReviewsImported}
      />

    </div>
  );
}

