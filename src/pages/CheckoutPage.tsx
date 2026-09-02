import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { orderService } from '../services/order.service';
import { paymentService } from '../services/payment.service';
import { 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  CreditCard, 
  RefreshCw,
  Banknote
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discountAmount, clearCart } = useCart();
  const { navigate, setLastOrder } = useNavigation();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    orderNotes: '',
  });

  const [shippingMethod, setShippingMethod] = useState<string>('Standard Eco Shipping (3–5 Days)');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'ONLINE'>('COD');
  const [discountCode, setDiscountCode] = useState<string>('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(discountAmount);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentStatusText, setPaymentStatusText] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Shipping Fee Logic
  const subtotalAfterDiscount = Math.max(0, subtotal - appliedDiscount);
  const shippingFee = subtotalAfterDiscount >= 999 ? 0 : 80;
  const grandTotal = subtotalAfterDiscount + shippingFee;

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.firstName.trim()) errs.firstName = 'First name is required';
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) errs.email = 'Valid email is required';
    if (!formData.address.trim()) errs.address = 'Street address is required';
    if (!formData.city.trim()) errs.city = 'City is required';
    if (!formData.postalCode.trim()) errs.postalCode = 'Postal code is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAutofillDemo = () => {
    setFormData({
      firstName: 'Karthik',
      lastName: 'Subbaraj',
      email: 'karthik.art@example.com',
      phone: '9876543210',
      address: '42 Beach Road, Near Promenade',
      apartment: 'Suite 4B',
      city: 'Puducherry',
      state: 'Puducherry',
      postalCode: '605001',
      country: 'India',
      orderNotes: 'Handle fragile matte print tube with care.',
    });
    setErrors({});
    addToast({
      title: 'Demo Details Auto-filled ⚡',
      message: 'Sample customer address loaded.',
      type: 'info',
    });
  };

  const handleApplyDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (discountCode.trim().toUpperCase() === 'STUDIO10') {
      const disc = Math.round(subtotal * 0.1);
      setAppliedDiscount(disc);
      addToast({
        title: 'Coupon Applied! 🎉',
        message: '10% Studio discount subtracted from total.',
        type: 'success',
      });
    } else {
      addToast({
        title: 'Invalid Coupon Code',
        message: 'Try promo code STUDIO10 for 10% off.',
        type: 'info',
      });
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      addToast({
        title: 'Missing Required Fields',
        message: 'Please complete all required shipping fields highlighted in red.',
        type: 'info',
      });
      return;
    }

    setIsSubmitting(true);
    setPaymentStatusText(null);

    try {
      // 1. Create Backend Order in PostgreSQL
      const createdOrder = await orderService.createOrder({
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone || '9876543210',
          address: formData.address,
          apartment: formData.apartment,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          orderNotes: formData.orderNotes,
        },
        items: items,
        subtotal: subtotal,
        discount: appliedDiscount,
        discountCode: discountCode || undefined,
        shippingCost: shippingFee,
        shippingMethod: shippingMethod,
        tax: 0,
        total: grandTotal,
        paymentMethod: paymentMethod,
        estimatedDelivery: '3–5 Business Days',
      });

      // 2. Handle Cash on Delivery (COD) Flow
      if (paymentMethod === 'COD') {
        setLastOrder(createdOrder);
        clearCart();
        addToast({
          title: 'Order Confirmed! 🎨',
          message: `Order #${createdOrder.orderId} placed successfully via COD.`,
          type: 'success',
        });
        navigate('order-confirmation');
        return;
      }

      // 3. Handle Online Payment Flow (Razorpay vs Development Provider)
      setPaymentStatusText('Initializing secure online payment gateway...');
      
      const payOrder = await paymentService.createPaymentOrder(createdOrder.orderId);

      // If active backend provider is Razorpay, launch official Razorpay Popup Checkout SDK
      if (payOrder.provider === 'razorpay') {
        const sdkLoaded = await paymentService.loadRazorpaySdk();
        if (!sdkLoaded || typeof (window as any).Razorpay === 'undefined') {
          throw new Error('Failed to load Razorpay payment gateway SDK. Please check your network connection.');
        }

        const options = {
          key: payOrder.keyId,
          amount: payOrder.amount, // Amount in paise
          currency: payOrder.currency,
          name: 'Stick Scape Studio',
          description: `Order #${createdOrder.orderId}`,
          order_id: payOrder.paymentOrderId,
          handler: async (response: any) => {
            try {
              setPaymentStatusText('Verifying cryptographic signature with server...');
              const verifiedOrder = await paymentService.verifyPayment({
                orderNumber: createdOrder.orderId,
                paymentOrderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              });

              setLastOrder(verifiedOrder);
              clearCart();
              addToast({
                title: 'Online Payment Verified! 💳',
                message: `Order #${verifiedOrder.orderId} paid and confirmed.`,
                type: 'success',
              });
              navigate('order-confirmation');
            } catch (err: any) {
              setPaymentStatusText(null);
              setIsSubmitting(false);
              addToast({
                title: 'Payment Verification Failed',
                message: err.message || 'Cryptographic payment verification failed.',
                type: 'info',
              });
            }
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setPaymentStatusText(null);
              addToast({
                title: 'Payment Window Closed',
                message: 'Online payment was not completed. You can retry payment for your order.',
                type: 'info',
              });
            },
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone || '9876543210',
          },
          theme: {
            color: '#c97a63',
          },
        };

        const razorpayInstance = new (window as any).Razorpay(options);
        razorpayInstance.open();
        return;
      }

      // Development Mode Payment Verification Simulation
      setPaymentStatusText('Verifying development payment signature with backend...');

      const mockPayId = `pay_online_${Date.now()}`;
      const verifiedOrder = await paymentService.verifyPayment({
        orderNumber: createdOrder.orderId,
        paymentOrderId: payOrder.paymentOrderId,
        paymentId: mockPayId,
        signature: 'dev_mock_signature',
      });

      setLastOrder(verifiedOrder);
      clearCart();
      addToast({
        title: 'Online Payment Verified! 💳',
        message: `Order #${verifiedOrder.orderId} paid and confirmed.`,
        type: 'success',
      });
      navigate('order-confirmation');
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentStatusText(null);
      addToast({
        title: 'Payment / Order Placement Failed',
        message: err.message || 'Payment could not be completed. Please try again.',
        type: 'info',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-black text-2xl text-white">Your bag is empty</h2>
        <p className="text-sm text-studio-muted">Add some wall art before heading to checkout!</p>
        <button
          onClick={() => navigate('shop')}
          className="bg-studio-terracotta text-black px-6 py-3 rounded-xl font-display font-bold text-xs uppercase hover:bg-purple-400 transition-colors shadow-md"
        >
          Explore Prints
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" /> Secure 256-Bit Checkout
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
            Checkout &amp; Shipping
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAutofillDemo}
            className="text-xs bg-studio-sand hover:bg-studio-terracotta hover:text-black text-purple-200 border border-studio-border font-mono px-3.5 py-2 rounded-xl transition-colors font-bold"
          >
            ⚡ Auto-Fill Demo Address
          </button>
          <button
            onClick={() => navigate('cart')}
            className="text-xs font-mono text-purple-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
          </button>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact, Shipping, & Payment Forms (Col 7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Contact Information */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-4">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black text-xs font-mono font-bold flex items-center justify-center">1</span>
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">
                  Email Address (for order tracking &amp; receipt) *
                </label>
                <input
                  type="email"
                  placeholder="your.email@domain.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.email ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.email && <span className="text-[11px] text-red-400 font-mono">{errors.email}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">
                  Mobile Number (required for order tracking) *
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-4">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black text-xs font-mono font-bold flex items-center justify-center">2</span>
              Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">First Name *</label>
                <input
                  type="text"
                  placeholder="Karthik"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.firstName ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.firstName && <span className="text-[11px] text-red-400 font-mono">{errors.firstName}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">Last Name *</label>
                <input
                  type="text"
                  placeholder="Subbaraj"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.lastName ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.lastName && <span className="text-[11px] text-red-400 font-mono">{errors.lastName}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">Street Address *</label>
                <input
                  type="text"
                  placeholder="House / Flat / Street address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.address ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.address && <span className="text-[11px] text-red-400 font-mono">{errors.address}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">City *</label>
                <input
                  type="text"
                  placeholder="Puducherry"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.city ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.city && <span className="text-[11px] text-red-400 font-mono">{errors.city}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">State / Region</label>
                <input
                  type="text"
                  placeholder="Puducherry"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">Postal / PIN Code *</label>
                <input
                  type="text"
                  placeholder="605001"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none ${
                    errors.postalCode ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.postalCode && <span className="text-[11px] text-red-400 font-mono">{errors.postalCode}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full bg-studio-sand/50 border border-studio-border rounded-xl px-4 py-2.5 text-xs text-neutral-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery Method */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-4">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black text-xs font-mono font-bold flex items-center justify-center">3</span>
              Delivery Method
            </h3>

            <div className="space-y-2.5">
              {[
                { id: 'Standard Eco Shipping (3–5 Days)', desc: '100% plastic-free rigid kraft packaging', price: shippingFee === 0 ? 'FREE' : `₹${Math.round(shippingFee)}` },
                { id: 'Express Studio Courier (1–2 Days)', desc: 'Priority printing cue & expedited tracking', price: '+₹99' },
              ].map((method) => (
                <label
                  key={method.id}
                  onClick={() => setShippingMethod(method.id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    shippingMethod === method.id
                      ? 'border-purple-500 bg-purple-950/60 ring-1 ring-purple-500'
                      : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="accent-purple-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-purple-400" />
                        {method.id}
                      </div>
                      <div className="text-[11px] text-studio-muted">{method.desc}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-purple-300">{method.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-4">
            <h3 className="font-display font-black text-lg text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black text-xs font-mono font-bold flex items-center justify-center">4</span>
              Payment Option
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* COD Option */}
              <label
                onClick={() => setPaymentMethod('COD')}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-studio-terracotta bg-purple-950/70 shadow-lg ring-1 ring-studio-terracotta'
                    : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-studio-terracotta mt-1"
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-studio-terracotta" />
                    Cash on Delivery (COD)
                  </div>
                  <p className="text-[11px] text-studio-muted font-mono leading-relaxed">
                    Pay in cash upon doorstep delivery. No advance online payment required.
                  </p>
                </div>
              </label>

              {/* Online Payment Option */}
              <label
                onClick={() => setPaymentMethod('ONLINE')}
                className={`p-4 rounded-2xl border flex items-start gap-3 cursor-pointer transition-all ${
                  paymentMethod === 'ONLINE'
                    ? 'border-purple-500 bg-purple-950/70 shadow-lg ring-1 ring-purple-500'
                    : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="accent-purple-500 mt-1"
                />
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-purple-400" />
                    Online Payment (Razorpay / UPI / Cards)
                  </div>
                  <p className="text-[11px] text-studio-muted font-mono leading-relaxed">
                    Instant secure payment via Cards, UPI, NetBanking, and Wallets.
                  </p>
                </div>
              </label>

            </div>

            {paymentStatusText && (
              <div className="bg-purple-950/90 border border-purple-500/50 p-3.5 rounded-2xl text-xs font-mono text-purple-200 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-studio-terracotta flex-shrink-0" />
                <span>{paymentStatusText}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar (Col 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-xl space-y-6">
            <h3 className="font-display font-black text-xl text-white pb-4 border-b border-studio-border">
              Order Summary ({items.reduce((s, i) => s + i.quantity, 0)} Items)
            </h3>

            {/* Cart Items List */}
            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.cartItemId} className="flex items-center gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover border border-studio-border flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-white truncate">{item.name}</h4>
                    <p className="text-[11px] text-studio-muted font-mono">
                      {item.selectedSize.name} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-mono font-bold text-xs text-white">
                    ₹{Math.round(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Code Input */}
            <form onSubmit={handleApplyDiscount} className="flex gap-2 pt-2 border-t border-studio-border">
              <input
                type="text"
                placeholder="Promo Code (STUDIO10)"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 bg-studio-sand border border-studio-border rounded-xl px-3.5 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono uppercase"
              />
              <button
                type="submit"
                className="bg-studio-sand hover:bg-studio-terracotta hover:text-black border border-studio-border text-purple-200 font-mono text-xs font-bold px-4 rounded-xl transition-colors"
              >
                Apply
              </button>
            </form>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-studio-border font-mono text-xs">
              <div className="flex justify-between text-studio-muted">
                <span>Subtotal</span>
                <span>₹{Math.round(subtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Studio Coupon Discount</span>
                  <span>-₹{Math.round(appliedDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-studio-muted">
                <span>Shipping Fee</span>
                <span>{shippingFee === 0 ? 'FREE (≥ ₹999)' : `₹${Math.round(shippingFee)}`}</span>
              </div>

              <div className="flex justify-between text-white font-bold text-base pt-3 border-t border-studio-border">
                <span>Total Payable</span>
                <span className="text-studio-terracotta">₹{Math.round(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 text-black" />
                  <span>{paymentMethod === 'COD' ? 'Confirm & Place Order (COD)' : 'Proceed to Online Payment'}</span>
                </>
              )}
            </button>

            <div className="text-center text-[10px] text-studio-muted font-mono flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Stick Scape Purchase Protection Guaranteed</span>
            </div>

          </div>

        </div>

      </form>
    </div>
  );
};
