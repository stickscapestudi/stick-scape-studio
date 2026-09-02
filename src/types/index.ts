export type ProductCategory = 'posters' | 'polaroids' | 'bundles';

export type AestheticTheme = 
  | 'All'
  | 'Minimalist' 
  | 'Anime & Manga' 
  | 'Cinematic & Movie' 
  | 'Retro Film' 
  | 'Botanical & Nature' 
  | 'Cyberpunk & Neon' 
  | 'Vintage Music'
  | 'Abstract & Bauhaus';

export interface ProductSize {
  id: string;
  name: string;
  dimensions: string;
  priceMultiplier: number;
  inStock: boolean;
}

export interface ProductFinish {
  id: string;
  name: string;
  priceAdd: number;
  description: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  theme: AestheticTheme;
  price: number; // Base price in USD
  originalPrice?: number;
  tags: string[];
  description: string;
  shortDescription: string;
  images: string[];
  mockupImages?: {
    flat: string;
    wall: string;
    detail: string;
    inHand?: string;
  };
  sizes: ProductSize[];
  finishes?: ProductFinish[];
  rating: number;
  reviewCount: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
  bundleItemsCount?: number;
  paperSpecs: string;
  inventoryCount: number;
}

export interface CartItem {
  cartItemId: string; // Unique composite key (productId_sizeId_finishId)
  id: string;
  name: string;
  category: ProductCategory;
  basePrice: number;
  unitPrice: number;
  image: string;
  selectedSize: ProductSize;
  selectedFinish?: ProductFinish;
  quantity: number;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  productTitle: string;
  verified: boolean;
  location: string;
  avatar: string;
  roomPhoto?: string;
}

export interface CustomerShippingDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  orderNotes?: string;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface CreateOrderRequest {
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  shippingMethod: string;
  tax: number;
  total: number;
  customer: CustomerShippingDetails;
  paymentMethod: string;
  estimatedDelivery: string;
}

export interface OrderConfirmationData {
  orderId: string;
  orderDate: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountCode?: string;
  shippingCost: number;
  shippingMethod: string;
  tax: number;
  total: number;
  customer: CustomerShippingDetails;
  paymentMethod: string;
  paymentStatus?: string;
  paymentProvider?: string;
  estimatedDelivery: string;
  status: OrderStatus;
}

export type Order = OrderConfirmationData;

export interface OrderResponse {
  success: boolean;
  message?: string;
  data?: OrderConfirmationData | OrderConfirmationData[];
  count?: number;
  error?: string;
}

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'cart';
  image?: string;
}
