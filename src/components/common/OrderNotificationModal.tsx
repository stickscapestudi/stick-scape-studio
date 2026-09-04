import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { ADMIN_MOBILE } from '../../config/env';
import { Bell, Send, X, Sparkles } from 'lucide-react';

export const OrderNotificationModal: React.FC = () => {
  const { newOrderNotification, dismissNotification, navigate } = useNavigation();

  if (!newOrderNotification) return null;

  const customerName = `${newOrderNotification.customer.firstName} ${newOrderNotification.customer.lastName}`;
  const totalAmount = Math.round(newOrderNotification.total);

  const whatsappMessage = `⚡ *NEW ORDER RECEIVED - STICK SCAPE STUDIO*\n\n📦 Order ID: #${newOrderNotification.orderId}\n👤 Customer: ${customerName}\n📞 Customer Phone: ${newOrderNotification.customer.phone}\n💰 Total Amount: ₹${totalAmount}\n📍 Address: ${newOrderNotification.customer.city}, ${newOrderNotification.customer.state}\n\nView details in Admin Portal.`;
  const whatsappUrl = `https://wa.me/91${ADMIN_MOBILE}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="fixed top-5 right-5 z-50 max-w-md w-full animate-fadeIn">
      <div className="bg-gradient-to-r from-purple-950 via-studio-card to-purple-950 text-white rounded-3xl p-6 border-2 border-purple-500 shadow-2xl space-y-4 backdrop-blur-md relative">
        
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-purple-600/40 text-purple-300 rounded-xl border border-purple-400/50 flex-shrink-0 animate-bounce">
              <Bell className="w-5 h-5 text-amber-300" />
            </span>
            <div>
              <span className="font-mono text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">
                ⚡ NEW ORDER NOTIFICATION
              </span>
              <h4 className="font-display font-bold text-base text-white">
                Order #{newOrderNotification.orderId} Placed!
              </h4>
            </div>
          </div>

          <button
            onClick={dismissNotification}
            className="p-1 text-studio-muted hover:text-white bg-studio-sand rounded-lg border border-studio-border"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Order Details Summary Box */}
        <div className="bg-studio-sand/80 p-3.5 rounded-2xl border border-studio-border space-y-1.5 font-mono text-xs">
          <div className="flex justify-between items-center text-white">
            <span className="text-studio-muted">Customer:</span>
            <strong className="text-white">{customerName}</strong>
          </div>
          <div className="flex justify-between items-center text-white">
            <span className="text-studio-muted">Amount:</span>
            <strong className="text-emerald-400 text-sm font-black">₹{totalAmount}</strong>
          </div>
          <div className="flex justify-between items-center text-white">
            <span className="text-studio-muted">Target Mobile:</span>
            <strong className="text-purple-300">+91 {ADMIN_MOBILE}</strong>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-emerald-500 hover:bg-emerald-400 text-black py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-black" />
            <span>SMS to Mobile</span>
          </a>

          <button
            onClick={() => {
              dismissNotification();
              navigate('admin');
            }}
            className="bg-studio-terracotta hover:bg-purple-400 text-white py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open Admin</span>
          </button>
        </div>

      </div>
    </div>
  );
};
