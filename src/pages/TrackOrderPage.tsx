import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { orderService, type TrackOrderData } from '../services/order.service';
import { OrderTrackingTimeline } from '../components/common/OrderTrackingTimeline';
import { Search, PackageCheck, AlertCircle, RefreshCw, ArrowLeft, ShieldCheck, ShoppingBag } from 'lucide-react';

export const TrackOrderPage: React.FC = () => {
  const { navigate, params } = useNavigation();

  const [orderNumber, setOrderNumber] = useState<string>(params.orderNumber || '');
  const [mobile, setMobile] = useState<string>(params.mobile || '');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingResult, setTrackingResult] = useState<TrackOrderData | null>(null);

  const handleTrackSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!orderNumber.trim() || !mobile.trim()) {
      setError('Please enter both Order Number and Mobile Number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTrackingResult(null);

    try {
      const data = await orderService.trackOrder(orderNumber.trim(), mobile.trim());
      setTrackingResult(data);
    } catch (err: any) {
      setError('Order not found. Please check your order number and mobile number.');
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, mobile]);

  // Auto-track if params are present in URL
  useEffect(() => {
    if (params.orderNumber && params.mobile) {
      setOrderNumber(params.orderNumber);
      setMobile(params.mobile);
      handleTrackSubmit();
    }
  }, [params.orderNumber, params.mobile, handleTrackSubmit]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 font-mono text-xs text-studio-terracotta font-bold uppercase tracking-wider bg-studio-terracotta/10 px-3 py-1 rounded-full border border-studio-terracotta/30">
          <PackageCheck className="w-4 h-4" /> Real-Time Order Verification
        </div>
        <h1 className="font-display font-black text-3xl sm:text-5xl text-white">
          Track Your Order
        </h1>
        <p className="text-xs sm:text-sm text-studio-muted max-w-lg mx-auto font-mono">
          Enter your unique order number and mobile number to inspect live fulfillment progress.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-2xl space-y-6">
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-purple-200">
              Order Number
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. SSC-20260902-BEB9FB"
              className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-purple-200">
              Mobile Number
            </label>
            <input
              type="text"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Finding your order...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 text-black" />
                  <span>Track Order</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-4 text-rose-200 text-xs font-mono flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tracking Result */}
      {trackingResult && (
        <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-2xl space-y-6 animate-fadeIn">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-studio-border">
            <div>
              <div className="text-[11px] text-purple-300 font-mono font-bold uppercase">
                VERIFIED ORDER RECORD
              </div>
              <h2 className="font-display font-black text-2xl text-white mt-0.5">
                Order #{trackingResult.orderNumber}
              </h2>
              <div className="text-xs text-studio-muted font-mono mt-1">
                Placed on: {new Date(trackingResult.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>

            <div className="bg-purple-950/80 px-4 py-2 rounded-2xl border border-purple-500/40 text-right">
              <span className="text-[10px] text-purple-300 font-mono uppercase block">CURRENT STATUS</span>
              <span className="font-mono font-bold text-sm text-studio-terracotta">{trackingResult.status}</span>
            </div>
          </div>

          {/* Visual Timeline */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs text-purple-300 font-bold uppercase">Fulfillment Progress</h3>
            <OrderTrackingTimeline status={trackingResult.status} />
          </div>

          {/* Items Summary Breakdown */}
          <div className="space-y-3 pt-4 border-t border-studio-border">
            <h3 className="font-mono text-xs text-purple-300 font-bold uppercase">Ordered Items</h3>
            <div className="divide-y divide-studio-border border border-studio-border rounded-2xl overflow-hidden bg-studio-sand/20">
              {trackingResult.items.map((item, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-950/80 border border-purple-500/30 rounded-xl flex items-center justify-center text-purple-300">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{item.productName}</h4>
                      <p className="text-[11px] text-studio-muted font-mono">
                        Qty: {item.quantity} &bull; ₹{item.unitPrice} each
                      </p>
                    </div>
                  </div>
                  <div className="font-mono font-bold text-white text-xs">
                    ₹{item.lineTotal}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Totals & Payment Info */}
          <div className="bg-studio-sand/40 p-4 rounded-2xl border border-studio-border space-y-2 font-mono text-xs">
            <div className="flex items-center justify-between text-studio-muted">
              <span>Payment Method</span>
              <span className="text-white uppercase font-bold">{(trackingResult as any).paymentMethod || 'COD'}</span>
            </div>
            <div className="flex items-center justify-between text-studio-muted">
              <span>Payment Status</span>
              <span className="text-amber-300 font-bold px-2 py-0.5 bg-amber-950/80 rounded border border-amber-500/30">
                {(trackingResult as any).paymentStatus || 'Pending'}
              </span>
            </div>
            <div className="flex items-center justify-between text-studio-muted pt-1">
              <span>Subtotal</span>
              <span>₹{trackingResult.subtotal}</span>
            </div>
            <div className="flex items-center justify-between text-studio-muted">
              <span>Shipping Fee</span>
              <span>{trackingResult.shippingAmount === 0 ? 'Free Shipping' : `₹${trackingResult.shippingAmount}`}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-studio-border font-bold text-sm text-white">
              <span>Total Amount</span>
              <span className="text-studio-terracotta text-base">₹{trackingResult.totalAmount}</span>
            </div>
          </div>

        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-between items-center pt-4">
        <button
          onClick={() => navigate('shop')}
          className="text-xs font-mono text-purple-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Continue Shopping
        </button>

        <div className="flex items-center gap-1 text-[11px] text-studio-muted font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Stick Scape Secure Verification
        </div>
      </div>

    </div>
  );
};
