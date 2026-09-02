import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check, AlertCircle } from 'lucide-react';

interface OrderTrackingTimelineProps {
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | string;
}

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="bg-rose-950/80 border border-rose-500/50 rounded-2xl p-6 text-center space-y-3">
        <div className="w-12 h-12 bg-rose-900/50 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/40">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-lg text-rose-200">Order Cancelled</h4>
          <p className="text-xs text-rose-300/80 font-mono mt-1">
            This order has been cancelled and is no longer active. If you have any questions, please contact studio support.
          </p>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'Pending', label: 'Order Placed', desc: 'Order received & confirmed', icon: Clock },
    { key: 'Processing', label: 'Processing', desc: 'Print & packaging in progress', icon: Package },
    { key: 'Shipped', label: 'Shipped', desc: 'Handed to courier partner', icon: Truck },
    { key: 'Delivered', label: 'Delivered', desc: 'Package delivered to address', icon: CheckCircle2 },
  ];

  const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
  const currentIndex = statusOrder.indexOf(status);
  const activeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
        {steps.map((step, idx) => {
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;

          return (
            <div
              key={step.key}
              className={`p-4 rounded-2xl border transition-all flex sm:flex-col items-center sm:text-center gap-3.5 ${
                isCurrent
                  ? 'bg-purple-950/90 border-studio-terracotta shadow-lg shadow-purple-950/50'
                  : isCompleted
                  ? 'bg-studio-card/80 border-emerald-500/40 opacity-90'
                  : 'bg-studio-card/40 border-studio-border/50 opacity-50'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border font-mono ${
                  isCurrent
                    ? 'bg-studio-terracotta text-black border-studio-terracotta font-bold animate-pulse'
                    : isCompleted
                    ? 'bg-emerald-950 text-emerald-400 border-emerald-500/50'
                    : 'bg-studio-sand text-neutral-400 border-studio-border'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
              </div>

              <div>
                <div className="flex items-center sm:justify-center gap-1.5 font-bold text-xs">
                  <span className={isCurrent ? 'text-white' : isCompleted ? 'text-emerald-300' : 'text-neutral-400'}>
                    {step.label}
                  </span>
                  {isCurrent && (
                    <span className="w-2 h-2 rounded-full bg-studio-terracotta animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-studio-muted font-mono mt-0.5 leading-snug">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
