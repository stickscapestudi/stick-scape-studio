import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { BOUQUET_SIZES, BOUQUET_FINISHES, SAMPLE_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Sparkles, 
  Heart, 
  Gift, 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Flower2, 
  Lightbulb, 
  Camera, 
  Tag, 
  CheckCircle2, 
  ShieldCheck, 
  Leaf, 
  Clock
} from 'lucide-react';

interface BouquetStyleOption {
  id: string;
  name: string;
  subtitle: string;
  image: string;
  basePrice: number;
  badge?: string;
  theme: string;
  description: string;
}

const BOUQUET_STYLES: BouquetStyleOption[] = [
  {
    id: 'crochet-tulip',
    name: 'Pastel Dreams Crochet Bloom',
    subtitle: 'Hand-knitted milk cotton tulips & daisies',
    image: '/crochet-tulip-bouquet.jpg',
    basePrice: 349,
    badge: 'Artisan Favorite',
    theme: 'Handmade Florals',
    description: 'Individually hand-knitted by artisans with ultra-soft milk cotton yarn. Vibrant pastel tulips and daisies that never wilt.',
  },
  {
    id: 'butterfly-fairy',
    name: 'Midnight Starlight Butterfly Glow',
    subtitle: 'Iridescent butterflies with warm micro LED lights',
    image: '/butterfly-glow-bouquet.jpg',
    basePrice: 449,
    badge: 'Glow in Dark',
    theme: 'Handmade Florals',
    description: 'Ethereal laser-cut iridescent butterflies and silk blooms intertwined with 20 warm copper wire LED fairy lights.',
  },
  {
    id: 'polaroid-memory',
    name: 'Cherished Moments Polaroid Memory',
    subtitle: 'Fresh floral bouquet with 5 mini Polaroid photo cards',
    image: '/polaroid-memory-bouquet.jpg',
    basePrice: 399,
    badge: 'Most Romantic',
    theme: 'Handmade Florals',
    description: 'Pastel roses & eucalyptus accented with 5 custom printed mini Polaroid memories clipped with miniature wooden pegs.',
  },
  {
    id: 'vintage-dried',
    name: 'French Countryside Dried Florals',
    subtitle: 'Naturally preserved French lavender & cotton blossoms',
    image: '/vintage-dried-bouquet.jpg',
    basePrice: 299,
    badge: '100% Organic',
    theme: 'Botanical & Nature',
    description: 'Naturally preserved aromatic French lavender, soft fluffy cotton blossoms, and eucalyptus in rustic kraft wrap.',
  },
];

const WRAPPING_THEMES = [
  { id: 'wrap-lilac', name: 'Lilac Dream', color: '#B39DDB', bgClass: 'from-purple-900/50 to-pink-900/30', borderClass: 'border-purple-400' },
  { id: 'wrap-noir', name: 'Midnight Noir', color: '#1E1E24', bgClass: 'from-neutral-900 to-black', borderClass: 'border-neutral-500' },
  { id: 'wrap-kraft', name: 'Vintage Kraft', color: '#A07855', bgClass: 'from-amber-950/60 to-amber-900/40', borderClass: 'border-amber-600' },
  { id: 'wrap-rose', name: 'Satin Blush', color: '#F48FB1', bgClass: 'from-rose-950/60 to-pink-900/30', borderClass: 'border-pink-400' },
];

const OCCASIONS = ['All', 'Birthday', 'Anniversary & Love', 'Room Decor', 'Graduation', 'Gifting'];

export const BouquetPage: React.FC = () => {
  const { navigate: _navigate } = useNavigation();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Customizer State
  const [selectedStyle, setSelectedStyle] = useState<BouquetStyleOption>(BOUQUET_STYLES[0]);
  const [selectedSize, setSelectedSize] = useState(BOUQUET_SIZES[1]); // Classic default
  const [selectedFinish, setSelectedFinish] = useState(BOUQUET_FINISHES[0]); // Champagne Satin
  const [selectedWrap, setSelectedWrap] = useState(WRAPPING_THEMES[0]);
  const [giftNote, setGiftNote] = useState('Wishing you a day as blooming and beautiful as you are! ✨');
  const [includeFairyLights, setIncludeFairyLights] = useState(false);
  const [activeOccasion, setActiveOccasion] = useState('All');
  
  // Custom Polaroid Photos attachment for Polaroid Bouquet
  const [attachedPhotos, setAttachedPhotos] = useState<string[]>([
    '/vtv-polaroid.jpg',
    '/varanam ayiram.jpeg',
    '/aesthetic.jpeg',
  ]);

  // Catalog products for Bouquets
  const bouquetProducts = SAMPLE_PRODUCTS.filter(p => p.category === 'bouquets');

  // Calculate customized unit price
  const baseCustomPrice = selectedStyle.basePrice * selectedSize.priceMultiplier;
  const finishPrice = selectedFinish.priceAdd;
  const lightsAddonPrice = (includeFairyLights && selectedSize.id !== 'bouquet-grand') ? 69 : 0;
  const totalCustomPrice = Math.round(baseCustomPrice + finishPrice + lightsAddonPrice);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      Promise.all(
        fileList.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve((ev.target?.result as string) || URL.createObjectURL(file));
            reader.onerror = () => resolve(URL.createObjectURL(file));
            reader.readAsDataURL(file);
          });
        })
      ).then((urls) => {
        setAttachedPhotos(prev => [...prev, ...urls].slice(0, 5));
        addToast({
          title: 'Photos Attached! 📸',
          message: `Added ${fileList.length} photo(s) to your memory bouquet.`,
          type: 'success',
        });
      });
    }
  };

  const handleAddCustomBouquetToCart = () => {
    // Find matching base product or construct cart item
    const matchingProduct = bouquetProducts.find(p => p.name.includes(selectedStyle.name.split(' ')[0])) || bouquetProducts[0];

    const customizedProduct = {
      ...matchingProduct,
      name: `Custom ${selectedStyle.name} (${selectedSize.name.split('(')[0].trim()})`,
      price: totalCustomPrice,
      images: [selectedStyle.image],
      giftNote: giftNote.trim() || undefined,
      wrappingStyle: selectedWrap.name,
      ribbonColor: selectedFinish.name,
      fairyLights: includeFairyLights || selectedSize.id === 'bouquet-grand',
      uploadedPhotos: selectedStyle.id === 'polaroid-memory' ? attachedPhotos : undefined,
    };

    addToCart(
      customizedProduct,
      selectedSize,
      selectedFinish,
      1
    );

    addToast({
      title: 'Bouquet Added to Bag! 🌸',
      message: `${selectedStyle.name} customized with ${selectedWrap.name} wrap & ${selectedFinish.name}.`,
      type: 'cart',
      image: selectedStyle.image,
    });
  };

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
                  src={selectedStyle.image}
                  alt={selectedStyle.name}
                  className="w-full h-72 sm:h-80 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4 bg-purple-950/90 backdrop-blur-md px-3 py-1 rounded-full border border-purple-500/50 text-[11px] font-mono text-purple-200 font-bold">
                  ✨ Handcrafted Studio Drop
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-studio-dark/90 backdrop-blur-md p-3.5 rounded-xl border border-purple-500/30 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">{selectedStyle.name}</div>
                    <div className="text-[11px] text-purple-400 font-mono">From ₹{selectedStyle.basePrice}</div>
                  </div>
                  <a
                    href="#customizer-studio"
                    className="bg-studio-terracotta text-black hover:bg-purple-400 px-3.5 py-1.5 rounded-lg text-xs font-bold font-mono transition-colors shadow-sm"
                  >
                    Customize 🌸
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE BOUQUET CUSTOMIZER STUDIO */}
      <section id="customizer-studio" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Bouquet Studio
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Build Your Dream Floral Keepsake
            </h2>
            <p className="text-sm text-studio-muted mt-1 max-w-lg">
              Pick your floral style, bouquet size, wrapping paper theme, luxury ribbon, and personalized handwritten greeting message card.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Live Interactive Preview Card */}
          <div className="lg:col-span-5 sticky top-28 space-y-4">
            <div className="bg-studio-card rounded-3xl p-6 border border-purple-500/30 shadow-2xl relative overflow-hidden">
              
              {/* Wrapping background glow matching selected theme */}
              <div className={`absolute inset-0 bg-gradient-to-b ${selectedWrap.bgClass} opacity-30 pointer-events-none`} />

              {/* Main Bouquet Visual */}
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-studio-sand/40 border border-purple-500/20 group">
                <img 
                  src={selectedStyle.image} 
                  alt={selectedStyle.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Fairy lights glow overlay if enabled */}
                {(includeFairyLights || selectedSize.id === 'bouquet-grand' || selectedStyle.id === 'butterfly-fairy') && (
                  <div className="absolute inset-0 bg-amber-400/10 mix-blend-screen pointer-events-none animate-pulse flex items-center justify-center">
                    <div className="absolute top-4 right-4 bg-amber-950/90 border border-amber-400/50 text-amber-300 text-[10px] font-mono px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                      <Lightbulb className="w-3 h-3 fill-current animate-bounce" />
                      LED Fairy Lights Glow On
                    </div>
                  </div>
                )}

                {/* Selected Wrap & Ribbon Badge */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                  <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-purple-200">
                    Wrap: <strong className="text-white">{selectedWrap.name}</strong>
                  </span>
                  <span className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-purple-200">
                    Ribbon: <strong className="text-white">{selectedFinish.name.split(' ')[0]}</strong>
                  </span>
                </div>
              </div>

              {/* Attached Mini Polaroids Preview (if polaroid style selected) */}
              {selectedStyle.id === 'polaroid-memory' && (
                <div className="mt-4 pt-4 border-t border-studio-border/70 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono text-purple-300">
                    <span className="flex items-center gap-1.5"><Camera className="w-3.5 h-3.5 text-purple-400" /> Attached Mini Polaroids ({attachedPhotos.length}/5):</span>
                    <label className="text-purple-400 hover:text-white cursor-pointer underline flex items-center gap-1 text-[11px]">
                      <Plus className="w-3 h-3" /> Add Photos
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {attachedPhotos.map((photo, i) => (
                      <div key={i} className="relative w-14 h-18 rounded bg-white p-1 shadow-md flex-shrink-0 transform rotate-[-2deg] hover:rotate-0 transition-transform">
                        <img src={photo} alt={`Memory ${i+1}`} className="w-full h-12 object-cover rounded-xs" />
                        <div className="text-[7px] text-neutral-800 font-mono text-center truncate mt-0.5">#{i+1}</div>
                        {attachedPhotos.length > 1 && (
                          <button
                            onClick={() => setAttachedPhotos(prev => prev.filter((_, idx) => idx !== i))}
                            className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow hover:scale-110"
                            title="Remove photo"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Live Greeting Card Note Tag Preview */}
              <div className="mt-4 p-4 rounded-2xl bg-studio-sand/80 border border-purple-500/30 relative">
                <div className="flex items-center justify-between text-[11px] font-mono text-purple-400 font-bold uppercase tracking-wider mb-1.5">
                  <span className="flex items-center gap-1"><Tag className="w-3 h-3" /> Handwritten Gift Card Note:</span>
                  <span className="text-[10px] text-studio-muted">Included Free</span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-purple-100 leading-relaxed bg-black/40 p-2.5 rounded-xl border border-white/5">
                  "{giftNote || 'Your custom message will appear here...'}"
                </p>
              </div>

              {/* Price Breakdown & Add to Bag */}
              <div className="mt-6 pt-5 border-t border-studio-border flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-studio-muted">Custom Bouquet Total:</div>
                  <div className="font-mono font-black text-2xl sm:text-3xl text-white">
                    ₹{totalCustomPrice}
                  </div>
                </div>

                <button
                  onClick={handleAddCustomBouquetToCart}
                  className="flex-1 bg-studio-terracotta hover:bg-purple-400 text-black px-6 py-4 rounded-2xl font-display font-bold text-xs sm:text-sm uppercase tracking-wider transition-all duration-300 shadow-art hover:shadow-art-hover hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                  <span>Add Bouquet to Bag</span>
                </button>
              </div>

            </div>
          </div>

          {/* RIGHT: Customizer Options Accordion / Controls */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Step 1: Select Bouquet Style */}
            <div className="bg-studio-card rounded-3xl p-6 border border-studio-border shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black font-mono font-bold text-xs flex items-center justify-center">1</span>
                <h3 className="font-display font-bold text-lg text-white">Choose Bouquet Floral Theme</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOUQUET_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                      selectedStyle.id === style.id
                        ? 'bg-studio-sand border-studio-terracotta ring-1 ring-studio-terracotta shadow-md'
                        : 'bg-studio-sand/40 border-studio-border hover:border-purple-400/50'
                    }`}
                  >
                    <img 
                      src={style.image} 
                      alt={style.name} 
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-purple-500/20"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-xs text-white truncate">{style.name}</span>
                        {style.badge && (
                          <span className="bg-purple-950 text-purple-300 text-[9px] font-mono px-1.5 py-0.5 rounded border border-purple-500/40">
                            {style.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-studio-muted line-clamp-2 mt-0.5">{style.subtitle}</p>
                      <div className="text-xs font-mono font-bold text-purple-400 mt-1">₹{style.basePrice} base</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Select Size / Stem Count */}
            <div className="bg-studio-card rounded-3xl p-6 border border-studio-border shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black font-mono font-bold text-xs flex items-center justify-center">2</span>
                <h3 className="font-display font-bold text-lg text-white">Select Stem Count &amp; Scale</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {BOUQUET_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(size)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-1 relative ${
                      selectedSize.id === size.id
                        ? 'bg-studio-sand border-studio-terracotta ring-1 ring-studio-terracotta shadow-md'
                        : 'bg-studio-sand/40 border-studio-border hover:border-purple-400/50'
                    }`}
                  >
                    {size.id === 'bouquet-grand' && (
                      <span className="absolute -top-2.5 right-3 bg-amber-400 text-black text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full shadow-sm">
                        Includes Lights
                      </span>
                    )}
                    <div className="font-bold text-xs text-white">{size.name.split('(')[0]}</div>
                    <div className="text-[10px] text-studio-muted font-mono">{size.dimensions}</div>
                    <div className="text-sm font-mono font-black text-purple-400 pt-1">
                      ₹{Math.round(selectedStyle.basePrice * size.priceMultiplier)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Select Wrapping Style */}
            <div className="bg-studio-card rounded-3xl p-6 border border-studio-border shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black font-mono font-bold text-xs flex items-center justify-center">3</span>
                <h3 className="font-display font-bold text-lg text-white">Choose Wrapping Paper Aesthetics</h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WRAPPING_THEMES.map((wrap) => (
                  <button
                    key={wrap.id}
                    onClick={() => setSelectedWrap(wrap)}
                    className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                      selectedWrap.id === wrap.id
                        ? 'bg-studio-sand border-studio-terracotta ring-1 ring-studio-terracotta shadow-md'
                        : 'bg-studio-sand/40 border-studio-border hover:border-purple-400/50'
                    }`}
                  >
                    <div 
                      className={`w-8 h-8 rounded-full border-2 ${wrap.borderClass} shadow-inner`}
                      style={{ backgroundColor: wrap.color }}
                    />
                    <span className="text-xs font-bold text-white">{wrap.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Ribbon Finish Options */}
            <div className="bg-studio-card rounded-3xl p-6 border border-studio-border shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black font-mono font-bold text-xs flex items-center justify-center">4</span>
                <h3 className="font-display font-bold text-lg text-white">Select Luxury Ribbon Bow</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BOUQUET_FINISHES.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => setSelectedFinish(finish)}
                    className={`p-3.5 rounded-2xl border text-left transition-all space-y-1 ${
                      selectedFinish.id === finish.id
                        ? 'bg-studio-sand border-studio-terracotta ring-1 ring-studio-terracotta shadow-md'
                        : 'bg-studio-sand/40 border-studio-border hover:border-purple-400/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{finish.name}</span>
                      <span className="font-mono text-xs text-purple-400 font-bold">
                        {finish.priceAdd > 0 ? `+₹${finish.priceAdd}` : 'Free'}
                      </span>
                    </div>
                    <p className="text-[11px] text-studio-muted">{finish.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 5: Handwritten Greeting Card & Fairy Lights Addon */}
            <div className="bg-studio-card rounded-3xl p-6 border border-studio-border shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-studio-terracotta text-black font-mono font-bold text-xs flex items-center justify-center">5</span>
                <h3 className="font-display font-bold text-lg text-white">Personalize Gift Card Note &amp; Addons</h3>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-mono text-purple-300 block">
                  Handwritten Note Card Message (Included Free with Every Bouquet):
                </label>
                <textarea
                  rows={3}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Enter your personal heartfelt message to be written on the gift card..."
                  className="w-full bg-studio-sand border border-studio-border rounded-2xl p-3.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta resize-none"
                  maxLength={180}
                />
                <div className="flex justify-between text-[11px] text-studio-muted font-mono">
                  <span>✨ Hand-scribed onto textured cotton mini-card</span>
                  <span>{giftNote.length}/180 chars</span>
                </div>
              </div>

              {/* Quick Template Message Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  'Happy Birthday to my favorite human! 🎂',
                  'Forever blooming, just like our love ❤️',
                  'So incredibly proud of you! ✨',
                  'Just a little reminder that you are loved 🌸',
                ].map((msg, i) => (
                  <button
                    key={i}
                    onClick={() => setGiftNote(msg)}
                    className="text-[11px] font-mono bg-studio-sand/70 hover:bg-studio-terracotta hover:text-black text-purple-200 px-3 py-1.5 rounded-full border border-studio-border transition-colors truncate max-w-[280px]"
                  >
                    {msg}
                  </button>
                ))}
              </div>

              {/* LED Fairy Lights Toggle */}
              {selectedSize.id !== 'bouquet-grand' && (
                <div className="pt-3 border-t border-studio-border/70 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-400">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Add Micro Copper LED Fairy Lights</div>
                      <div className="text-[11px] text-studio-muted">20 warm battery-operated micro fairy lights intertwined in blooms (+₹69)</div>
                    </div>
                  </div>

                  <button
                    onClick={() => setIncludeFairyLights(!includeFairyLights)}
                    className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                      includeFairyLights
                        ? 'bg-amber-400 text-black shadow-md'
                        : 'bg-studio-sand text-purple-200 border border-studio-border hover:bg-studio-terracotta hover:text-black'
                    }`}
                  >
                    {includeFairyLights ? '✓ Added' : '+ Add ₹69'}
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>

      </section>

      {/* 3. CURATED BOUQUET CATALOG COLLECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-reveal pt-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
              <Gift className="w-3.5 h-3.5" /> Curated Drops
            </div>
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
              Ready-to-Ship Bouquet Editions
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

      {/* 4. WHY FOREVER BOUQUETS VALUE PROPS */}
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
                <Heart className="w-5 h-5" />
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
