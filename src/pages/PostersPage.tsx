import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { SAMPLE_PRODUCTS, POSTER_SIZES, POSTER_FINISHES } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Ruler, 
  Frame, 
  Layers, 
  ArrowRight, 
  Check
} from 'lucide-react';

export const PostersPage: React.FC = () => {
  const { navigate } = useNavigation();
  const [selectedSizeTab, setSelectedSizeTab] = useState(POSTER_SIZES[1]); // Default A3
  const [selectedFinishTab, setSelectedFinishTab] = useState(POSTER_FINISHES[0]);

  const posters = SAMPLE_PRODUCTS.filter(p => p.category === 'posters');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. HERO BANNER */}
      <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
            <Layers className="w-3.5 h-3.5" /> 300 GSM Archival Wall Art
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight">
            Curated Wall Posters
          </h1>
          <p className="text-sm sm:text-base text-studio-muted leading-relaxed">
            Printed with 12-color Japanese pigment inks on heavyweight acid-free cotton rag. Explore sizes ranging from A4 mini desk prints to A1 exhibition-scale statement art.
          </p>
        </div>
      </div>

      {/* 2. INTERACTIVE POSTER SIZE & FRAME VISUALIZER */}
      <section className="bg-studio-card rounded-3xl p-6 sm:p-10 border border-studio-border shadow-sm space-y-8 scroll-reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-studio-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold uppercase">
              <Ruler className="w-4 h-4" /> Size &amp; Framing Guide
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
              Find the perfect scale for your space
            </h2>
          </div>
          <div className="text-xs text-purple-300/80 font-mono">
            Every order includes damage-free hanging strips
          </div>
        </div>

        {/* Size Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POSTER_SIZES.map((sz) => (
            <button
              key={sz.id}
              onClick={() => setSelectedSizeTab(sz)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 transform active:scale-95 ${
                selectedSizeTab.id === sz.id
                  ? 'border-purple-500 bg-purple-950/60 shadow-md ring-2 ring-purple-500/50 scale-[1.02]'
                  : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand hover:border-purple-500/40'
              }`}
            >
              <div className="font-display font-bold text-lg text-white">
                {sz.name.split(' ')[0]}
              </div>
              <div className="text-xs font-mono text-purple-300 font-semibold mt-0.5">
                {sz.name.split(' ').slice(1).join(' ')}
              </div>
              <div className="text-[11px] text-studio-muted mt-2 font-mono">
                {sz.dimensions}
              </div>
            </button>
          ))}
        </div>

        {/* Framing Finish Selector */}
        <div className="pt-4 border-t border-studio-border space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono uppercase font-bold text-purple-300 tracking-wider">
            <Frame className="w-4 h-4 text-purple-400" /> Select Framing Option:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {POSTER_FINISHES.map((fin) => (
              <div
                key={fin.id}
                onClick={() => setSelectedFinishTab(fin)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 transform active:scale-95 ${
                  selectedFinishTab.id === fin.id
                    ? 'border-purple-500 bg-purple-950/60 ring-1 ring-purple-500 shadow-sm scale-[1.02]'
                    : 'border-studio-border bg-studio-sand/30 hover:bg-studio-sand hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{fin.name.split(' ')[0]} {fin.name.split(' ')[1]}</span>
                  <span className="font-mono text-xs font-semibold text-purple-300">
                    {fin.priceAdd === 0 ? 'Included' : `+₹${fin.priceAdd}`}
                  </span>
                </div>
                <p className="text-[11px] text-studio-muted mt-1 leading-relaxed line-clamp-2">
                  {fin.description}
                </p>
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* 3. POSTERS CATALOG GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-2xl text-white">
              All Wall Posters
            </h3>
            <p className="text-xs text-studio-muted font-mono mt-0.5">
              Available in A4, A3, A2, and A1 formats
            </p>
          </div>

          <button
            onClick={() => navigate('shop', { category: 'posters' })}
            className="text-xs font-mono text-purple-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Filter in Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {posters.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. GALLERY WALL ADVICE */}
      <section className="bg-studio-card text-white rounded-3xl p-8 sm:p-12 border border-purple-500/30 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div className="space-y-4">
          <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
            STUDIO CURATION TIPS
          </span>
          <h2 className="font-display font-black text-3xl text-white">
            How to style an aesthetic gallery wall
          </h2>
          <ul className="space-y-2.5 text-xs text-studio-muted">
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Mix sizes:</strong> Pair one large A2 statement poster with two smaller A4 prints for organic visual hierarchy.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Eye-Level Anchor:</strong> Hang the center of your main print 57–60 inches from the floor (standard museum eye-level).</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Spacing:</strong> Keep 2–3 inches of consistent breathing room between adjacent frames.</span>
            </li>
          </ul>
          <button
            onClick={() => navigate('shop', { category: 'bundles' })}
            className="mt-2 inline-flex items-center gap-2 bg-studio-terracotta hover:bg-purple-400 text-black font-bold px-6 py-3 rounded-full font-display text-xs uppercase tracking-wider transition-colors shadow-md"
          >
            <span className="text-black font-bold">Explore Pre-Curated Bundles</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </button>
        </div>

        <div className="rounded-2xl overflow-hidden shadow-2xl border border-purple-500/30">
          <img
            src="/vtv.jpeg"
            alt="Gallery wall layout inspiration"
            className="w-full h-64 sm:h-80 object-cover"
          />
        </div>
      </section>

    </div>
  );
};
