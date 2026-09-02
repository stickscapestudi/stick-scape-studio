import React from 'react';
import { useNavigation } from '../context/NavigationContext';
import { 
  Leaf, 
  Layers, 
  ArrowRight, 
  Printer, 
  Compass 
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const { navigate } = useNavigation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-20">
      
      {/* 1. HERO STORY */}
      <section className="bg-studio-card rounded-3xl p-8 sm:p-14 lg:p-20 border border-purple-500/30 relative overflow-hidden">
        <div className="max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 bg-studio-sand px-3.5 py-1.5 rounded-full border border-studio-border text-xs font-mono font-bold uppercase text-purple-300 tracking-wider shadow-subtle">
            <Compass className="w-3.5 h-3.5 text-purple-400" /> Our Studio Philosophy
          </div>
          
          <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight">
            We believe your walls should tell <span className="italic font-serif font-normal text-purple-400 underline decoration-purple-500/60">your story</span>.
          </h1>

          <p className="text-base sm:text-lg text-studio-muted leading-relaxed">
            Stick Scape Studio was born out of a rebellion against soulless beige walls and cheap, glossy supermarket posters. We craft physical, tactile wall art and authentic Polaroid card sets that celebrate analog nostalgia, cyberpunk reverie, and mindful minimalism.
          </p>
        </div>
      </section>

      {/* 2. THE MANIFESTO & THE THREE PILLARS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="bg-studio-card rounded-3xl p-8 border border-studio-border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-studio-sand rounded-2xl flex items-center justify-center text-purple-400 border border-studio-border">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-2xl text-white">
            01. Museum Tactility
          </h3>
          <p className="text-xs text-studio-muted leading-relaxed">
            Every piece is printed on 300 GSM heavyweight archival fine art rag or 350 GSM resin-coated Polaroid cardstock. When you hold our prints in your hands, the weight, velvety matte texture, and crisp edges speak for themselves.
          </p>
        </div>

        <div className="bg-studio-card rounded-3xl p-8 border border-studio-border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-studio-sand rounded-2xl flex items-center justify-center text-purple-400 border border-studio-border">
            <Printer className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-2xl text-white">
            02. 12-Color Pigment Fidelity
          </h3>
          <p className="text-xs text-studio-muted leading-relaxed">
            We never use cheap CMYK toner. Our print lab utilizes 12-color archival pigment inks that capture subtle pastel grain, neon cyber reflections, and deep film shadows that won't fade for over 80+ years indoors.
          </p>
        </div>

        <div className="bg-studio-card rounded-3xl p-8 border border-studio-border shadow-sm space-y-4">
          <div className="w-12 h-12 bg-studio-sand rounded-2xl flex items-center justify-center text-purple-400 border border-studio-border">
            <Leaf className="w-6 h-6" />
          </div>
          <h3 className="font-display font-black text-2xl text-white">
            03. Earth-Minded Craft
          </h3>
          <p className="text-xs text-studio-muted leading-relaxed">
            We use FSC-certified sustainable forest paper, water-based vegan soy inks, and 100% plastic-free packaging. Large prints are rolled in silk tissue within rigid kraft tubes that are fully recyclable.
          </p>
        </div>

      </section>

      {/* 3. STUDIO PHOTO MOSAIC */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto">
          <span className="font-mono text-xs uppercase font-bold text-purple-400 tracking-wider">
            INSIDE THE PRINT LAB
          </span>
          <h2 className="font-display font-black text-3xl text-white mt-1">
            Where digital art becomes physical
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] group border border-purple-500/30">
            <img
              src="/harris.jpeg"
              alt="Studio Wall Setup"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] group border border-purple-500/30">
            <img
              src="/kaatru veliyidai.jpeg"
              alt="Archival print ink inspection"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>

          <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/3] group sm:col-span-2 lg:col-span-1 border border-purple-500/30">
            <img
              src="/aesthetic.jpeg"
              alt="Polaroid pack curation"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>
      </section>

      {/* 4. CALL TO ACTION */}
      <section className="bg-studio-card text-white rounded-3xl p-8 sm:p-14 text-center space-y-6 border border-purple-500/30">
        <h2 className="font-display font-black text-3xl sm:text-4xl max-w-xl mx-auto leading-tight">
          Ready to give your room an aesthetic upgrade?
        </h2>
        <p className="text-sm text-studio-muted max-w-md mx-auto">
          Explore our latest collection of posters, Polaroid packs, and gallery wall bundles with Free Shipping over ₹499.
        </p>
        <div>
          <button
            onClick={() => navigate('shop')}
            className="bg-studio-terracotta hover:bg-purple-400 text-black px-8 py-4 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-lg inline-flex items-center gap-2"
          >
            <span className="text-black font-bold">Browse The Collection</span>
            <ArrowRight className="w-4 h-4 text-black" />
          </button>
        </div>
      </section>

    </div>
  );
};
