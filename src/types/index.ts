export type ProductCategory =
  | 'All'
  | 'Accessories'
  | 'Cameras'
  | 'Earbuds'
  | 'Gaming'
  | 'Headphones'
  | 'Keyboards'
  | 'Laptops'
  | 'Mice'
  | 'Monitors'
  | 'Networking'
  | 'Smartphones'
  | 'Smartwatches'
  | 'Speakers'
  | 'Tablets'
  | 'Electronics'
  | 'Women'
  | 'Men'
  | 'Home & Living'
  | 'Beauty'
  | string;

export interface Product {
  id: string;
  sku?: string;
  name: string;
  category: ProductCategory;
  subcategory?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  mrp?: number;
  discountPercent?: number;
  rating: number;
  reviewCount: number;
  imageKey: string;
  imageUrl?: string;
  tag?: 'NEW' | '50% OFF' | 'BESTSELLER' | 'LIMITED' | string;
  description: string;
  features: string[];
  inStock: boolean;
  stockCount: number;
  warrantyMonths?: number;
  returnable?: boolean;
  replacementAvailable?: boolean;
  weightKg?: number;
  color?: string;
  status?: 'active' | 'out_of_stock' | 'discontinued';
  colors?: { name: string; hex: string }[];
  sizes?: string[];
  updatedAt?: string;
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  userId?: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpfulCount: number;
  createdAt?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  imageKey: string;
}

export interface OrderTimeline {
  status: string;
  date: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  userId?: string;
  userEmail?: string;
  date: string;
  status: 'Processing' | 'In Transit' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  timeline: OrderTimeline[];
  estimatedDelivery: string;
  trackingNumber: string;
  createdAt?: string;
}

export interface UserAddress {
  id: string;
  title: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

export interface UserProfile {
  uid?: string;
  name: string;
  email: string;
  phone: string;
  membershipTier: string;
  memberSince: string;
  rewardPoints: number;
  addresses: UserAddress[];
  photoURL?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  relatedOrder?: Order;
  relatedProducts?: Product[];
  actionType?: 'view_order' | 'view_product' | 'return_policy' | 'discount_info';
}

export interface StorePolicy {
  id: string;
  policyCode: string;
  name: string;
  version: string;
  windowDays: number;
  summary: string;
  rules: string[];
  exceptions: string[];
}

export interface ReturnRecord {
  id: string;
  orderId: string;
  userId: string;
  status: 'Label Generated - Ready to Ship' | 'In Transit' | 'Received' | 'Refunded' | 'Declined';
  refundAmount: number;
  itemNames: string[];
  reason: string;
  carrier: string;
  trackingNumber: string;
  createdAt: string;
}
