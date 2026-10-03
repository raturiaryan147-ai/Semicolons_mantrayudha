import { Product, Review, Order, UserProfile } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-smartwatch-pro',
    name: 'Smart Watch Pro',
    category: 'Electronics',
    price: 59.99,
    originalPrice: 119.99,
    rating: 4.9,
    reviewCount: 342,
    imageKey: 'smartwatch',
    imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=600&q=80',
    tag: '50% OFF',
    description: 'High-precision fitness and wellness tracker with AMOLED curved edge display, 14-day battery life, continuous heart rate, SpO2 sensor, and IP68 waterproof casing.',
    features: [
      '1.78" Ultra-bright AMOLED Display',
      'Advanced Heart Rate & Sleep Architecture Tracking',
      '100+ Professional Sport Modes with Auto-Detection',
      '14-Day Extended Battery Life with Quick Charge',
      'Seamless iOS & Android Bluetooth Sync'
    ],
    inStock: true,
    stockCount: 23,
    colors: [
      { name: 'Midnight Black', hex: '#1E293B' },
      { name: 'Starlight Silver', hex: '#E2E8F0' },
      { name: 'Rose Gold', hex: '#FBCFE8' }
    ]
  },
  {
    id: 'prod-essential-hoodie',
    name: 'Essential Fleece Hoodie',
    category: 'Men',
    price: 39.99,
    originalPrice: 59.99,
    rating: 4.8,
    reviewCount: 189,
    imageKey: 'hoodie',
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    description: 'Ultra-soft 420 GSM brushed heavyweight cotton fleece hoodie. Tailored relaxed drape with double-lined thermal hood, ribbed side gussets, and reinforced kangaroo pocket.',
    features: [
      '100% Ring-Spun Combed Cotton',
      '420 GSM Heavyweight Brushed Interior',
      'Pre-shrunk to retain fit through countless washes',
      'Ribbed side flex panels for unrestricted movement'
    ],
    inStock: true,
    stockCount: 45,
    colors: [
      { name: 'Sand Khaki', hex: '#D2B48C' },
      { name: 'Deep Forest', hex: '#0B3B2C' },
      { name: 'Charcoal Grey', hex: '#374151' }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL']
  },
  {
    id: 'prod-leather-handbag',
    name: 'Artisan Leather Handbag',
    category: 'Women',
    price: 59.99,
    originalPrice: 89.99,
    rating: 4.9,
    reviewCount: 256,
    imageKey: 'handbag',
    imageUrl: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    description: 'Handcrafted full-grain Italian leather satchel featuring structured silhouette, polished brass hardware, secure flap closure, and a detachable leather shoulder strap.',
    features: [
      '100% Genuine Full-Grain Leather',
      'Polished Brass-finish Rust-proof Hardware',
      'Interior Padded Compartment for 13" Laptops',
      'Reinforced Bottom Studs for Structure Protection'
    ],
    inStock: true,
    stockCount: 18,
    colors: [
      { name: 'Caramel Tan', hex: '#A0522D' },
      { name: 'Espresso Brown', hex: '#3E2723' },
      { name: 'Classic Black', hex: '#111827' }
    ]
  },
  {
    id: 'prod-classic-sneakers',
    name: 'Classic Minimalist Sneakers',
    category: 'Women',
    price: 49.99,
    originalPrice: 79.99,
    rating: 4.7,
    reviewCount: 412,
    imageKey: 'sneakers',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    description: 'Pristine low-profile tennis sneakers crafted with supple nappa leather upper, cloud-cushioned memory foam footbed, and durable vulcanized rubber soles.',
    features: [
      'Supple White Calf Nappa Leather',
      'Antimicrobial OrthoLite Memory Foam Insole',
      'Durable Non-slip Natural Gum Rubber Outsole',
      'Waxed Cotton Water-resistant Laces'
    ],
    inStock: true,
    stockCount: 32,
    colors: [
      { name: 'Pure White', hex: '#FFFFFF' },
      { name: 'White & Emerald', hex: '#0B3B2C' }
    ],
    sizes: ['6', '7', '8', '9', '10', '11']
  },
  {
    id: 'prod-eau-de-parfum',
    name: 'L’Aura Eau de Parfum (100ml)',
    category: 'Beauty',
    price: 29.99,
    originalPrice: 45.00,
    rating: 4.8,
    reviewCount: 178,
    imageKey: 'perfume',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80',
    tag: 'NEW',
    description: 'An intoxicating signature blend of sun-drenched bergamot, sensual Madagascar vanilla, delicate jasmine petals, and warm cedarwood base notes.',
    features: [
      'Eau de Parfum Concentration (20% Fragrance Oils)',
      'Long-lasting 10-12 Hour Sillage',
      'Cruelty-free, Clean Formula with No Parabens',
      'Hand-polished French Crystal Flacon'
    ],
    inStock: true,
    stockCount: 29
  },
  {
    id: 'prod-headphones-pro',
    name: 'Studio Wireless ANC Headphones',
    category: 'Electronics',
    price: 129.99,
    originalPrice: 179.99,
    rating: 4.9,
    reviewCount: 520,
    imageKey: 'headphones',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    tag: 'BESTSELLER',
    description: 'Engineered for audiophiles with 40mm beryllium drivers, hybrid active noise cancellation, transparency audio mode, and 45 hours of playtime on a single charge.',
    features: [
      'Custom 40mm High-Resolution Beryllium Drivers',
      'Smart Adaptive Active Noise Cancellation (-38dB)',
      '45-Hour Battery Life with USB-C Fast Charge',
      'Ultra-plush Protein Leather Memory Foam Ear Cushions'
    ],
    inStock: true,
    stockCount: 14,
    colors: [
      { name: 'Matte Obsidian', hex: '#0F172A' },
      { name: 'Warm Sand', hex: '#E2E8F0' }
    ]
  },
  {
    id: 'prod-ceramic-vase',
    name: 'Nordic Ribbed Ceramic Planter',
    category: 'Home & Living',
    price: 34.99,
    originalPrice: 48.00,
    rating: 4.8,
    reviewCount: 114,
    imageKey: 'vase',
    imageUrl: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80',
    tag: 'BESTSELLER',
    description: 'Sculptural artisanal stoneware vase with ribbed fluted exterior, glazed interior, and matte forest green finish. Ideal for floral arrangements or modern statement decor.',
    features: [
      'Handmade High-fired Durable Stoneware',
      'Waterproof Interior Glaze for Fresh Botanicals',
      'Velvet Scuff-proof Bottom Base Protector',
      'Dimensions: 9.5" Height x 5.2" Diameter'
    ],
    inStock: true,
    stockCount: 22,
    colors: [
      { name: 'Forest Moss', hex: '#0B3B2C' },
      { name: 'Warm Terracotta', hex: '#C25E3E' },
      { name: 'Alabaster Chalk', hex: '#F3F4F6' }
    ]
  },
  {
    id: 'prod-glow-serum',
    name: 'Vitamin C Radiance Glow Serum',
    category: 'Beauty',
    price: 24.99,
    originalPrice: 38.00,
    rating: 4.9,
    reviewCount: 298,
    imageKey: 'serum',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
    tag: 'BESTSELLER',
    description: 'Triple-active facial brightening complex with 15% stabilized Vitamin C (THD Ascorbate), Hyaluronic Acid, and Ferulic Acid to fade dark spots and boost collagen.',
    features: [
      '15% Clinically Proven Stable Vitamin C',
      'Deep Multi-molecular Hyaluronic Hydration',
      'Ferulic Acid & Vitamin E Antioxidant Booster',
      'Dermatologist Tested & Non-comedogenic'
    ],
    inStock: true,
    stockCount: 60
  },
  {
    id: 'prod-chrono-watch',
    name: 'Minimalist Chrono Leather Watch',
    category: 'Men',
    price: 89.99,
    originalPrice: 135.00,
    rating: 4.9,
    reviewCount: 164,
    imageKey: 'smartwatch',
    imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=600&q=80',
    tag: 'LIMITED',
    description: 'Sleek 40mm stainless steel timepiece with domed sapphire crystal glass, Japanese quartz movement, and vegetable-tanned genuine leather strap.',
    features: [
      '316L Surgical-Grade Stainless Steel Casing',
      'Scratch-resistant Anti-reflective Sapphire Crystal',
      'Water resistant to 5 ATM (50 meters)',
      'Interchangeable Quick-Release Italian Leather Strap'
    ],
    inStock: true,
    stockCount: 15,
    colors: [
      { name: 'Cognac Leather', hex: '#8B4513' },
      { name: 'Onyx Black', hex: '#111827' }
    ]
  },
  {
    id: 'prod-brass-lamp',
    name: 'Architectural Brass Floor Lamp',
    category: 'Home & Living',
    price: 119.99,
    originalPrice: 165.00,
    rating: 4.8,
    reviewCount: 88,
    imageKey: 'vase',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80',
    tag: 'BESTSELLER',
    description: 'Mid-century inspired minimalist brushed brass lamp with adjustable swivel shade, heavy solid marble base, and warm ambient LED illumination.',
    features: [
      'Solid Brushed Brass with Protective Anti-Tarnish Coat',
      'Weighted Italian Nero Marquina Marble Base',
      'Full-Range Touch Dimming Foot Switch',
      'Warm 2700K Soft Glow Edison LED Included'
    ],
    inStock: true,
    stockCount: 12
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-smartwatch-pro',
    productName: 'Smart Watch Pro',
    userName: 'Marcus Vance',
    rating: 5,
    title: 'Exceeded all expectations for the price!',
    comment: 'The AMOLED screen is amazingly vivid even in direct sunlight. Heart rate tracking matches my chest strap within 1 BPM. Battery easily lasts 12 days before needing a charge.',
    date: 'September 29, 2026',
    verified: true,
    helpfulCount: 38
  },
  {
    id: 'rev-2',
    productId: 'prod-smartwatch-pro',
    productName: 'Smart Watch Pro',
    userName: 'Elena Rostova',
    rating: 5,
    title: 'Sleek design and super accurate sleep stages',
    comment: 'I upgraded from an older fitness band and couldn’t be happier. The notifications are instantaneous and the companion app syncs flawlessly with Apple Health.',
    date: 'September 24, 2026',
    verified: true,
    helpfulCount: 21
  },
  {
    id: 'rev-3',
    productId: 'prod-leather-handbag',
    productName: 'Artisan Leather Handbag',
    userName: 'Sophia Martinez',
    rating: 5,
    title: 'The leather smells heavenly & hardware is top tier',
    comment: 'The cognac leather has a rich patina right out of the dust bag. Holds my 13-inch MacBook Air, notebook, and cosmetic pouch without looking bulky. NovaMart delivered in 2 days!',
    date: 'September 21, 2026',
    verified: true,
    helpfulCount: 45
  },
  {
    id: 'rev-4',
    productId: 'prod-essential-hoodie',
    productName: 'Essential Fleece Hoodie',
    userName: 'Jordan Lee',
    rating: 5,
    title: 'Heavyweight quality like luxury streetwear brands',
    comment: 'The 420 GSM weight is no joke—it feels substantial, warm, and holds its boxy structured drape perfectly. Best hoodie I have bought this season.',
    date: 'September 18, 2026',
    verified: true,
    helpfulCount: 19
  },
  {
    id: 'rev-5',
    productId: 'prod-classic-sneakers',
    productName: 'Classic Minimalist Sneakers',
    userName: 'David Chen',
    rating: 4,
    title: 'Incredibly comfortable memory foam sole',
    comment: 'Wore these for 15,000 steps around town on day one with zero blisters. Clean styling pairs with both tailored trousers and weekend shorts.',
    date: 'September 15, 2026',
    verified: true,
    helpfulCount: 14
  },
  {
    id: 'rev-6',
    productId: 'prod-eau-de-parfum',
    productName: 'L’Aura Eau de Parfum (100ml)',
    userName: 'Amara Williams',
    rating: 5,
    title: 'Compliment magnet! Subtle yet long-lasting',
    comment: 'A warm, sophisticated vanilla and cedar dry-down that isn’t overpowering. Lasts all workday into evening dinner. Packaging looks gorgeous on my vanity.',
    date: 'September 10, 2026',
    verified: true,
    helpfulCount: 27
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'NM-8492',
    date: 'October 1, 2026',
    status: 'In Transit',
    estimatedDelivery: 'October 5, 2026',
    trackingNumber: 'TRK-982341908US',
    paymentMethod: 'Visa ending in 4242',
    subtotal: 109.98,
    discount: 11.00,
    shipping: 0.00,
    total: 98.98,
    shippingAddress: {
      name: 'Aryan Raturi',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-smartwatch-pro',
        productName: 'Smart Watch Pro',
        price: 59.99,
        quantity: 1,
        selectedColor: 'Midnight Black',
        imageKey: 'smartwatch'
      },
      {
        productId: 'prod-classic-sneakers',
        productName: 'Classic Minimalist Sneakers',
        price: 49.99,
        quantity: 1,
        selectedSize: '9',
        selectedColor: 'Pure White',
        imageKey: 'sneakers'
      }
    ],
    timeline: [
      {
        status: 'Order Placed',
        date: 'Oct 01, 2026 · 10:14 AM',
        description: 'Your order was successfully verified and confirmed.',
        completed: true
      },
      {
        status: 'Processing in Fulfillment Hub',
        date: 'Oct 01, 2026 · 02:40 PM',
        description: 'Items carefully inspected and packed in eco-friendly packaging.',
        completed: true
      },
      {
        status: 'In Transit',
        date: 'Oct 02, 2026 · 08:30 AM',
        description: 'Carrier scanned package at West Coast Logistics Center.',
        completed: true,
        current: true
      },
      {
        status: 'Out for Delivery',
        date: 'Expected Oct 05, 2026',
        description: 'Local courier will dispatch for final doorstep delivery.',
        completed: false
      },
      {
        status: 'Delivered',
        date: 'Expected Oct 05, 2026',
        description: 'Package handed to recipient or placed in secure parcel locker.',
        completed: false
      }
    ]
  },
  {
    id: 'NM-8410',
    date: 'September 26, 2026',
    status: 'Delivered',
    estimatedDelivery: 'September 28, 2026',
    trackingNumber: 'TRK-981290481US',
    paymentMethod: 'Mastercard ending in 8819',
    subtotal: 69.98,
    discount: 0.00,
    shipping: 0.00,
    total: 69.98,
    shippingAddress: {
      name: 'Aryan Raturi',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-essential-hoodie',
        productName: 'Essential Fleece Hoodie',
        price: 39.99,
        quantity: 1,
        selectedSize: 'L',
        selectedColor: 'Sand Khaki',
        imageKey: 'hoodie'
      },
      {
        productId: 'prod-eau-de-parfum',
        productName: 'L’Aura Eau de Parfum (100ml)',
        price: 29.99,
        quantity: 1,
        imageKey: 'perfume'
      }
    ],
    timeline: [
      {
        status: 'Order Placed',
        date: 'Sep 26, 2026 · 04:12 PM',
        description: 'Payment authorized successfully.',
        completed: true
      },
      {
        status: 'Dispatched',
        date: 'Sep 27, 2026 · 09:00 AM',
        description: 'Package picked up by express courier.',
        completed: true
      },
      {
        status: 'Delivered',
        date: 'Sep 28, 2026 · 01:25 PM',
        description: 'Delivered to recipient doorstep. Signed by resident.',
        completed: true,
        current: true
      }
    ]
  },
  {
    id: 'NM-7921',
    date: 'September 10, 2026',
    status: 'Delivered',
    estimatedDelivery: 'September 13, 2026',
    trackingNumber: 'TRK-978119203US',
    paymentMethod: 'Apple Pay',
    subtotal: 59.99,
    discount: 5.00,
    shipping: 0.00,
    total: 54.99,
    shippingAddress: {
      name: 'Aryan Raturi',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States'
    },
    items: [
      {
        productId: 'prod-leather-handbag',
        productName: 'Artisan Leather Handbag',
        price: 59.99,
        quantity: 1,
        selectedColor: 'Caramel Tan',
        imageKey: 'handbag'
      }
    ],
    timeline: [
      {
        status: 'Order Placed',
        date: 'Sep 10, 2026 · 11:20 AM',
        description: 'Order confirmed.',
        completed: true
      },
      {
        status: 'Delivered',
        date: 'Sep 13, 2026 · 03:45 PM',
        description: 'Delivered securely to front desk reception.',
        completed: true,
        current: true
      }
    ]
  }
];

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Aryan Raturi',
  email: 'raturiaryan147@gmail.com',
  phone: '+1 (415) 890-2341',
  membershipTier: 'Nova Gold Member',
  memberSince: 'March 2025',
  rewardPoints: 450,
  addresses: [
    {
      id: 'addr-1',
      title: 'Home (Default)',
      name: 'Aryan Raturi',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'San Francisco',
      state: 'CA',
      zip: '94107',
      country: 'United States',
      isDefault: true
    },
    {
      id: 'addr-2',
      title: 'Design Studio / Office',
      name: 'Aryan Raturi',
      street: '500 Howard Street, Suite 300',
      city: 'San Francisco',
      state: 'CA',
      zip: '94105',
      country: 'United States',
      isDefault: false
    }
  ]
};
