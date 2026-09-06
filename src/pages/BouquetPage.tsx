import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Gift, 
  Flower2, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  Clock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const OCCASIONS = ['All', 'Birthday', 'Anniversary & Love', 'Room Decor', 'Graduation', 'Gifting'];

export const BouquetPage: React.FC = () => {
  const { navigate: _navigate } = useNavigation();
  const [activeOccasion, setActiveOccasion] = useState('All');
  
  // Catalog products for Bouquets
  const bouquetProducts = SAMPLE_PRODUCTS.filter(p => p.category === 'bouquets');

  return (
    <div className="space-y-16 py-6 pb-20">
      
      {/* 1. HERO BANNER */}
      <section className="relative overflow-hidden pt-4 pb-12 border-b border-studio-border">
        {/* Soft Ambient Floral Glows */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-rose-900/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-purple-950/80 px-3.5 py-1.5 rounded-full border border-purple-500/40">
                <Flower2 className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="font-mono text-xs text-purple-300 font-bold uppercase tracking-wider">
                  Handcrafted Forever Blooms &amp; Keepsake Gifts
                </span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
                Flowers that <span className="italic font-serif font-normal text-purple-400 underline decoration-purple-500/60 decoration-wavy">never fade</span>, made for eternal memories.
              </h1>

              <p className="text-sm sm:text-base text-studio-muted leading-relaxed">
                Explore hand-knitted crochet tulips, glowing fairy light butterfly bouquets, personalized Polaroid photo arrangements, and naturally dried botanicals. No watering, zero wilting, 100% aesthetic.
              </p>

              <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-mono text-purple-300">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> 100% Milk Cotton &amp; Dried Florals</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Free Handwritten Gift Card</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-purple-400" /> Gift-Ready Luxury Packaging</span>
              </div>
            </div>

            {/* Quick Hero Floating Preview */}
            <div className="relative w-full max-w-sm flex-shrink-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 group bg-studio-card p-2">
                <img
                  src="/kitkat-rose-bouquet.jpg"
                  alt="Kit Kat And Love Rose Bouquet"
                  className="w-full h-72 sm:h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-purple-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/50 text-[11px] font-mono text-purple-200 font-bold">
                  ✨ Handcrafted Studio Drop
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-studio-dark/90 backdrop-blur-md p-3.5 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">Kit Kat And Love Rose Bouquet</div>
                    <div className="text-[11px] text-purple-400 font-mono">From ₹150</div>
                  </div>
                  <a
                    href="#bouquet-catalog"
                    className="bg-studio-terracotta text-black hover:bg-purple-400 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors shadow-sm flex items-center gap-1"
                  >
                    <span>Explore Drops</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. CURATED BOUQUET CATALOG COLLECTION */}
      <section id="bouquet-catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal pt-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Curated Drops
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Ready-to-Ship Bouquet Editions 🌸
            </h2>
            <p className="text-sm text-studio-muted mt-1 max-w-md">
              Order our most popular pre-configured floral arrangements with express dispatch across India.
            </p>
          </div>

          {/* Occasion Tabs */}
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((occ) => (
              <button
                key={occ}
                onClick={() => setActiveOccasion(occ)}
                className={`text-xs font-mono px-4 py-2 rounded-full transition-all duration-300 ${
                  activeOccasion === occ
                    ? 'bg-studio-terracotta text-black font-bold shadow-md'
                    : 'bg-studio-sand text-purple-200 border border-studio-border hover:bg-studio-terracotta hover:text-black'
                }`}
              >
                {occ}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {bouquetProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 3. WHY FOREVER BOUQUETS VALUE PROPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold">
              THE ARTISAN STANDARD
            </span>
            <h2 className="font-display font-black text-3xl text-white mt-1">
              Why Forever Bouquets Make the Ultimate Gift
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-studio-sand/40 rounded-2xl p-5 border border-studio-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/40">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">Never Wilts or Dies</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Traditional flowers die in 4 days. Our artisan milk-cotton and preserved florals stay radiant forever.
              </p>
            </div>

            <div className="bg-studio-sand/40 rounded-2xl p-5 border border-studio-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/40">
                <Leaf className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">Zero Maintenance</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                No smelly water changes or dropping petals. Perfect for bedroom decor, bedside tables, or study desks.
              </p>
            </div>

            <div className="bg-studio-sand/40 rounded-2xl p-5 border border-studio-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/40">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">100% Handcrafted</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Each petal, stem, and leaf is lovingly knitted and hand-assembled with attention to fine aesthetic detail.
              </p>
            </div>

            <div className="bg-studio-sand/40 rounded-2xl p-5 border border-studio-border space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-500/40">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-sm text-white">Damage-Free Box Delivery</h3>
              <p className="text-xs text-studio-muted leading-relaxed">
                Packaged inside rigid protective gift crates with tissue lining so your bouquet arrives in pristine bloom.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
export default BouquetPage;
