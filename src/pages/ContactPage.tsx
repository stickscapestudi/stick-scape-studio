import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { FAQ_DATA } from '../data/products';
import { 
  Mail, 
  ChevronDown, 
  Clock, 
  Send, 
  CheckCircle2, 
  MapPin,
  Phone
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const ContactPage: React.FC = () => {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Order Status & Tracking',
    orderNumber: '',
    message: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      addToast({
        title: 'Missing Details',
        message: 'Please fill in your name, email, and message.',
        type: 'info',
      });
      return;
    }

    setSubmitted(true);
    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 }
    });

    addToast({
      title: 'Message Sent to Studio! ✉️',
      message: 'Our support team will reply within 24 hours.',
      type: 'success',
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Header */}
      <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
            <Mail className="w-3.5 h-3.5" /> Studio Support &amp; Inquiries
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            We’re here to help
          </h1>
          <p className="text-sm text-studio-muted leading-relaxed">
            Have a question about your order, need custom sizing, or want to collaborate? Drop us a note or browse our answers below.
          </p>
        </div>
      </div>

      {/* Main Grid: Contact Form & Studio Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Contact Form (Col 7) */}
        <div className="lg:col-span-7 bg-studio-card rounded-3xl p-6 sm:p-10 border border-studio-border shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-4 animate-fadeIn">
              <div className="w-16 h-16 bg-purple-950/80 text-purple-400 border border-purple-500/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-display font-black text-2xl text-white">
                Message Received!
              </h3>
              <p className="text-sm text-studio-muted max-w-md mx-auto leading-relaxed">
                Thank you for reaching out, <strong className="text-white">{formData.name}</strong>. A copy of your inquiry has been logged and our studio curators will get back to you at <strong className="text-white">{formData.email}</strong> within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', topic: 'Order Status & Tracking', orderNumber: '', message: '' });
                }}
                className="mt-4 bg-studio-terracotta text-black px-6 py-2.5 rounded-full text-xs font-mono font-bold uppercase hover:bg-purple-400 transition-colors shadow-md"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h3 className="font-display font-black text-xl text-white">
                Send a Direct Message
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-purple-200">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maya Lin"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-purple-200">Your Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="your.email@domain.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono font-bold uppercase text-purple-200">Inquiry Topic</label>
                  <select
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none focus:border-studio-terracotta"
                  >
                    <option value="Order Status & Tracking">Order Status &amp; Tracking</option>
                    <option value="Custom Polaroid / Bulk Order">Custom Polaroid / Bulk Order</option>
                    <option value="Damaged Item / Replacement">Damaged Item / Replacement</option>
                    <option value="Artist Collaboration & Submissions">Artist Collaboration &amp; Submissions</option>
                    <option value="General Question">General Question</option>
                  </select>
                </div>

                {formData.topic.includes('Order') && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-mono font-bold uppercase text-purple-200">
                      Order Number (if applicable)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SSS-894210"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>
                )}

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-mono font-bold uppercase text-purple-200">Message *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell us what you need..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl p-4 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-black" />
                <span className="text-black font-bold">Send Message</span>
              </button>
            </form>
          )}
        </div>

        {/* Studio Info Sidebar (Col 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="bg-studio-card rounded-3xl p-6 sm:p-8 border border-studio-border shadow-sm space-y-6">
            <h3 className="font-display font-black text-xl text-white">
              Studio Direct
            </h3>

            <div className="space-y-4 text-xs text-studio-charcoal">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-studio-sand border border-studio-border rounded-xl text-purple-400 flex-shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono uppercase font-bold text-studio-muted block text-[11px]">Email Curators</span>
                  <a href="mailto:stickscapestudio@gmail.com" className="font-semibold hover:underline text-white">
                    stickscapestudio@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-studio-sand border border-studio-border rounded-xl text-purple-400 flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono uppercase font-bold text-studio-muted block text-[11px]">Direct Call / WhatsApp</span>
                  <a href="tel:8754132491" className="font-semibold hover:underline text-white">
                    +91 87541 32491
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-studio-sand border border-studio-border rounded-xl text-purple-400 flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono uppercase font-bold text-studio-muted block text-[11px]">Studio Hours</span>
                  <p className="leading-relaxed text-studio-muted">Monday – Saturday: 9:00 AM – 8:00 PM (IST)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-studio-sand border border-studio-border rounded-xl text-purple-400 flex-shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-mono uppercase font-bold text-studio-muted block text-[11px]">Print Studio &amp; Dispatch</span>
                  <p className="leading-relaxed text-studio-muted">Stick Scape Studio &bull; Tamil Nadu / Puducherry, India</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-studio-border">
              <span className="font-mono uppercase text-[11px] font-bold text-purple-300 block mb-2">Connect with Us</span>
              <div className="flex items-center gap-2">
                <a 
                  href="https://instagram.com/stickscape.studio" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 bg-studio-sand border border-studio-border px-3.5 py-2 rounded-xl text-xs font-mono font-semibold text-purple-200 hover:bg-studio-terracotta hover:text-black transition-colors"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                  <span>@stickscape.studio</span>
                </a>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 space-y-8">
        <div className="text-center max-w-xl mx-auto">
          <span className="font-mono text-xs uppercase font-bold text-purple-400 tracking-wider">
            COMMON QUESTIONS
          </span>
          <h2 className="font-display font-black text-3xl text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="max-w-3xl mx-auto divide-y divide-studio-border bg-studio-sand rounded-2xl p-6 sm:p-8 border border-studio-border shadow-sm">
          {FAQ_DATA.map((faq, idx) => (
            <div key={idx} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-display font-bold text-sm sm:text-base text-white hover:text-purple-400 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-purple-400 transition-transform flex-shrink-0 ml-3 ${openFaqIndex === idx ? 'rotate-180 text-purple-300' : ''}`} />
              </button>
              {openFaqIndex === idx && (
                <p className="mt-3 text-xs sm:text-sm text-studio-muted leading-relaxed animate-fadeIn">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
