import React, { useState } from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { useToast } from '../../context/ToastContext';
import { 
  ArrowRight, 
  Check, 
  Leaf, 
  Package, 
  Disc, 
  Heart,
  Palette,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const Footer: React.FC = () => {
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      addToast({
        title: 'Invalid Email',
        message: 'Please enter a valid email address.',
        type: 'info',
      });
      return;
    }

    setSubscribed(true);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.85 }
    });

    addToast({
      title: 'Welcome to the Collector’s Club! 🎉',
      message: 'Here is your 10% code: STICK10 (Copied to your clipboard)',
      type: 'success',
    });

    try {
      navigator.clipboard.writeText('STICK10');
    } catch {
      // clipboard fallback
    }
  };

  return (
    <footer className="bg-studio-card text-studio-charcoal border-t border-studio-border pt-16 pb-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Brand Ethos Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 border-b border-studio-border">
          <div className="flex items-start gap-3 bg-studio-sand/40 p-4 rounded-2xl border border-studio-border">
            <div className="p-2.5 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-500/30 flex-shrink-0">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-studio-charcoal">300 GSM Archival Rag</h4>
              <p className="text-xs text-studio-muted mt-0.5">Museum-grade heavy paper that won't curl or fade.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-studio-sand/40 p-4 rounded-2xl border border-studio-border">
            <div className="p-2.5 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-500/30 flex-shrink-0">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-studio-charcoal">Plastic-Free Packaging</h4>
              <p className="text-xs text-studio-muted mt-0.5">Heavy-duty rigid kraft tubes &amp; biodegradable tape.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-studio-sand/40 p-4 rounded-2xl border border-studio-border">
            <div className="p-2.5 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-500/30 flex-shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-studio-charcoal">Free Hanging Accessories</h4>
              <p className="text-xs text-studio-muted mt-0.5">Every bundle includes wall-safe dots &amp; pegs.</p>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-studio-sand/40 p-4 rounded-2xl border border-studio-border">
            <div className="p-2.5 bg-purple-950/80 rounded-xl text-purple-400 border border-purple-500/30 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold font-display text-studio-charcoal">Damage-Free Guarantee</h4>
              <p className="text-xs text-studio-muted mt-0.5">Arrived bent? We reship instantly for free.</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links & Newsletter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12 border-b border-studio-border">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              onClick={() => navigate('home')}
              className="cursor-pointer inline-flex items-center group"
            >
              <img 
                src="/logo-transparent.png" 
                alt="Stick Scape Studio" 
                className="h-12 sm:h-14 w-auto max-w-[220px] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(253,155,0,0.2)]"
              />
            </div>

            <p className="text-sm text-studio-muted max-w-sm leading-relaxed">
              We design and print tactile wall art, retro Polaroid memories, and gallery bundles for bedrooms, dorms, and creative studio walls. Made for the analog-loving generation.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://instagram.com/stickscape.studio" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-studio-sand hover:bg-studio-terracotta hover:text-white rounded-full text-studio-charcoal border border-studio-border transition-colors"
                aria-label="Follow us on Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a 
                href="https://spotify.com" 
                target="_blank" 
                rel="noreferrer"
                className="p-2.5 bg-studio-sand hover:bg-studio-terracotta hover:text-white rounded-full text-studio-charcoal border border-studio-border transition-colors"
                aria-label="Studio Lo-Fi Playlist on Spotify"
              >
                <Disc className="w-4 h-4" />
              </a>
              <div className="text-xs font-mono text-purple-400 ml-2 font-semibold">
                #stickscape.studio
              </div>
            </div>
          </div>

          {/* Nav Column 1: Shop */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">
              Explore Collections
            </h5>
            <ul className="space-y-2.5 text-sm text-studio-charcoal/80">
              <li>
                <button onClick={() => navigate('shop')} className="hover:text-studio-terracotta transition-colors">
                  All Art &amp; Prints
                </button>
              </li>
              <li>
                <button onClick={() => navigate('posters')} className="hover:text-studio-terracotta transition-colors">
                  Wall Posters (A4–A1)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('polaroids')} className="hover:text-studio-terracotta transition-colors">
                  Polaroid Photo Sets
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', { category: 'bundles' })} className="hover:text-studio-terracotta transition-colors">
                  Gallery Wall Bundles
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop', { theme: 'Cyberpunk & Neon' })} className="hover:text-studio-terracotta transition-colors">
                  Cyberpunk &amp; Lo-Fi Drops
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Column 2: Studio */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">
              About &amp; Care
            </h5>
            <ul className="space-y-2.5 text-sm text-studio-charcoal/80">
              <li>
                <button onClick={() => navigate('about')} className="hover:text-studio-terracotta transition-colors">
                  Our Story &amp; Studio
                </button>
              </li>
              <li>
                <button onClick={() => navigate('reviews')} className="hover:text-studio-terracotta transition-colors text-studio-terracotta font-semibold">
                  Customer Reviews &amp; Feedback ⭐
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-studio-terracotta transition-colors">
                  Contact &amp; Support
                </button>
              </li>
              <li>
                <button onClick={() => navigate('contact')} className="hover:text-studio-terracotta transition-colors">
                  Frequently Asked Questions
                </button>
              </li>

              <li>
                <button onClick={() => navigate('posters')} className="hover:text-studio-terracotta transition-colors">
                  Poster Size &amp; Frame Guide
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-studio-terracotta transition-colors">
                  Eco-Friendly Printing
                </button>
              </li>
            </ul>
          </div>

          {/* Nav Column 3: Newsletter Form */}
          <div>
            <h5 className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold mb-4">
              Collector's Club
            </h5>
            <p className="text-xs text-studio-muted mb-3 leading-relaxed">
              Get secret drop alerts and unlock 10% off your first art order.
            </p>

            {subscribed ? (
              <div className="bg-purple-950/80 border border-purple-500/50 p-3.5 rounded-xl">
                <p className="text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4" /> You're on the VIP list!
                </p>
                <p className="text-[11px] text-studio-charcoal mt-1 font-mono">
                  Code: <strong className="text-white bg-studio-terracotta px-1.5 py-0.5 rounded font-bold">STICK10</strong>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl px-3.5 py-2.5 text-xs text-studio-charcoal placeholder-studio-muted focus:outline-none focus:border-studio-terracotta"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1.5 bg-studio-terracotta hover:bg-studio-terracottaHover text-white p-1.5 rounded-lg transition-colors shadow-sm"
                    aria-label="Subscribe to newsletter"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-studio-muted font-mono">
                  Zero spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-studio-muted font-mono gap-4">
          <div>
            &copy; {new Date().getFullYear()} STICK SCAPE STUDIO. Hand-crafted wall art &amp; Polaroid prints.
          </div>
          <div className="flex items-center gap-4 text-studio-muted">
            <span>Designed for Youth Living Spaces</span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-purple-400">
              <Heart className="w-3.5 h-3.5 fill-current text-studio-terracotta" /> Made with passion
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
};
