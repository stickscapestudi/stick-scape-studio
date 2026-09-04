import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldCheck, 
  Smartphone, 
  X, 
  RefreshCw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import QRCode from 'qrcode';
import { paymentService } from '../../services/payment.service';
import { useToast } from '../../context/ToastContext';
import type { OrderConfirmationData } from '../../types';

interface UpiPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: {
    orderId: string;
    total: number;
    customerName: string;
  };
  onPaymentSuccess: (confirmedOrder: OrderConfirmationData) => void;
}

export const UpiPaymentModal: React.FC<UpiPaymentModalProps> = ({
  isOpen,
  onClose,
  order,
  onPaymentSuccess,
}) => {
  const { addToast } = useToast();
  const upiId = '8754132491@pthdfc';
  const payeeName = 'Stick Scape Studio';
  
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [dynamicQrUrl, setDynamicQrUrl] = useState<string>('/upi-qr.png');

  // Generate dynamic QR containing exact amount & order note
  useEffect(() => {
    if (isOpen && order.total) {
      const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${order.total}&cu=INR&tn=${encodeURIComponent(`Order_${order.orderId}`)}`;
      QRCode.toDataURL(upiDeepLink, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      })
      .then((url) => setDynamicQrUrl(url))
      .catch(() => setDynamicQrUrl('/upi-qr.png'));
    }
  }, [isOpen, order.total, order.orderId]);

  if (!isOpen) return null;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    addToast({
      title: 'UPI ID Copied! 📋',
      message: `${upiId} copied to clipboard.`,
      type: 'success',
    });
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmUpi = async () => {
    setIsVerifying(true);
    try {
      const confirmedOrder = await paymentService.submitUpiPayment({
        orderNumber: order.orderId,
        utrNumber: utrNumber.trim() || undefined,
        upiId: upiId,
      });

      // Launch celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback if confetti blocked
      }

      addToast({
        title: 'UPI Payment Confirmed! 🎨',
        message: `Order #${order.orderId} verified and placed successfully.`,
        type: 'success',
      });

      onPaymentSuccess(confirmedOrder);
    } catch (err: any) {
      addToast({
        title: 'Payment Confirmation Error',
        message: err.message || 'Could not verify payment. Please try again.',
        type: 'error',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&am=${order.total}&cu=INR&tn=${encodeURIComponent(`Order_${order.orderId}`)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-studio-dark/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-studio-card border border-studio-border w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative text-studio-charcoal">
        
        {/* Top Gradient Header */}
        <div className="bg-gradient-to-r from-purple-950/40 via-studio-card to-purple-950/20 p-6 border-b border-studio-border relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-studio-muted hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase tracking-wider font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Direct UPI 0% Fee Payment</span>
          </div>

          <h2 className="font-display font-black text-2xl text-studio-charcoal">
            Scan &amp; Pay via UPI
          </h2>
          
          <div className="mt-3 flex items-center justify-between bg-studio-sand/80 border border-studio-border rounded-2xl p-3.5">
            <div>
              <span className="text-[11px] font-mono text-studio-muted block">Order ID</span>
              <span className="font-mono font-bold text-white text-sm">#{order.orderId}</span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono text-studio-muted block">Total Payable</span>
              <span className="font-display font-black text-2xl text-studio-terracotta">
                ₹{order.total.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* QR Code Container */}
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="relative p-4 bg-white rounded-3xl shadow-2xl border-4 border-purple-500/40 inline-block group">
              <img
                src={dynamicQrUrl || '/upi-qr.png'}
                alt="Stick Scape Studio UPI QR Code"
                className="w-52 h-52 sm:w-60 sm:h-60 object-contain rounded-xl"
              />
              <div className="absolute inset-0 border-2 border-dashed border-purple-400/40 rounded-3xl pointer-events-none" />
            </div>

            {/* UPI Apps supported */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono text-studio-muted">
              <span className="px-2 py-0.5 rounded-md bg-purple-950/30 border border-purple-500/20 text-purple-300">Google Pay</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/30 border border-purple-500/20 text-purple-300">PhonePe</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/30 border border-purple-500/20 text-purple-300">Paytm</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/30 border border-purple-500/20 text-purple-300">BHIM</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-950/30 border border-purple-500/20 text-purple-300">Cred</span>
            </div>
          </div>

          {/* Official UPI ID Box */}
          <div className="bg-studio-sand/70 border border-purple-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block font-semibold">
                Official Studio UPI ID
              </span>
              <span className="font-mono font-bold text-white text-base tracking-wide select-all">
                {upiId}
              </span>
            </div>

            <button
              type="button"
              onClick={handleCopyUpi}
              className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all ${
                copied 
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                  : 'bg-studio-terracotta hover:bg-studio-terracottaHover text-white shadow-md'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy UPI ID</span>
                </>
              )}
            </button>
          </div>

          {/* Mobile Instant Pay Link Button */}
          <div className="block sm:hidden">
            <a
              href={upiDeepLink}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-bold text-xs uppercase tracking-wider shadow-lg"
            >
              <Smartphone className="w-4 h-4" />
              <span>Open in UPI App &amp; Pay ₹{order.total}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Step 3: Transaction ID / UTR Input */}
          <div className="space-y-2 pt-2 border-t border-studio-border">
            <label className="text-xs font-mono font-bold text-purple-300 block uppercase">
              UPI Reference / 12-Digit UTR No. <span className="text-studio-muted font-normal lowercase">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 423456789012 or UPI Ref"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              className="w-full bg-studio-sand border border-studio-border focus:border-studio-terracotta rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-studio-muted focus:outline-none"
            />
            <p className="text-[11px] font-mono text-studio-muted leading-relaxed">
              Once payment is complete in your UPI app, click the button below to confirm your order instantly.
            </p>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-studio-card border-t border-studio-border flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-studio-border text-studio-muted hover:text-white hover:bg-studio-sand text-xs font-mono font-bold transition-colors"
          >
            Cancel / Back
          </button>

          <button
            type="button"
            onClick={handleConfirmUpi}
            disabled={isVerifying}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50"
          >
            {isVerifying ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Confirming UPI Payment...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>I Have Paid ₹{order.total.toLocaleString('en-IN')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
