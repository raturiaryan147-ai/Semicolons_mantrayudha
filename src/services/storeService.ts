import { Product, Review, Order, UserProfile, UserAddress, CartItem } from '../types';
import { INITIAL_REVIEWS, INITIAL_ORDERS, INITIAL_USER_PROFILE } from '../data/mockData';
import { IMPORTED_PRODUCTS } from '../data/importedProducts';
import { db } from '../firebase';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

const STORAGE_KEYS = {
  PRODUCTS: 'novamart_products_v3_catalog',
  REVIEWS: 'novamart_reviews_v1',
  ORDERS: 'novamart_orders_v1',
  PROFILE: 'novamart_profile_v1',
  WISHLIST: 'novamart_wishlist_v1',
};

function sanitizeForFirestore<T>(data: T): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) return data.map(item => sanitizeForFirestore(item));
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) cleaned[k] = sanitizeForFirestore(v);
    }
    return cleaned;
  }
  return data;
}

// Architecture check for future Supabase integration
export const isSupabaseConfigured = (): boolean => {
  return false;
};

class StoreService {
  // --- Products ---
  getProducts(): Product[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length >= 50) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse products from storage', e);
    }
    // Seed initial 300 products dataset
    this.saveProducts(IMPORTED_PRODUCTS);
    return IMPORTED_PRODUCTS;
  }

  async syncCatalogToFirestore(): Promise<{ success: boolean; count: number }> {
    try {
      const batch = writeBatch(db);
      const prods = this.getProducts();
      // Batch up to 500 documents (300 products easily fit in 1 batch)
      prods.forEach(p => {
        const docRef = doc(db, 'products', p.id);
        batch.set(docRef, sanitizeForFirestore(p), { merge: true });
      });
      await batch.commit();
      return { success: true, count: prods.length };
    } catch (error) {
      console.warn('Failed to batch sync catalog to Firestore:', error);
      return { success: false, count: 0 };
    }
  }

  async loadProductsFromFirestore(): Promise<Product[]> {
    try {
      const querySnapshot = await getDocs(collection(db, 'products'));
      if (!querySnapshot.empty && querySnapshot.size >= 50) {
        const prods: Product[] = [];
        querySnapshot.forEach(docSnap => {
          prods.push(docSnap.data() as Product);
        });
        this.saveProducts(prods);
        return prods;
      }
    } catch (e) {
      console.warn('Could not read products from Firestore:', e);
    }
    return this.getProducts();
  }


  saveProducts(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Storage write error', e);
    }
  }

  getProductById(id: string): Product | undefined {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  // --- Reviews ---
  getReviews(productId?: string): Review[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      const allReviews: Review[] = stored ? JSON.parse(stored) : INITIAL_REVIEWS;
      if (!stored) {
        this.saveReviews(INITIAL_REVIEWS);
      }
      if (productId) {
        return allReviews.filter(r => r.productId === productId);
      }
      return allReviews;
    } catch (e) {
      console.warn('Error reading reviews', e);
      return INITIAL_REVIEWS;
    }
  }

  saveReviews(reviews: Review[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch (e) {
      console.error('Failed to save reviews', e);
    }
  }

  addReview(reviewData: Omit<Review, 'id' | 'date' | 'helpfulCount'>): Review {
    const all = this.getReviews();
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      helpfulCount: 0
    };
    const updated = [newReview, ...all];
    this.saveReviews(updated);

    // Also update product rating and review count
    const products = this.getProducts();
    const prod = products.find(p => p.id === reviewData.productId);
    if (prod) {
      const prodReviews = updated.filter(r => r.productId === prod.id);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.rating = Number(avg.toFixed(1));
      prod.reviewCount = prodReviews.length;
      this.saveProducts(products);
    }

    return newReview;
  }

  upvoteReview(reviewId: string): void {
    const all = this.getReviews();
    const target = all.find(r => r.id === reviewId);
    if (target) {
      target.helpfulCount += 1;
      this.saveReviews(all);
    }
  }

  // --- Orders ---
  getOrders(): Order[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading orders', e);
    }
    this.saveOrders(INITIAL_ORDERS);
    return INITIAL_ORDERS;
  }

  saveOrders(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders', e);
    }
  }

  getOrderById(orderId: string): Order | undefined {
    const orders = this.getOrders();
    const cleanId = orderId.replace(/^#/, '').trim().toUpperCase();
    return orders.find(o => o.id.toUpperCase() === cleanId || o.trackingNumber.toUpperCase() === cleanId);
  }

  createOrder(cartItems: CartItem[], shippingAddress: UserAddress, paymentMethod: string, discount: number = 0): Order {
    const orders = this.getOrders();
    const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const shipping = subtotal > 75 ? 0 : 9.99;
    const total = Math.max(0, subtotal - discount + shipping);

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const estDelivery = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const orderNum = Math.floor(1000 + Math.random() * 9000);
    const trackingNum = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}US`;

    const newOrder: Order = {
      id: `NM-${orderNum}`,
      date: formattedDate,
      status: 'Processing',
      estimatedDelivery: estDelivery,
      trackingNumber: trackingNum,
      paymentMethod,
      subtotal: Number(subtotal.toFixed(2)),
      discount: Number(discount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
      shippingAddress: {
        name: shippingAddress.name,
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state,
        zip: shippingAddress.zip,
        country: shippingAddress.country
      },
      items: cartItems.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        imageKey: item.product.imageKey
      })),
      timeline: [
        {
          status: 'Order Placed',
          date: `${formattedDate} · Just now`,
          description: 'Payment authorized and verified.',
          completed: true,
          current: true
        },
        {
          status: 'Processing in Fulfillment Hub',
          date: 'Expected in 4-6 hours',
          description: 'Warehouse packaging and quality inspection.',
          completed: false
        },
        {
          status: 'In Transit',
          date: `Expected ${estDelivery}`,
          description: 'Carrier dispatch with real-time tracking.',
          completed: false
        },
        {
          status: 'Delivered',
          date: `Expected ${estDelivery}`,
          description: 'Final doorstep delivery confirmation.',
          completed: false
        }
      ]
    };

    const updated = [newOrder, ...orders];
    this.saveOrders(updated);
    return newOrder;
  }

  // --- Profile ---
  getProfile(): UserProfile {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Error reading profile', e);
    }
    this.saveProfile(INITIAL_USER_PROFILE);
    return INITIAL_USER_PROFILE;
  }

  saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to save profile', e);
    }
  }

  updateProfile(data: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...data };
    this.saveProfile(updated);
    return updated;
  }

  addAddress(address: Omit<UserAddress, 'id'>): UserProfile {
    const current = this.getProfile();
    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`
    };
    if (newAddr.isDefault) {
      current.addresses.forEach(a => (a.isDefault = false));
    }
    current.addresses.push(newAddr);
    this.saveProfile(current);
    return current;
  }

  deleteAddress(addressId: string): UserProfile {
    const current = this.getProfile();
    current.addresses = current.addresses.filter(a => a.id !== addressId);
    if (current.addresses.length > 0 && !current.addresses.some(a => a.isDefault)) {
      current.addresses[0].isDefault = true;
    }
    this.saveProfile(current);
    return current;
  }

  // --- Wishlist ---
  getWishlist(): string[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.WISHLIST);
      return stored ? JSON.parse(stored) : ['prod-smartwatch-pro'];
    } catch {
      return [];
    }
  }

  toggleWishlist(productId: string): string[] {
    const list = this.getWishlist();
    const index = list.indexOf(productId);
    let updated: string[];
    if (index > -1) {
      updated = list.filter(id => id !== productId);
    } else {
      updated = [...list, productId];
    }
    localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(updated));
    return updated;
  }
}

export const storeService = new StoreService();
