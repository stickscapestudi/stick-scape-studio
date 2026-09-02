import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product, ProductSize, ProductFinish, CartItem } from '../types';
import { PROMO_CODES } from '../data/products';
import { useToast } from './ToastContext';

interface PromoState {
  code: string;
  percent: number;
  description: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, size: ProductSize, finish?: ProductFinish, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQty: number) => void;
  clearCart: () => void;
  
  // Drawer visibility
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  
  // Promo code
  appliedPromo: PromoState | null;
  applyPromo: (code: string) => { success: boolean; message: string };
  removePromo: () => void;
  
  // Calculated totals
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  grandTotal: number;
  totalItemsCount: number;
  freeShippingThreshold: number;
  amountToFreeShipping: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'stick_scape_cart_v1';
const PROMO_STORAGE_KEY = 'stick_scape_promo_v1';
const FREE_SHIPPING_THRESHOLD = 499.00;
const STANDARD_SHIPPING_FEE = 49.00;
const TAX_RATE = 0.05; // 5% GST

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedPromo, setAppliedPromo] = useState<PromoState | null>(() => {
    try {
      const saved = localStorage.getItem(PROMO_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to localStorage', e);
    }
  }, [items]);

  useEffect(() => {
    try {
      if (appliedPromo) {
        localStorage.setItem(PROMO_STORAGE_KEY, JSON.stringify(appliedPromo));
      } else {
        localStorage.removeItem(PROMO_STORAGE_KEY);
      }
    } catch (e) {
      console.error('Failed to save promo to localStorage', e);
    }
  }, [appliedPromo]);

  const addToCart = (product: Product, size: ProductSize, finish?: ProductFinish, quantity: number = 1) => {
    const finishId = finish ? finish.id : 'standard';
    const cartItemId = `${product.id}_${size.id}_${finishId}`;
    
    // Calculate final unit price
    const unitPrice = parseFloat((product.price * size.priceMultiplier + (finish?.priceAdd || 0)).toFixed(2));

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.cartItemId === cartItemId);
      if (existingIndex > -1) {
        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          cartItemId,
          id: product.id,
          name: product.name,
          category: product.category,
          basePrice: product.price,
          unitPrice,
          image: product.images[0],
          selectedSize: size,
          selectedFinish: finish,
          quantity,
        };
        return [...prevItems, newItem];
      }
    });

    addToast({
      title: 'Added to Bag',
      message: `${quantity}× ${product.name} (${size.name})`,
      type: 'cart',
      image: product.images[0],
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (cartItemId: string) => {
    const itemToRemove = items.find((i) => i.cartItemId === cartItemId);
    setItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId));
    if (itemToRemove) {
      addToast({
        title: 'Removed from Bag',
        message: `${itemToRemove.name} was removed from your bag.`,
        type: 'info',
      });
    }
  };

  const updateQuantity = (cartItemId: string, newQty: number) => {
    if (newQty <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setAppliedPromo(null);
  };

  const applyPromo = (code: string): { success: boolean; message: string } => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { success: false, message: 'Please enter a valid coupon code.' };
    }

    const promo = PROMO_CODES[normalized];
    if (promo) {
      const newPromo: PromoState = {
        code: normalized,
        percent: promo.discountPercent,
        description: promo.description,
      };
      setAppliedPromo(newPromo);
      addToast({
        title: 'Promo Applied! ✨',
        message: `${promo.description} (${normalized})`,
        type: 'success',
      });
      return { success: true, message: `Promo code "${normalized}" applied successfully!` };
    } else {
      return { success: false, message: 'Invalid promo code. Try "STICK10" for 10% off.' };
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    addToast({
      title: 'Promo Removed',
      message: 'Discount code has been cleared.',
      type: 'info',
    });
  };

  // Calculations
  const subtotal = parseFloat(
    items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0).toFixed(2)
  );

  const discountAmount = appliedPromo
    ? parseFloat(((subtotal * appliedPromo.percent) / 100).toFixed(2))
    : 0;

  const isFreeShippingByPromo = appliedPromo?.code === 'FREESHIP';
  const qualifiesForFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD || isFreeShippingByPromo;
  const shippingFee = items.length === 0 ? 0 : (qualifiesForFreeShipping ? 0 : STANDARD_SHIPPING_FEE);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = parseFloat((taxableAmount * TAX_RATE).toFixed(2));
  const grandTotal = parseFloat((taxableAmount + shippingFee + taxAmount).toFixed(2));

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const amountToFreeShipping = Math.max(0, parseFloat((FREE_SHIPPING_THRESHOLD - subtotal).toFixed(2)));

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        toggleCart: () => setIsCartOpen((prev) => !prev),
        appliedPromo,
        applyPromo,
        removePromo,
        subtotal,
        discountAmount,
        shippingFee,
        taxAmount,
        grandTotal,
        totalItemsCount,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        amountToFreeShipping,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
