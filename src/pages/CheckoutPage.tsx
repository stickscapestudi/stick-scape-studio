import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { orderService } from '../services/order.service';
import { UpiPaymentModal } from '../components/checkout/UpiPaymentModal';
import { 
  Lock, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  RefreshCw,
  Banknote,
  Sparkles,
  CheckCircle2,
  QrCode,
  Copy,
  Check
} from 'lucide-react';

const isPuducherry = (stateName: string, cityName?: string): boolean => {
  const s = (stateName || '').trim().toLowerCase();
  const c = (cityName || '').trim().toLowerCase();
  return (
    s.includes('puducherry') || 
    s.includes('pondicherry') || 
    s === 'py' || 
    c.includes('puducherry') || 
    c.includes('pondicherry')
  );
};

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, discountAmount, clearCart } = useCart();
  const { navigate, setLastOrder } = useNavigation();
  const { addToast } = useToast();
  const { customer, isLoggedIn } = useCustomerAuth();

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

  // Auto-fill from authenticated customer profile
  useEffect(() => {
    if (customer) {
      const nameParts = (customer.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData((prev) => ({
        ...prev,
        firstName: prev.firstName || firstName,
        lastName: prev.lastName || lastName,
        email: prev.email || customer.email || '',
        phone: prev.phone || customer.phone || '',
        address: prev.address || customer.address || '',
        apartment: prev.apartment || customer.apartment || '',
        city: prev.city || customer.city || '',
        state: prev.state || customer.state || '',
        postalCode: prev.postalCode || customer.postalCode || '',
      }));
    }
  }, [customer]);

  const isCodAvailable = isPuducherry(formData.state, formData.city);

  const [shippingMethod, setShippingMethod] = useState<string>('Standard Eco Shipping (3–5 Days)');
  const [paymentMethod, setPaymentMethod] = useState<'UPI_QR' | 'COD'>('UPI_QR');
  const [appliedDiscount] = useState<number>(discountAmount);

  // Auto-switch to UPI if COD was active and state changed to non-Puducherry
  useEffect(() => {
    if (paymentMethod === 'COD' && !isCodAvailable) {
      setPaymentMethod('UPI_QR');
    }
  }, [isCodAvailable, paymentMethod]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentStatusText, setPaymentStatusText] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [upiModalOrder, setUpiModalOrder] = useState<{ orderId: string; total: number; customerName: string } | null>(null);

  // Shipping Fee Logic: FREE for Puducherry / Pondicherry OR orders >= ₹999; otherwise ₹80
  const isFreePuducherry = isPuducherry(formData.state, formData.city);
  const subtotalAfterDiscount = Math.max(0, subtotal - appliedDiscount);
  const shippingFee = isFreePuducherry || subtotalAfterDiscount >= 999 ? 0 : 80;
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
        discountCode: undefined,
        shippingCost: shippingFee,
        shippingMethod: shippingMethod,
        tax: 0,
        total: grandTotal,
        paymentMethod: paymentMethod,
        estimatedDelivery: '3–5 Business Days',
      });

      // 2. Handle Direct UPI QR Payment Flow
      if (paymentMethod === 'UPI_QR') {
        setIsSubmitting(false);
        setUpiModalOrder({
          orderId: createdOrder.orderId,
          total: grandTotal,
          customerName: `${formData.firstName} ${formData.lastName}`,
        });
        return;
      }

      // 3. Handle Cash on Delivery (COD) Flow - Restricted to Puducherry / Pondicherry
      if (paymentMethod === 'COD') {
        if (!isPuducherry(formData.state, formData.city)) {
          setIsSubmitting(false);
          addToast({
            title: 'COD Region Restriction',
            message: 'Cash on Delivery is only available for deliveries within Puducherry / Pondicherry.',
            type: 'error',
          });
          return;
        }

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
    } catch (err: any) {
      console.error('Checkout error:', err);
      setPaymentStatusText(null);
      addToast({
        title: 'Order Placement Failed',
        message: err.message || 'Could not place order. Please try again.',
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
          className="bg-studio-terracotta text-white px-6 py-3 rounded-xl font-display font-bold text-xs uppercase hover:bg-studio-terracotta/90 transition-colors shadow-md"
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
          <h1 className="font-display font-black text-3xl sm:text-4xl text-studio-charcoal mt-1">
            Checkout &amp; <span className="text-purple-400">Shipping</span>
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('cart')}
            className="text-xs font-mono text-purple-400 hover:text-white flex items-center gap-1 font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Bag
          </button>
        </div>
      </div>

      {/* Account Pre-fill Banner */}
      {isLoggedIn && customer ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 to-studio-card border border-purple-500/40 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-purple-950/60 text-purple-400 border border-purple-500/30">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </span>
            <div>
              <p className="text-white font-bold">
                Logged in as <span className="text-purple-400">{customer.name}</span> ({customer.email})
              </p>
              <p className="text-[11px] text-studio-muted">
                Your saved shipping address has been automatically pre-filled.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('account')}
            className="text-[11px] text-purple-400 hover:text-white font-bold underline whitespace-nowrap"
          >
            Manage Profile &rarr;
          </button>
        </div>
      ) : (
        <div className="p-4 rounded-2xl bg-studio-card/80 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-studio-sand text-purple-400 border border-purple-500/20">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </span>
            <div>
              <p className="text-studio-charcoal font-bold">Have a Stick Scape account?</p>
              <p className="text-[11px] text-studio-muted">
                Sign in with Google or Email for 1-click address auto-fill and instant order tracking.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate('login', { redirect: 'checkout' })}
            className="py-1.5 px-3 rounded-lg bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-bold text-xs whitespace-nowrap shadow-md"
          >
            Sign In / Join
          </button>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Column: Contact, Shipping, & Payment Forms (Col 7) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* 1. Contact Information */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg text-studio-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-white text-xs font-mono font-black flex items-center justify-center">1</span>
              Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">
                  Email Address (for order tracking &amp; receipt) *
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.email ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.email && <span className="text-[11px] text-red-400 font-mono">{errors.email}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">
                  Mobile Number (required for order tracking) *
                </label>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none focus:border-studio-terracotta"
                />
              </div>
            </div>
          </div>

          {/* 2. Shipping Address */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg text-studio-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-white text-xs font-mono font-black flex items-center justify-center">2</span>
              Shipping Address
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">First Name *</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.firstName ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.firstName && <span className="text-[11px] text-red-400 font-mono">{errors.firstName}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">Last Name *</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.lastName ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.lastName && <span className="text-[11px] text-red-400 font-mono">{errors.lastName}</span>}
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">Street Address *</label>
                <input
                  type="text"
                  placeholder="House / Flat / Street / Area"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.address ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.address && <span className="text-[11px] text-red-400 font-mono">{errors.address}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">City *</label>
                <input
                  type="text"
                  placeholder="City / Town"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.city ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.city && <span className="text-[11px] text-red-400 font-mono">{errors.city}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">State / Region</label>
                <input
                  type="text"
                  placeholder="State / Region (e.g. Puducherry)"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none focus:border-studio-terracotta"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">Postal / PIN Code *</label>
                <input
                  type="text"
                  placeholder="Postal / PIN Code"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className={`w-full bg-studio-sand border rounded-xl px-4 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none ${
                    errors.postalCode ? 'border-red-500 bg-red-950/20' : 'border-studio-border focus:border-studio-terracotta'
                  }`}
                />
                {errors.postalCode && <span className="text-[11px] text-red-400 font-mono">{errors.postalCode}</span>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold uppercase text-purple-300">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full bg-studio-sand/50 border border-studio-border rounded-xl px-4 py-2.5 text-xs text-studio-muted font-mono"
                />
              </div>
            </div>
          </div>

          {/* 3. Delivery Method */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-xl space-y-4">
            <h3 className="font-display font-black text-lg text-studio-charcoal flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-studio-terracotta text-white text-xs font-mono font-black flex items-center justify-center">3</span>
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
                      ? 'border-studio-terracotta bg-purple-950/40 ring-1 ring-studio-terracotta'
                      : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shippingMethod"
                      checked={shippingMethod === method.id}
                      onChange={() => setShippingMethod(method.id)}
                      className="accent-studio-terracotta"
                    />
                    <div>
                      <div className="text-xs font-bold text-studio-charcoal flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-studio-terracotta" />
                        {method.id}
                      </div>
                      <div className="text-[11px] text-studio-muted">{method.desc}</div>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-studio-terracotta">{method.price}</span>
                </label>
              ))}
            </div>
          </div>

          {/* 4. Payment Method Selection */}
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-black text-lg text-studio-charcoal flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-white text-xs font-mono font-black flex items-center justify-center">4</span>
                Payment Option
              </h3>
              <span className="text-[11px] font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure Checkout
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* 1. Direct UPI QR Option (All-India) */}
              <label
                onClick={() => setPaymentMethod('UPI_QR')}
                className={`p-5 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all ${
                  paymentMethod === 'UPI_QR'
                    ? 'border-studio-terracotta bg-purple-950/40 shadow-lg ring-1 ring-studio-terracotta'
                    : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'UPI_QR'}
                    onChange={() => setPaymentMethod('UPI_QR')}
                    className="accent-studio-terracotta mt-1"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-studio-charcoal flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      Direct UPI QR &amp; Apps (All-India)
                    </div>
                    <p className="text-[11px] text-studio-muted font-mono leading-relaxed">
                      Scan QR code or pay to UPI ID <strong className="text-purple-300">8754132491@pthdfc</strong> via Google Pay, PhonePe, Paytm, BHIM with 0% fee.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
                  <span className="text-purple-400 font-bold">⚡ Instant Confirmation</span>
                  <span className="text-emerald-400 font-semibold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">All States</span>
                </div>
              </label>

              {/* 2. Cash on Delivery (Puducherry / Pondicherry Only) */}
              <label
                onClick={() => {
                  if (isCodAvailable) {
                    setPaymentMethod('COD');
                  } else {
                    addToast({
                      title: 'COD Region Restriction',
                      message: 'Cash on Delivery is only available for deliveries within Puducherry / Pondicherry.',
                      type: 'info',
                    });
                  }
                }}
                className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                  !isCodAvailable
                    ? 'border-studio-border/50 bg-studio-sand/20 opacity-60 cursor-not-allowed'
                    : paymentMethod === 'COD'
                    ? 'border-studio-terracotta bg-purple-950/40 shadow-lg ring-1 ring-studio-terracotta cursor-pointer'
                    : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand cursor-pointer'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    name="paymentMethod"
                    checked={paymentMethod === 'COD'}
                    disabled={!isCodAvailable}
                    onChange={() => isCodAvailable && setPaymentMethod('COD')}
                    className="accent-studio-terracotta mt-1 disabled:cursor-not-allowed"
                  />
                  <div className="space-y-1">
                    <div className="text-xs font-bold text-studio-charcoal flex items-center gap-1.5">
                      <Banknote className="w-4 h-4 text-purple-400" />
                      Cash on Delivery (COD)
                    </div>
                    <p className="text-[11px] text-studio-muted font-mono leading-relaxed">
                      {isCodAvailable ? (
                        'Pay in cash upon doorstep delivery in Puducherry.'
                      ) : (
                        <span className="text-amber-400 font-semibold">
                          Available exclusively for delivery addresses in Puducherry / Pondicherry.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-[10px] font-mono">
                  {isCodAvailable ? (
                    <>
                      <span className="text-purple-400 font-bold">Pay at Doorstep</span>
                      <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">✓ Puducherry Eligible</span>
                    </>
                  ) : (
                    <>
                      <span className="text-studio-muted font-semibold">Locked</span>
                      <span className="text-amber-400 font-semibold bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">Puducherry Only</span>
                    </>
                  )}
                </div>
              </label>

            </div>

            {/* UPI QR & UPI ID Inline Highlight Box */}
            {paymentMethod === 'UPI_QR' && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-studio-sand to-purple-950/40 border border-purple-500/40 space-y-3 animate-fadeIn">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="p-2 bg-white rounded-xl shadow-md border border-purple-500/40 flex-shrink-0">
                      <img
                        src="/upi-qr.png"
                        alt="Studio QR"
                        className="w-14 h-14 object-contain rounded"
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-studio-charcoal flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        Official Stick Scape Studio UPI
                      </div>
                      <p className="text-[11px] text-studio-muted font-mono mt-0.5">
                        Scan the official studio QR code or copy the UPI ID below to pay directly.
                      </p>
                    </div>
                  </div>

                  {/* Copy UPI ID Button */}
                  <div className="flex items-center gap-2 bg-studio-card/80 border border-purple-500/30 p-2 rounded-xl">
                    <span className="font-mono text-xs font-bold text-purple-300 select-all px-1">
                      8754132491@pthdfc
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        navigator.clipboard.writeText('8754132491@pthdfc');
                        setCopiedUpi(true);
                        addToast({
                          title: 'UPI ID Copied! 📋',
                          message: '8754132491@pthdfc copied to clipboard.',
                          type: 'success',
                        });
                        setTimeout(() => setCopiedUpi(false), 3000);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all flex items-center gap-1 ${
                        copiedUpi ? 'bg-emerald-500 text-white' : 'bg-studio-terracotta hover:bg-studio-terracottaHover text-white'
                      }`}
                    >
                      {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-purple-500/20 text-[10px] font-mono text-studio-muted">
                  <span className="text-studio-muted">Supported UPI Apps:</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300">Google Pay</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300">PhonePe</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300">Paytm</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300">BHIM</span>
                  <span className="px-2 py-0.5 rounded bg-purple-950/40 border border-purple-500/20 text-purple-300">Cred</span>
                </div>
              </div>
            )}

            {paymentStatusText && (
              <div className="bg-purple-950/90 border border-purple-500/50 p-3.5 rounded-2xl text-xs font-mono text-purple-300 flex items-center gap-2 animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-purple-400 flex-shrink-0" />
                <span>{paymentStatusText}</span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary Sidebar (Col 5) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-2xl space-y-6">
            <h3 className="font-display font-black text-xl text-studio-charcoal pb-4 border-b border-studio-border flex items-center justify-between">
              <span>Order Summary</span>
              <span className="font-mono text-xs text-purple-300 font-bold bg-studio-terracotta/20 px-2.5 py-1 rounded-full border border-purple-500/30">
                {items.reduce((s, i) => s + i.quantity, 0)} Items
              </span>
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
                    <h4 className="font-bold text-xs text-studio-charcoal truncate">{item.name}</h4>
                    <p className="text-[11px] text-studio-muted font-mono">
                      {item.selectedSize.name} &bull; Qty: {item.quantity}
                    </p>
                  </div>
                  <div className="font-mono font-bold text-xs text-studio-charcoal">
                    ₹{Math.round(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Calculations */}
            <div className="space-y-2 pt-4 border-t border-studio-border font-mono text-xs">
              <div className="flex justify-between text-studio-muted">
                <span>Subtotal</span>
                <span className="text-studio-charcoal font-semibold">₹{Math.round(subtotal)}</span>
              </div>

              {appliedDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Discount</span>
                  <span>-₹{Math.round(appliedDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-studio-muted">
                <span>Shipping Fee</span>
                <span>
                  {shippingFee === 0 ? (
                    <span className="text-emerald-400 font-bold">
                      {isFreePuducherry ? 'FREE (Puducherry Delivery)' : 'FREE (≥ ₹999)'}
                    </span>
                  ) : (
                    `₹${Math.round(shippingFee)}`
                  )}
                </span>
              </div>

              <div className="flex justify-between text-studio-charcoal font-bold text-base pt-3 border-t border-studio-border">
                <span>Total Payable</span>
                <span className="text-studio-terracotta text-lg">₹{Math.round(grandTotal)}</span>
              </div>
            </div>

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-studio-terracotta hover:bg-studio-terracottaHover text-white py-4 rounded-2xl font-display font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>
                    {paymentMethod === 'UPI_QR'
                      ? `Proceed to Scan UPI QR (₹${Math.round(grandTotal)})`
                      : 'Confirm & Place Order (COD)'}
                  </span>
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

      {/* Interactive UPI QR Payment Modal */}
      {upiModalOrder && (
        <UpiPaymentModal
          isOpen={!!upiModalOrder}
          onClose={() => setUpiModalOrder(null)}
          order={upiModalOrder}
          onPaymentSuccess={(confirmedOrder) => {
            setUpiModalOrder(null);
            setLastOrder(confirmedOrder);
            clearCart();
            navigate('order-confirmation');
          }}
        />
      )}
    </div>
  );
};
