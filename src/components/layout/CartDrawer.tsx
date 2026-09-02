import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigation } from '../../context/NavigationContext';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Sparkles, 
  Truck,
  Tag
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    shippingFee,
    grandTotal,
    totalItemsCount,
    appliedPromo,
    applyPromo,
    removePromo,
    freeShippingThreshold,
    amountToFreeShipping,
  } = useCart();

  const { navigate } = useNavigation();
  const [couponInput, setCouponInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError?: boolean } | null>(null);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const result = applyPromo(couponInput);
    if (result.success) {
      setPromoMessage({ text: result.message, isError: false });
      setCouponInput('');
    } else {
      setPromoMessage({ text: result.message, isError: true });
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-studio-dark/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-studio-card shadow-2xl border-l border-studio-border flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-studio-border bg-studio-sand/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-studio-terracotta" />
                <h3 className="font-display font-bold text-lg text-studio-dark">Your Studio Bag</h3>
                <span className="bg-studio-dark text-white font-mono text-xs px-2 py-0.5 rounded-full font-bold">
                  {totalItemsCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-studio-muted hover:text-studio-dark rounded-lg hover:bg-studio-sand transition-colors"
                aria-label="Close bag"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Free Shipping Bar */}
            <div className="mt-4 pt-3 border-t border-studio-border/60">
              {amountToFreeShipping > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-studio-charcoal">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Truck className="w-3.5 h-3.5 text-purple-400" />
                      Add <strong className="text-purple-400 font-mono font-bold">₹{Math.round(amountToFreeShipping)}</strong> for Free Shipping!
                    </span>
                    <span className="font-mono text-[11px] text-purple-300">{freeShippingProgress}%</span>
                  </div>
                  <div className="w-full bg-studio-border h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-studio-terracotta h-full rounded-full transition-all duration-500"
                      style={{ width: `${freeShippingProgress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold text-studio-sage bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-200">
                  <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Unlocked! You qualify for Free Worldwide Shipping! 🎉</span>
                </div>
              )}
            </div>
          </div>

          {/* Drawer Body / Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 divide-y divide-studio-border/50">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 bg-studio-sand rounded-full flex items-center justify-center mb-4 text-studio-muted">
                  <ShoppingBag className="w-8 h-8 stroke-1" />
                </div>
                <h4 className="font-display font-bold text-lg text-studio-dark">Your bag is empty</h4>
                <p className="text-sm text-studio-muted mt-1 max-w-xs">
                  Discover our aesthetic art prints, retro Polaroids, and bedroom wall bundles.
                </p>
                <button
                  onClick={() => {
                    closeCart();
                    navigate('shop');
                  }}
                  className="mt-6 bg-studio-terracotta text-black font-bold px-6 py-2.5 rounded-full text-xs uppercase tracking-wider hover:bg-purple-400 transition-colors shadow-md"
                >
                  Explore Collection
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.cartItemId} className="pt-4 first:pt-0 flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-lg border border-studio-border shadow-sm flex-shrink-0"
                  />

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 
                          onClick={() => {
                            closeCart();
                            navigate('product', { id: item.id });
                          }}
                          className="text-sm font-bold text-studio-dark hover:text-studio-terracotta cursor-pointer transition-colors truncate"
                        >
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.cartItemId)}
                          className="text-studio-muted hover:text-red-500 p-1 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-studio-muted mt-0.5 truncate">
                        {item.selectedSize.name}
                      </p>

                      {item.selectedFinish && (
                        <p className="text-[11px] text-studio-sage font-medium truncate">
                          &bull; {item.selectedFinish.name}
                        </p>
                      )}
                    </div>

                    {/* Quantity & Unit Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-studio-border rounded-lg bg-studio-sand/40">
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                          className="p-1 text-studio-charcoal hover:text-studio-dark hover:bg-studio-sand rounded-l-md transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-2.5 font-mono text-xs font-semibold text-studio-dark">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                          className="p-1 text-studio-charcoal hover:text-studio-dark hover:bg-studio-sand rounded-r-md transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-mono text-sm font-bold text-white">
                        ₹{Math.round(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Drawer Footer & Checkout Controls */}
          {items.length > 0 && (
            <div className="p-6 border-t border-studio-border bg-studio-sand/20 space-y-4">
              
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-studio-muted absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. STICK10)"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full text-xs bg-studio-sand border border-studio-border rounded-lg pl-9 pr-3 py-2 uppercase font-mono text-white placeholder:text-neutral-500 focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-studio-terracotta text-black font-bold px-3 py-2 rounded-lg text-xs hover:bg-purple-400 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {appliedPromo && (
                  <div className="flex items-center justify-between bg-purple-950 text-purple-200 text-xs px-3 py-1.5 rounded-lg border border-purple-500/40">
                    <span className="font-mono font-semibold">
                      🏷️ {appliedPromo.code} ({appliedPromo.percent}% OFF)
                    </span>
                    <button
                      type="button"
                      onClick={removePromo}
                      className="text-purple-300 font-bold hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {promoMessage && !appliedPromo && (
                  <p className={`text-xs ${promoMessage.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                    {promoMessage.text}
                  </p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-studio-charcoal pt-2 border-t border-studio-border/60">
                <div className="flex justify-between">
                  <span className="text-studio-muted">Subtotal</span>
                  <span className="font-mono font-medium text-white">₹{Math.round(subtotal)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-purple-400 font-medium">
                    <span>Discount ({appliedPromo?.code})</span>
                    <span className="font-mono">-₹{Math.round(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-studio-muted">Estimated Shipping</span>
                  <span className="font-mono">
                    {shippingFee === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${Math.round(shippingFee)}`}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-studio-border text-sm font-bold text-white">
                  <span>Estimated Total</span>
                  <span className="font-mono text-base text-white">₹{Math.round(grandTotal)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    closeCart();
                    navigate('checkout');
                  }}
                  className="w-full bg-studio-terracotta text-black font-bold py-3.5 rounded-xl font-display text-sm uppercase tracking-wider hover:bg-purple-400 transition-colors shadow-md flex items-center justify-center gap-2 group"
                >
                  <span className="text-black font-bold">Checkout Now</span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    closeCart();
                    navigate('cart');
                  }}
                  className="w-full bg-studio-sand text-purple-200 border border-studio-border py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-studio-terracotta hover:text-black transition-colors text-center"
                >
                  View Full Cart &amp; Details
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
