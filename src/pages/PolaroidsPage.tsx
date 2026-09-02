import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { POLAROID_PACK_SIZES, POLAROID_FINISHES } from '../data/products';
import { 
  Camera, 
  Sparkles, 
  Upload
} from 'lucide-react';

export const PolaroidsPage: React.FC = () => {
  const { navigate: _navigate } = useNavigation();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [customCaption, setCustomCaption] = useState('Summer in Kyoto 2026');
  const [customBorder, setCustomBorder] = useState(POLAROID_FINISHES[0]);
  const [customImage, setCustomImage] = useState<string>('/unnale unnale.jpeg');
  const [selectedPack, setSelectedPack] = useState(POLAROID_PACK_SIZES[1]); // 24-pack default

  const handleCustomUploadDemo = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setCustomImage(url);
      addToast({
        title: 'Photo Uploaded! 📸',
        message: 'Your custom image is now rendered in the Polaroid frame.',
        type: 'success',
      });
    }
  };

  const handleAddCustomToBag = () => {
    // Create custom product wrapper
    const customProduct = {
      id: 'custom-polaroid-pack-' + Date.now(),
      name: `Custom Polaroid Pack (${customCaption || 'Custom Photos'})`,
      slug: 'custom-polaroid-pack',
      category: 'polaroids' as const,
      theme: 'Retro Film' as const,
      price: 199.00,
      tags: ['Custom Upload', 'Personalized'],
      description: `Personalized Polaroid print pack with custom border: ${customBorder.name}. Includes free wooden pins and twine.`,
      shortDescription: `Custom photo prints with ${customBorder.name}.`,
      images: [customImage],
      sizes: POLAROID_PACK_SIZES,
      finishes: POLAROID_FINISHES,
      rating: 5.0,
      reviewCount: 1,
      paperSpecs: '350 GSM Resin-Coated Glossy Cardstock',
      inventoryCount: 99,
    };

    addToCart(customProduct, selectedPack, customBorder, 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* 1. HERO BANNER */}
      <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
            <Camera className="w-3.5 h-3.5" /> 35mm Analog Warmth &bull; Real Cardstock
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight">
            Polaroid Photo Prints
          </h1>
          <p className="text-sm sm:text-base text-studio-muted leading-relaxed">
            Turn memories, lo-fi aesthetics, and vintage film moments into tactile physical Polaroid cards. Cut from heavy 350 GSM gloss cardstock with authentic retro borders.
          </p>
        </div>
      </div>

      {/* 2. CUSTOM POLAROID CREATOR STUDIO (INTERACTIVE FEATURE) */}
      <section className="bg-studio-card rounded-3xl p-6 sm:p-10 border border-studio-border shadow-sm scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Interactive Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
                CUSTOM PHOTO LAB
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                Print Your Own Camera Roll in Polaroid Style
              </h2>
              <p className="text-xs text-studio-muted mt-1 leading-relaxed">
                Upload your favorite phone snapshots or travel memories. We print and crop them onto authentic heavyweight Polaroid cards.
              </p>
            </div>

            {/* Step 1: Upload Photo */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center justify-between">
                <span>1. Choose or Upload a Photo:</span>
                <span className="text-studio-muted font-normal text-[11px]">Supports JPG, PNG, WEBP</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-studio-sand hover:bg-studio-terracotta hover:text-black border border-studio-border text-purple-200 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-colors">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>Upload from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomUploadDemo}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-studio-muted font-mono">or test with demo photo</span>
              </div>
            </div>

            {/* Step 2: Custom Handwritten Caption */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200">
                2. Handwritten Bottom Caption:
              </label>
              <input
                type="text"
                maxLength={40}
                placeholder="e.g. Kyoto Trip • Oct 2026"
                value={customCaption}
                onChange={(e) => setCustomCaption(e.target.value)}
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
              />
            </div>

            {/* Step 3: Border Style */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200">
                3. Choose Border Style:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {POLAROID_FINISHES.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setCustomBorder(f)}
                    className={`p-2.5 rounded-xl border text-xs font-mono text-center transition-all duration-300 transform active:scale-95 ${
                      customBorder.id === f.id
                        ? 'border-purple-500 bg-studio-terracotta font-bold text-black shadow-sm scale-105'
                        : 'border-studio-border bg-studio-sand text-purple-200 hover:border-purple-500/50'
                    }`}
                  >
                    {f.name.split(' ')[0]} {f.name.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Pack Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200">
                4. Select Pack Size:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {POLAROID_PACK_SIZES.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedPack(sz)}
                    className={`p-2.5 rounded-xl border text-left transition-all duration-300 transform active:scale-95 ${
                      selectedPack.id === sz.id
                        ? 'border-purple-500 bg-purple-950/70 ring-2 ring-purple-500/50 scale-[1.02]'
                        : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{sz.name.split('(')[0]}</div>
                    <div className="text-[11px] font-mono text-purple-300 font-semibold">
                      ₹{Math.round(199.00 * sz.priceMultiplier + customBorder.priceAdd)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Add Custom to Bag Button */}
            <button
              onClick={handleAddCustomToBag}
              className="w-full bg-studio-terracotta text-black hover:bg-purple-400 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-black font-bold">Add Custom Polaroid Pack to Bag &bull; ₹{Math.round(199.00 * selectedPack.priceMultiplier + customBorder.priceAdd)}</span>
            </button>

          </div>

          {/* Right: Live Interactive Polaroid Preview Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative">
              <div className="washi-tape" />
              
              {/* Polaroid Frame Container with switching animation */}
              <div 
                key={`${customImage}-${customBorder.id}-${customCaption}`}
                className={`w-72 sm:w-80 p-4 pb-10 rounded-md shadow-2xl transition-all duration-300 transform rotate-1 hover:rotate-0 animate-tabSwitch ${
                  customBorder.id === 'finish-matte-black'
                    ? 'bg-neutral-900 text-white border border-neutral-700'
                    : customBorder.id === 'finish-film-vintage'
                    ? 'bg-[#F4EFE6] text-neutral-800 border border-amber-200'
                    : 'bg-white text-neutral-800'
                }`}
              >
                {/* Photo Center */}
                <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100 shadow-inner">
                  <img
                    src={customImage}
                    alt="Custom Polaroid Preview"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Bottom Handwritten Caption */}
                <div className="mt-5 text-center font-serif italic text-base tracking-wide px-2 truncate">
                  {customCaption || 'Your Title Here'}
                </div>

                <div className="mt-1 text-center font-mono text-[9px] opacity-50 uppercase tracking-widest">
                  STICK SCAPE &bull; 350 GSM RESIN
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. POLAROID ACCESSORIES HIGHLIGHT */}
      <section className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 scroll-reveal">
        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN 24+ PACKS</div>
          <h4 className="font-display font-bold text-base text-white">24 Mini Wooden Pegs</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            Smooth natural beechwood mini clips that securely hold prints without pinching or piercing the cardstock.
          </p>
        </div>

        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN 24+ PACKS</div>
          <h4 className="font-display font-bold text-base text-white">3M Natural Jute Twine</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            Durable vintage twine string for zig-zag wall suspension across desks, headboards, and cozy corners.
          </p>
        </div>

        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN 48 PACKS</div>
          <h4 className="font-display font-bold text-base text-white">LED Copper Fairy Lights</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            20 Warm ambient LED micro lights powered by USB/battery that illuminate your Polaroid memories at night.
          </p>
        </div>
      </section>

    </div>
  );
};
