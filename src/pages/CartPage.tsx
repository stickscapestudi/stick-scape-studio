import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ArrowLeft, 
  Truck, 
  Sparkles, 
  Tag, 
  ShieldCheck 
} from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discountAmount,
    shippingFee,
    taxAmount,
    grandTotal,
    appliedPromo,
    applyPromo,
    removePromo,
    freeShippingThreshold,
    amountToFreeShipping,
  } = useCart();

  const { navigate } = useNavigation();
  const [couponCode, setCouponCode] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = applyPromo(couponCode);
    if (res.success) {
      setCouponFeedback({ text: res.message, isError: false });
      setCouponCode('');
    } else {
      setCouponFeedback({ text: res.message, isError: true });
    }
  };

  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-studio-card rounded-3xl flex items-center justify-center mx-auto text-purple-400 border border-studio-border">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
          Your Studio Bag is Empty
        </h1>
        <p className="text-sm text-studio-muted max-w-md mx-auto leading-relaxed">
          Looks like you haven't picked any art prints or Polaroid sets yet. Explore our fresh drops and build your bedroom wall gallery.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('shop')}
            className="bg-studio-terracotta hover:bg-purple-400 text-black px-8 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md inline-flex items-center gap-2"
          >
            <span className="text-black font-bold">Explore All Art Prints</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-border">
        <div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
            Your Shopping Bag
          </h1>
          <p className="text-xs text-studio-muted font-mono mt-1">
            Review items, customize quantities, and apply promo codes
          </p>
        </div>

        <button
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-purple-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </button>
      </div>

      {/* Free Shipping Alert Bar */}
      <div className="bg-studio-card rounded-2xl p-5 border border-purple-500/30 shadow-sm space-y-2">
        {amountToFreeShipping > 0 ? (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="flex items-center gap-2 font-bold text-white">
                <Truck className="w-4 h-4 text-purple-400" />
                Add <strong className="text-purple-400 font-mono font-bold">₹{Math.round(amountToFreeShipping)}</strong> more for Free Worldwide Shipping!
              </span>
              <span className="font-mono text-purple-300">{freeShippingProgress}%</span>
            </div>
            <div className="w-full bg-studio-sand h-2.5 rounded-full overflow-hidden border border-studio-border">
              <div
                className="bg-studio-terracotta h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-4 py-2.5 rounded-xl border border-emerald-500/40">
            <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Awesome! Your bag qualifies for Free Worldwide Shipping &amp; Eco-Packaging! 🎉</span>
          </div>
        )}
      </div>

      {/* Main Grid: Item Table & Order Summary Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List (Col 8) */}
        <div className="lg:col-span-8 bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-studio-border">
            <span className="font-mono text-xs uppercase font-bold text-purple-300">Selected Items</span>
            <button
              onClick={clearCart}
              className="text-xs font-mono text-red-400 hover:underline"
            >
              Clear Entire Bag
            </button>
          </div>

          <div className="divide-y divide-studio-border">
            {items.map((item) => (
              <div key={item.cartItemId} className="py-6 first:pt-0 last:pb-0 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                
                {/* Thumbnail and Info */}
                <div className="flex gap-4 items-center flex-1">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-20 h-24 object-cover rounded-xl border border-purple-500/30 shadow-sm flex-shrink-0 cursor-pointer"
                    onClick={() => navigate('product', { id: item.id })}
                  />
                  <div className="space-y-1">
                    <h3 
                      onClick={() => navigate('product', { id: item.id })}
                      className="font-display font-bold text-base text-white hover:text-purple-400 cursor-pointer transition-colors"
                    >
                      {item.name}
                    </h3>
                    <div className="text-xs font-mono text-studio-muted">
                      {item.selectedSize.name} &bull; <span className="text-purple-200">{item.selectedSize.dimensions}</span>
                    </div>
                    {item.wrappingStyle && (
                      <div className="text-[11px] text-purple-300 font-medium">
                        Wrapping: {item.wrappingStyle}
                      </div>
                    )}
                    {item.selectedFinish && (
                      <div className="text-[11px] text-purple-300 font-medium">
                        Ribbon / Finish: {item.selectedFinish.name}
                      </div>
                    )}
                    {item.fairyLights && (
                      <div className="text-[11px] text-amber-300 font-mono font-medium">
                        ✨ + Fairy Lights Glow Added
                      </div>
                    )}
                    {item.giftNote && (
                      <div className="text-[11px] text-studio-muted font-serif italic">
                        Gift Card: "{item.giftNote}"
                      </div>
                    )}
                    <div className="font-mono text-xs text-white font-semibold sm:hidden pt-1">
                      ₹{Math.round(item.unitPrice)} each
                    </div>
                  </div>
                </div>

                {/* Quantity Controls and Total */}
                <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0">
                  
                  {/* Stepper */}
                  <div className="flex items-center border border-studio-border rounded-xl bg-studio-sand">
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
                      className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-l-xl transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 font-mono text-xs font-bold text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                      className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-r-xl transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-mono font-bold text-base text-white">
                      ₹{Math.round(item.unitPrice * item.quantity)}
                    </span>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeFromCart(item.cartItemId)}
                    className="p-2 text-studio-muted hover:text-red-400 rounded-lg hover:bg-red-950/40 transition-colors"
                    aria-label="Remove item from bag"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Order Summary Sidebar (Col 4) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-sm space-y-6">
            <h3 className="font-display font-black text-xl text-white">
              Order Summary
            </h3>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-studio-muted absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Coupon (e.g. STICK10)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full text-xs bg-studio-sand border border-studio-border rounded-xl pl-9 pr-3 py-2.5 uppercase font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-studio-terracotta hover:bg-purple-400 text-black px-4 py-2.5 rounded-xl text-xs font-bold uppercase font-mono transition-colors shadow-sm"
                >
                  Apply
                </button>
              </div>

              {appliedPromo && (
                <div className="flex items-center justify-between bg-purple-950/80 text-purple-200 text-xs px-3.5 py-2 rounded-xl border border-purple-500/40">
                  <span className="font-mono font-bold">
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

              {couponFeedback && !appliedPromo && (
                <p className={`text-xs ${couponFeedback.isError ? 'text-red-400' : 'text-emerald-400'}`}>
                  {couponFeedback.text}
                </p>
              )}
            </form>

            {/* Calculations Breakdown */}
            <div className="space-y-3 pt-4 border-t border-studio-border text-xs text-studio-charcoal">
              <div className="flex justify-between">
                <span className="text-studio-muted">Items Subtotal</span>
                <span className="font-mono font-semibold text-white">₹{Math.round(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-purple-400 font-medium">
                  <span>Discount ({appliedPromo?.code})</span>
                  <span className="font-mono">-₹{Math.round(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span className="text-studio-muted">Shipping</span>
                <span className="font-mono">
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">FREE</span>
                  ) : (
                    `₹${Math.round(shippingFee)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-studio-muted">Estimated Tax (5% GST)</span>
                <span className="font-mono font-semibold text-white">₹{Math.round(taxAmount)}</span>
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-studio-border text-base font-bold text-white">
                <span>Grand Total</span>
                <span className="font-mono text-2xl text-white">₹{Math.round(grandTotal)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={() => navigate('checkout')}
              className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 group"
            >
              <span className="text-black font-bold">Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Security Guarantee */}
            <div className="flex items-center justify-center gap-2 text-xs text-studio-muted font-mono pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>SSL 256-bit Encrypted Checkout</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
