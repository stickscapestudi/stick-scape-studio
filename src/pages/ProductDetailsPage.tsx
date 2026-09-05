import React, { useState, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import type { ProductSize, ProductFinish } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Zap, 
  ChevronDown, 
  Truck, 
  ShieldCheck, 
  Layers, 
  Leaf, 
  Plus, 
  Minus, 
  Sparkles,
  Maximize2
} from 'lucide-react';

export const ProductDetailsPage: React.FC = () => {
  const { params, navigate } = useNavigation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const productId = params.id || 'prod-01';
  const product = SAMPLE_PRODUCTS.find((p) => p.id === productId) || SAMPLE_PRODUCTS[0];

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<ProductSize>(product.sizes[0]);
  const [selectedFinish, setSelectedFinish] = useState<ProductFinish | undefined>(
    product.finishes ? product.finishes[0] : undefined
  );
  const [quantity, setQuantity] = useState(1);
  const [activeAccordion, setActiveAccordion] = useState<'specs' | 'shipping' | 'care' | null>('specs');
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);

  // Update sizes/finishes when product ID changes
  useEffect(() => {
    setSelectedSize(product.sizes[0]);
    setSelectedFinish(product.finishes ? product.finishes[0] : undefined);
    setSelectedImageIndex(0);
    setQuantity(1);
  }, [product]);

  const isFavorite = isInWishlist(product.id);
  const isPolaroid = product.category === 'polaroids';

  // Compute live price
  const unitPrice = parseFloat(
    (product.price * selectedSize.priceMultiplier + (selectedFinish?.priceAdd || 0)).toFixed(2)
  );

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedFinish, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedSize, selectedFinish, quantity);
    navigate('checkout');
  };

  // Related products
  const relatedProducts = SAMPLE_PRODUCTS.filter(
    (p) => p.id !== product.id && (p.category === product.category || p.theme === product.theme)
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-purple-300/70">
        <button onClick={() => navigate('home')} className="hover:text-white transition-colors">Home</button>
        <span>/</span>
        <button onClick={() => navigate('shop', { category: product.category })} className="hover:text-white transition-colors capitalize">
          {product.category}
        </button>
        <span>/</span>
        <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main Product Stage: Gallery + Configurator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Main Large Image Box */}
          <div className="relative rounded-3xl overflow-hidden bg-studio-card aspect-[4/5] sm:aspect-square border border-studio-border shadow-md group">
            
            {/* Washi Tape for Polaroids */}
            {isPolaroid && <div className="washi-tape" />}

            <img
              key={selectedImageIndex}
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={`${product.name} preview`}
              className="w-full h-full object-cover object-center cursor-zoom-in transition-transform duration-500 hover:scale-105 animate-tabSwitch"
              onClick={() => setIsZoomModalOpen(true)}
            />

            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <span className="bg-purple-950/90 text-purple-200 border border-purple-500/40 font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                {product.theme}
              </span>
              {product.isBestSeller && (
                <span className="bg-amber-400 text-black font-mono text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Bestseller
                </span>
              )}
            </div>

            {/* Zoom / Fullscreen Button */}
            <button
              onClick={() => setIsZoomModalOpen(true)}
              className="absolute bottom-4 right-4 p-2.5 bg-black/80 text-white rounded-xl backdrop-blur-sm shadow-md hover:bg-studio-terracotta hover:text-black transition-colors"
              aria-label="View Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Thumbnails Row */}
          <div className="grid grid-cols-4 gap-3">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`rounded-xl overflow-hidden aspect-square border-2 transition-all duration-300 transform active:scale-95 ${
                  selectedImageIndex === idx
                    ? 'border-purple-500 ring-2 ring-purple-500/40 scale-105 shadow-sm'
                    : 'border-studio-border hover:border-purple-500/50'
                }`}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

        </div>

        {/* Right Column: Product Info & Purchasing */}
        <div className="lg:col-span-5 space-y-6">
          
          <div>
            {/* Rating & Review Count */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-neutral-700'}`}
                  />
                ))}
              </div>
              <span className="font-mono text-xs font-bold text-white">{product.rating}</span>
              <span className="text-xs text-studio-muted font-mono">({product.reviewCount} reviews)</span>
            </div>

            {/* Title */}
            <h1 className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-3">
              <span className="font-mono font-black text-2xl sm:text-3xl text-white">
                ₹{Math.round(unitPrice)}
              </span>
            </div>

            <p className="text-sm text-studio-muted mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Configuration Form */}
          <div className="space-y-5 pt-4 border-t border-studio-border">
            
            {/* 1. Size / Pack Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono uppercase font-bold text-purple-200">
                  {product.category === 'polaroids' && product.finishes && product.finishes.length > 0
                    ? '1. Choose Pack Format:'
                    : 'Choose Size / Format:'}
                </span>
                <span className="font-mono text-studio-muted text-[11px]">
                  {selectedSize.dimensions}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.sizes.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => setSelectedSize(sz)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      selectedSize.id === sz.id
                        ? 'border-purple-500 bg-purple-950/70 shadow-sm ring-1 ring-purple-500'
                        : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{sz.name}</div>
                    <div className="text-[11px] font-mono text-purple-300 font-semibold mt-0.5">
                      ₹{Math.round(product.price * sz.priceMultiplier)}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Finish / Ribbon / Border Style Selector */}
            {product.finishes && product.finishes.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono uppercase font-bold text-purple-200">
                    {product.category === 'bouquets'
                      ? '2. Luxury Ribbon Bow:'
                      : product.category === 'polaroids'
                      ? '2. Border Style:'
                      : '2. Frame / Finish Option:'}
                  </span>
                  <span className="font-mono text-studio-muted text-[11px]">
                    {selectedFinish?.priceAdd === 0 ? 'Standard Included' : `+₹${selectedFinish?.priceAdd}`}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {product.finishes.map((fin) => (
                    <button
                      key={fin.id}
                      onClick={() => setSelectedFinish(fin)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedFinish?.id === fin.id
                          ? 'border-purple-500 bg-purple-950/70 ring-1 ring-purple-500 shadow-sm'
                          : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                      }`}
                    >
                      <div className="text-xs font-bold text-white">{fin.name}</div>
                      <div className="text-[11px] text-studio-muted mt-0.5 line-clamp-1">{fin.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Quantity Controls & Stock Info */}
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-200 block">Quantity:</span>
                <div className="flex items-center border border-studio-border rounded-xl bg-studio-sand">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-l-xl transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-mono text-sm font-bold text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-purple-200 hover:text-white hover:bg-white/10 rounded-r-xl transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-semibold font-mono bg-emerald-950/60 px-3 py-1.5 rounded-full border border-emerald-500/40">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  In Stock ({product.inventoryCount} Available)
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <div className="flex gap-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-studio-terracotta hover:bg-purple-400 text-black py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
                  <span className="text-black font-bold">Add to Studio Bag &bull; ₹{Math.round(unitPrice * quantity)}</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className={`p-4 rounded-2xl border transition-colors ${
                    isFavorite
                      ? 'bg-purple-600 text-white border-purple-500 shadow-sm'
                      : 'border-studio-border bg-studio-sand text-white hover:border-purple-500'
                  }`}
                  aria-label="Save to Wishlist"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                className="w-full bg-studio-sand hover:bg-studio-terracotta hover:text-black text-purple-200 border border-purple-500/40 py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-current text-amber-400" />
                <span>Instant Checkout (Buy Now)</span>
              </button>
            </div>

            {/* Guarantee Micro Badges */}
            <div className="grid grid-cols-2 gap-3 pt-3 text-xs text-studio-muted font-mono">
              <div className="flex items-center gap-2 bg-studio-sand p-2.5 rounded-xl border border-studio-border">
                <Truck className="w-4 h-4 text-purple-400" />
                <span>Free shipping over ₹499</span>
              </div>
              <div className="flex items-center gap-2 bg-studio-sand p-2.5 rounded-xl border border-studio-border">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Damage-free guarantee</span>
              </div>
            </div>

          </div>

          {/* Expandable Accordion Tabs */}
          <div className="pt-4 border-t border-studio-border divide-y divide-studio-border text-xs">
            
            {/* Specs Accordion */}
            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'specs' ? null : 'specs')}
                className="w-full flex items-center justify-between font-mono font-bold uppercase text-white text-left"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Print &amp; Paper Specifications
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'specs' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'specs' && (
                <div className="mt-3 text-studio-muted leading-relaxed space-y-2 animate-fadeIn">
                  <p><strong className="text-white">Material &amp; Craft:</strong> {product.bouquetSpecs || product.paperSpecs}</p>
                  {product.category === 'bouquets' ? (
                    <>
                      <p><strong className="text-white">Care &amp; Longevity:</strong> 100% Everlasting bloom. No watering, wilting, or sunlight required.</p>
                      <p><strong className="text-white">Packaging:</strong> Gift-ready luxury protective box with custom handwritten gift note card included.</p>
                    </>
                  ) : (
                    <>
                      <p><strong className="text-white">Ink Type:</strong> 12-Color archival pigment formulation with ultra-deep black depth and micro-gradient fidelity.</p>
                      <p><strong className="text-white">Archival Life:</strong> 80+ years fade resistance under standard indoor conditions.</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shipping Accordion */}
            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'shipping' ? null : 'shipping')}
                className="w-full flex items-center justify-between font-mono font-bold uppercase text-white text-left"
              >
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-purple-400" /> Packaging &amp; Fast Delivery
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'shipping' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'shipping' && (
                <div className="mt-3 text-studio-muted leading-relaxed space-y-2 animate-fadeIn">
                  <p>Posters are rolled in silk glassine paper and shipped in 3mm reinforced kraft tubes.</p>
                  <p>Polaroid sets arrive in custom embossed gift boxes nestled in eco-mailers.</p>
                  <p>Dispatched from our studio within 24–48 business hours.</p>
                </div>
              )}
            </div>

            {/* Hanging & Care Accordion */}
            <div className="py-3">
              <button
                onClick={() => setActiveAccordion(activeAccordion === 'care' ? null : 'care')}
                className="w-full flex items-center justify-between font-mono font-bold uppercase text-white text-left"
              >
                <span className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-purple-400" /> Hanging &amp; Room Care
                </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${activeAccordion === 'care' ? 'rotate-180' : ''}`} />
              </button>
              {activeAccordion === 'care' && (
                <div className="mt-3 text-studio-muted leading-relaxed space-y-2 animate-fadeIn">
                  <p>Compatible with standard poster tape, removable glue dots, washi tape, and standard IKEA frames.</p>
                  <p>Avoid direct continuous high-humidity exposure (e.g. unventilated showers).</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomModalOpen(false)}
        >
          <div className="max-w-4xl max-h-[90vh] relative">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.name}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl border border-purple-500/40"
            />
            <div className="text-center text-purple-200 font-mono text-xs mt-3">
              {product.name} &bull; Click anywhere to close
            </div>
          </div>
        </div>
      )}

      {/* Related Products Recommendation Slider */}
      <section className="pt-12 border-t border-studio-border space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-mono text-xs uppercase font-bold text-purple-400 tracking-wider">
              MATCHING AESTHETICS
            </span>
            <h3 className="font-display font-black text-2xl text-white mt-0.5">
              You Might Also Love
            </h3>
          </div>
          <button
            onClick={() => navigate('shop')}
            className="text-xs font-mono text-purple-400 font-bold hover:underline"
          >
            View Entire Catalog
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {relatedProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

    </div>
  );
};
