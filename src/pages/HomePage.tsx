import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { SAMPLE_PRODUCTS, SAMPLE_REVIEWS } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Sparkles, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Leaf, 
  Star, 
  CheckCircle2, 
  Flame
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { navigate } = useNavigation();
  const [activePosterTab, setActivePosterTab] = useState<string>('All');
  const [roomViewMode, setRoomViewMode] = useState<'bedroom' | 'desk'>('bedroom');

  // Filtered products for sections
  const featuredPosters = SAMPLE_PRODUCTS.filter(p => p.category === 'posters' && (activePosterTab === 'All' || p.theme.includes(activePosterTab)));
  const bestSellers = SAMPLE_PRODUCTS.filter(p => p.isBestSeller);

  return (
    <div className="space-y-24">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:py-24 border-b border-studio-border">
        {/* Subtle Ambient Purple Background Gradients */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Headline & Actions */}
            <div className="lg:col-span-7 space-y-8">
              
              <div className="inline-flex items-center gap-2 bg-studio-card border border-purple-500/30 px-3.5 py-1.5 rounded-full shadow-subtle">
                <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                <span className="font-mono text-xs font-semibold text-purple-200 uppercase tracking-wider">
                  Spring Art Drop No. 04 &bull; 300 GSM Archival Inks
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="font-display font-black text-4xl sm:text-6xl xl:text-7xl text-white tracking-tight leading-[1.08]">
                  Wall art made for <span className="italic font-serif font-normal text-purple-400 underline decoration-purple-500/60 decoration-wavy">your room’s</span> soul.
                </h1>
                <p className="text-base sm:text-lg text-studio-muted max-w-xl leading-relaxed">
                  Transform bland blank walls into personal galleries. Hand-printed museum-grade posters, tactile 35mm film Polaroid packs, and complete room makeover bundles.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('shop')}
                  className="bg-studio-terracotta text-black hover:bg-purple-400 px-8 py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-art hover:shadow-art-hover hover:-translate-y-0.5 flex items-center gap-2.5 group"
                >
                  <span className="text-black font-bold">Explore Art Catalog</span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('posters')}
                  className="bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border px-7 py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-sm flex items-center gap-2"
                >
                  <span>All Wall Posters</span>
                </button>
              </div>

              {/* Micro Trust Stats */}
              <div className="pt-6 border-t border-studio-border/70 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <div className="font-mono font-black text-2xl text-white">300<span className="text-purple-400 text-sm">GSM</span></div>
                  <div className="text-xs text-studio-muted font-medium">Fine Art Cotton Paper</div>
                </div>
                <div>
                  <div className="font-mono font-black text-2xl text-white">4.9★</div>
                  <div className="text-xs text-studio-muted font-medium">1,200+ Verified Buyers</div>
                </div>
                <div>
                  <div className="font-mono font-black text-2xl text-white">100%</div>
                  <div className="text-xs text-studio-muted font-medium">Plastic-Free Packaging</div>
                </div>
              </div>

            </div>

            {/* Right Column: Visual Aesthetic Poster & Polaroid Mosaic */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                
                {/* Floating Polaroid on top left */}
                <div className="absolute -top-6 -left-6 sm:-top-8 sm:-left-8 z-20 w-44 sm:w-52 polaroid-card rounded-md shadow-2xl transform -rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="washi-tape" />
                  <img
                    src="/aesthetic.jpeg"
                    alt="Aesthetic polaroid sample"
                    className="w-full aspect-[4/5] object-cover rounded-sm"
                  />
                  <div className="mt-2 text-center font-mono text-[10px] text-purple-300">
                    Aesthetic Room #04 &bull; 35mm
                  </div>
                </div>

                {/* Main Hero Poster Frame */}
                <div className="poster-frame w-full max-w-sm sm:max-w-md mx-auto aspect-[3/4] overflow-hidden rounded-lg shadow-2xl relative group">
                  <img
                    src="/varanam ayiram.jpeg"
                    alt="Vaaranam Aayiram Wall Art Poster"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-studio-card/95 backdrop-blur-md text-white p-3 rounded-xl border border-purple-500/40 flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-purple-400 font-bold uppercase">Staff Spotlight</div>
                      <div className="text-xs font-bold truncate">Vaaranam Aayiram (A2 Print)</div>
                    </div>
                    <button
                      onClick={() => navigate('product', { id: 'prod-01' })}
                      className="bg-studio-terracotta text-black hover:bg-purple-400 px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors"
                    >
                      View Art
                    </button>
                  </div>
                </div>

                {/* Secondary Floating Mini Polaroid bottom right */}
                <div className="absolute -bottom-6 -right-4 sm:-bottom-8 sm:-right-6 z-20 w-40 sm:w-48 polaroid-card rounded-md shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-300">
                  <div className="washi-tape" />
                  <img
                    src="/unnale unnale.jpeg"
                    alt="Unnale Unnale polaroid sample"
                    className="w-full aspect-[4/5] object-cover rounded-sm"
                  />
                  <div className="mt-2 text-center font-mono text-[10px] text-purple-300">
                    Unnale Unnale #12
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. TICKER MARQUEE */}
      <section className="bg-studio-sand py-4 border-y border-studio-border overflow-hidden select-none">
        <div className="flex w-[200%] animate-marquee">
          <div className="flex items-center gap-8 whitespace-nowrap text-xs font-mono font-bold tracking-widest text-purple-200 uppercase">
            <span>★ 300 GSM ARCHIVAL COTTON RAG</span>
            <span className="text-purple-400">●</span>
            <span>REAL POLAROID CARDSTOCK BORDERS</span>
            <span className="text-purple-400">●</span>
            <span>FREE SHIPPING OVER ₹499</span>
            <span className="text-purple-400">●</span>
            <span>DAMAGE-FREE EASY HANGING STRIPS</span>
            <span className="text-purple-400">●</span>
            <span>VINTAGE 35MM FILM COLOR REPRODUCTION</span>
            <span className="text-purple-400">●</span>
            <span>JAPANESE ULTRACHROME 12-COLOR INKS</span>
            <span className="text-purple-400">●</span>
          </div>
          <div className="flex items-center gap-8 whitespace-nowrap text-xs font-mono font-bold tracking-widest text-purple-200 uppercase ml-8">
            <span>★ 300 GSM ARCHIVAL COTTON RAG</span>
            <span className="text-purple-400">●</span>
            <span>REAL POLAROID CARDSTOCK BORDERS</span>
            <span className="text-purple-400">●</span>
            <span>FREE SHIPPING OVER ₹499</span>
            <span className="text-purple-400">●</span>
            <span>DAMAGE-FREE EASY HANGING STRIPS</span>
            <span className="text-purple-400">●</span>
            <span>VINTAGE 35MM FILM COLOR REPRODUCTION</span>
            <span className="text-purple-400">●</span>
            <span>JAPANESE ULTRACHROME 12-COLOR INKS</span>
            <span className="text-purple-400">●</span>
          </div>
        </div>
      </section>

      {/* 3. FEATURED POSTER COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Curated Wall Art
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Featured Poster Drops
            </h2>
            <p className="text-sm text-studio-muted mt-1 max-w-md">
              From neon cyberpunk alleys to organic botanical minimalism, printed on heavy archival paper.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2">
            {['All', 'Cyberpunk', 'Botanical', 'Minimalist', 'Bauhaus'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActivePosterTab(tab)}
                className={`text-xs font-mono px-4 py-2 rounded-full transition-all duration-300 transform active:scale-95 ${
                  activePosterTab === tab
                    ? 'bg-studio-terracotta text-black font-bold shadow-md scale-105'
                    : 'bg-studio-sand text-purple-200 border border-studio-border hover:bg-studio-terracotta hover:text-black'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid with switching animation */}
        <div key={activePosterTab} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 animate-tabSwitch">
          {featuredPosters.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => navigate('posters')}
            className="inline-flex items-center gap-2 bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border px-8 py-3.5 rounded-full font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            <span>View All Posters &amp; Sizing Guide</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 4. BEST SELLERS & ROOM WALL PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
              <Flame className="w-3.5 h-3.5 fill-current" /> Most Loved by Collectors
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Store Best Sellers
            </h2>
          </div>

          {/* Wall Mockup Toggle */}
          <div className="flex items-center gap-2 bg-studio-sand p-1 rounded-xl border border-studio-border">
            <span className="text-xs font-mono text-studio-muted px-2 hidden sm:inline">Preview Mood:</span>
            <button
              onClick={() => setRoomViewMode('bedroom')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 transform active:scale-95 ${
                roomViewMode === 'bedroom' ? 'bg-studio-terracotta text-black font-bold shadow-sm scale-105' : 'text-studio-muted hover:text-white'
              }`}
            >
              Bedroom Wall
            </button>
            <button
              onClick={() => setRoomViewMode('desk')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-300 transform active:scale-95 ${
                roomViewMode === 'desk' ? 'bg-studio-terracotta text-black font-bold shadow-sm scale-105' : 'text-studio-muted hover:text-white'
              }`}
            >
              Study Desk
            </button>
          </div>
        </div>

        <div key={roomViewMode} className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 animate-tabSwitch">
          {bestSellers.slice(0, 4).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 5. ROOM BUNDLES FEATURE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="bg-studio-card text-white rounded-3xl p-8 sm:p-12 lg:p-16 relative overflow-hidden border border-purple-500/30">
          
          <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 bg-purple-950/80 px-3 py-1 rounded-full border border-purple-500/40">
                <span className="font-mono text-xs text-purple-300 font-bold uppercase tracking-wider">
                  ⭐ ALL-IN-ONE VALUE BUNDLE
                </span>
              </div>

              <h2 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                The Aesthetic Room Glow Mega Bundle
              </h2>

              <p className="text-studio-muted text-sm sm:text-base leading-relaxed">
                Everything you need to turn a bare room into an immersive sanctuary. Includes 3 Large Statement Posters (A3), 36 Polaroid Prints, 20 Warm Copper Fairy Lights, 36 Clothespins, and 50 Wall-Safe Glue Dots.
              </p>

              <div className="flex items-baseline gap-4">
                <span className="font-mono font-black text-3xl text-white">₹799</span>
                <span className="font-mono text-lg text-neutral-500 line-through">₹1,299</span>
                <span className="bg-studio-terracotta text-black font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                  SAVE 38%
                </span>
              </div>

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={() => navigate('product', { id: 'prod-06' })}
                  className="bg-studio-terracotta hover:bg-purple-400 text-black px-8 py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 group"
                >
                  <span className="text-black font-bold">Grab the Mega Bundle</span>
                  <ArrowRight className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => navigate('shop', { category: 'bundles' })}
                  className="bg-studio-sand hover:bg-studio-terracotta hover:text-black text-purple-200 border border-studio-border px-6 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  Browse All Bundles
                </button>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30 group">
                <img
                  src="/aesthetic.jpeg"
                  alt="Aesthetic room makeover bundle preview"
                  className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-md p-4 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs text-white">
                  <span>📸 Real Customer Bedroom Transformation</span>
                  <span className="font-mono text-purple-400 font-bold">5.0 ★ (312 Reviews)</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. WHY CHOOSE US */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold">
            THE STICK SCAPE PROMISE
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
            Why our prints feel different
          </h2>
          <p className="text-sm text-studio-muted mt-2">
            We don’t do cheap, flimsy supermarket posters. Every print is treated like a limited exhibition run.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm hover:border-purple-500/70 transition-colors">
            <div className="w-12 h-12 bg-studio-sand rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-studio-border">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">300 GSM Heavyweight</h3>
            <p className="text-xs text-studio-muted mt-2 leading-relaxed">
              Substantial fine art cotton rag that hangs perfectly flat without wrinkles or cheap glare.
            </p>
          </div>

          <div className="bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm hover:border-purple-500/70 transition-colors">
            <div className="w-12 h-12 bg-studio-sand rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-studio-border">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">12-Color Pigment Inks</h3>
            <p className="text-xs text-studio-muted mt-2 leading-relaxed">
              Vivid analog tonality, deep midnight blacks, and zero fading for up to 80+ years indoors.
            </p>
          </div>

          <div className="bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm hover:border-purple-500/70 transition-colors">
            <div className="w-12 h-12 bg-studio-sand rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-studio-border">
              <Leaf className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">100% Eco Packaging</h3>
            <p className="text-xs text-studio-muted mt-2 leading-relaxed">
              Rigid kraft cardboard tubes, recycled glassine sleeves, and zero single-use plastics.
            </p>
          </div>

          <div className="bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm hover:border-purple-500/70 transition-colors">
            <div className="w-12 h-12 bg-studio-sand rounded-xl flex items-center justify-center text-purple-400 mb-4 border border-studio-border">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-display font-bold text-lg text-white">Safe Transit Guarantee</h3>
            <p className="text-xs text-studio-muted mt-2 leading-relaxed">
              Arrived damaged in transit? Send a quick photo and we will reprint and reship completely free.
            </p>
          </div>
        </div>
      </section>

      {/* 7. SAMPLE CUSTOMER REVIEWS */}
      <section className="bg-studio-paper py-16 border-y border-studio-border scroll-reveal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12">
            <span className="font-mono text-xs uppercase tracking-widest text-purple-400 font-bold">
              VERIFIED COLLECTORS
            </span>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Rooms transformed by Stick Scape
            </h2>
            <p className="text-xs text-studio-muted mt-1">
              (Sample demo reviews from our community of bedroom art collectors)
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SAMPLE_REVIEWS.map((rev) => (
              <div
                key={rev.id}
                className="bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 text-amber-400 mb-3">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>

                  <p className="text-xs text-studio-charcoal leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>

                <div className="pt-6 mt-4 border-t border-studio-border flex items-center gap-3">
                  {rev.avatar ? (
                    <img
                      src={rev.avatar}
                      alt={rev.author}
                      className="w-10 h-10 rounded-full object-cover border border-purple-500/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-display font-bold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
                      {rev.author.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-white">{rev.author}</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-[11px] text-studio-muted font-mono block">
                      {rev.productTitle}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

    </div>
  );
};
