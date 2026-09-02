import React, { useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { 
  CheckCircle2, 
  Printer, 
  ArrowRight, 
  MapPin, 
  CreditCard,
  Package
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const OrderConfirmationPage: React.FC = () => {
  const { lastOrder, navigate } = useNavigation();

  useEffect(() => {
    // Fire light celebratory confetti upon landing
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.5 }
    });
  }, []);

  // Fallback demo order if user navigates directly to this page
  const order = lastOrder || {
    orderId: 'SSS-894210',
    orderDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    items: [
      {
        cartItemId: 'prod-01_size-a3_unframed-matte',
        id: 'prod-01',
        name: 'Vaaranam Aayiram — Nostalgic Cinema Art',
        category: 'posters' as const,
        basePrice: 249.00,
        unitPrice: 349.00,
        image: '/varanam ayiram.jpeg',
        selectedSize: { id: 'size-a3', name: 'A3 Standard Studio Print', dimensions: '29.7 × 42.0 cm', priceMultiplier: 1.4, inStock: true },
        selectedFinish: { id: 'unframed-matte', name: 'Unframed Archival Matte (300 GSM)', priceAdd: 0, description: '' },
        quantity: 1,
      },
      {
        cartItemId: 'prod-03_pack-24_finish-classic-white',
        id: 'prod-03',
        name: 'Unnale Unnale — 24 Pack Retro Polaroids',
        category: 'polaroids' as const,
        basePrice: 199.00,
        unitPrice: 299.00,
        image: '/unnale unnale.jpeg',
        selectedSize: { id: 'pack-24', name: 'Collector Pack (24 Prints + Clips)', dimensions: '8.8 × 10.7 cm', priceMultiplier: 1.6, inStock: true },
        quantity: 1,
      }
    ],
    subtotal: 648.00,
    discount: 64.80,
    discountCode: 'STICK10',
    shippingCost: 0,
    shippingMethod: 'Standard Eco Shipping (Free)',
    tax: 29.16,
    total: 612.36,
    customer: {
      firstName: 'Alex',
      lastName: 'Morgan',
      email: 'alex.morgan@example.com',
      phone: '+91 98765 43210',
      address: '742 Evergreen Terrace',
      apartment: 'Apt 4B',
      city: 'Chennai',
      state: 'Tamil Nadu',
      postalCode: '600001',
      country: 'India',
    },
    paymentMethod: 'card' as const,
    estimatedDelivery: '2–4 Business Days',
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* 1. SUCCESS HERO BANNER */}
      <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 text-center space-y-4 shadow-sm">
        <div className="w-16 h-16 bg-purple-950/80 text-purple-400 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        
        <div className="space-y-1">
          <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-wider">
            ORDER CONFIRMED &bull; READY FOR PRINTING
          </span>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white">
            Thank you for your order, {order.customer.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-studio-muted max-w-md mx-auto leading-relaxed">
            We’ve sent a confirmation email &amp; receipt to <strong className="text-white">{order.customer.email}</strong>.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 bg-studio-sand px-5 py-2.5 rounded-2xl border border-studio-border text-xs font-mono">
          <span className="text-studio-muted">Order ID:</span>
          <strong className="text-purple-300 font-bold text-sm tracking-wider">{order.orderId}</strong>
        </div>
      </div>

      {/* 2. ORDER PROGRESS TRACKER STEPPER */}
      <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-6">
        <h3 className="font-display font-bold text-base text-white">
          Production &amp; Dispatch Timeline
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
          <div className="flex sm:flex-col items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-studio-terracotta text-black flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
              ✓
            </div>
            <div>
              <div className="text-xs font-bold text-white">Order Received</div>
              <div className="text-[11px] text-purple-300/70 font-mono">{order.orderDate}</div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-950 text-purple-300 border border-purple-500/50 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0 animate-pulse">
              2
            </div>
            <div>
              <div className="text-xs font-bold text-white">Giclée Pigment Printing</div>
              <div className="text-[11px] text-studio-muted font-mono">300 GSM Archival Curing</div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-studio-sand text-studio-muted flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
              3
            </div>
            <div>
              <div className="text-xs font-bold text-studio-muted">Rigid Kraft Packaging</div>
              <div className="text-[11px] text-studio-muted font-mono">100% Plastic-free</div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-studio-sand text-studio-muted flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
              4
            </div>
            <div>
              <div className="text-xs font-bold text-studio-muted">Courier Dispatch</div>
              <div className="text-[11px] text-studio-muted font-mono">{order.estimatedDelivery}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. ITEMIZED RECEIPT & CUSTOMER SUMMARY */}
      <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-studio-border">
          <h3 className="font-display font-bold text-lg text-white">
            Order Receipt &amp; Summary
          </h3>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 text-xs font-mono text-purple-200 hover:text-black border border-studio-border px-3 py-1.5 rounded-lg bg-studio-sand hover:bg-studio-terracotta transition-colors font-semibold"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Receipt</span>
          </button>
        </div>

        {/* Item Rows */}
        <div className="divide-y divide-studio-border">
          {order.items.map((item) => (
            <div key={item.cartItemId} className="py-4 first:pt-0 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-14 h-16 object-cover rounded-lg border border-purple-500/30 flex-shrink-0"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                  <p className="text-xs text-studio-muted font-mono">
                    {item.selectedSize.name} &bull; Qty {item.quantity}
                  </p>
                  {item.selectedFinish && (
                    <p className="text-[11px] text-purple-300 font-medium">
                      Border: {item.selectedFinish.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right font-mono font-bold text-sm text-white">
                ₹{Math.round(item.unitPrice * item.quantity)}
              </div>
            </div>
          ))}
        </div>

        {/* Totals Breakdown */}
        <div className="pt-4 border-t border-studio-border space-y-2 text-xs text-studio-charcoal">
          <div className="flex justify-between">
            <span className="text-studio-muted">Subtotal</span>
            <span className="font-mono font-semibold text-white">₹{Math.round(order.subtotal)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between text-purple-400 font-medium">
              <span>Discount ({order.discountCode})</span>
              <span className="font-mono">-₹{Math.round(order.discount)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-studio-muted">Shipping</span>
            <span className="font-mono">
              {order.shippingCost === 0 ? <span className="text-emerald-400 font-bold">FREE</span> : `₹${Math.round(order.shippingCost)}`}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-studio-muted">Estimated Tax (5% GST)</span>
            <span className="font-mono text-white">₹{Math.round(order.tax)}</span>
          </div>

          <div className="flex justify-between items-baseline pt-4 border-t border-studio-border text-base font-bold text-white">
            <span>Total Paid</span>
            <span className="font-mono text-2xl text-white">₹{Math.round(order.total)}</span>
          </div>
        </div>

        {/* Customer & Shipping Details Grid */}
        <div className="pt-6 border-t border-studio-border grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="font-mono uppercase font-bold text-purple-300 text-[11px] block flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-purple-400" /> Shipping Address
            </span>
            <p className="font-semibold text-white">{order.customer.firstName} {order.customer.lastName}</p>
            <p className="text-studio-muted">{order.customer.address} {order.customer.apartment}</p>
            <p className="text-studio-muted">{order.customer.city}, {order.customer.state} {order.customer.postalCode}</p>
            <p className="text-studio-muted">{order.customer.country}</p>
          </div>

          <div className="space-y-1">
            <span className="font-mono uppercase font-bold text-purple-300 text-[11px] block flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-purple-400" /> Payment &amp; Method
            </span>
            <p className="font-semibold text-white capitalize">{order.paymentMethod === 'card' ? 'Credit / Debit Card' : order.paymentMethod.toUpperCase()}</p>
            <p className="text-studio-muted">Status: Authorized &amp; Confirmed</p>
            <p className="text-studio-muted">Tracking link will be emailed to {order.customer.email}</p>
          </div>
        </div>

      </div>

      {/* 4. ACTION BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={() => navigate('track-order', { orderNumber: order.orderId, mobile: order.customer.phone })}
          className="w-full sm:w-auto bg-purple-950 hover:bg-purple-900 border border-purple-500/50 text-purple-200 px-8 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md inline-flex items-center justify-center gap-2"
        >
          <Package className="w-4 h-4 text-studio-terracotta" />
          <span>Track Order Progress</span>
        </button>

        <button
          onClick={() => navigate('shop')}
          className="w-full sm:w-auto bg-studio-terracotta hover:bg-purple-400 text-black px-8 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md inline-flex items-center justify-center gap-2"
        >
          <span className="text-black font-bold">Continue Exploring Studio Prints</span>
          <ArrowRight className="w-4 h-4 text-black" />
        </button>
      </div>

    </div>
  );
};
