import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Ruler, 
  Layers, 
  ArrowRight, 
  Check,
  Upload,
  Sparkles,
  CheckCircle2,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface CustomPosterPackSize {
  id: string;
  name: string;
  dimensions: string;
  price: number;
  photoCount: number;
  inStock: boolean;
}

export const CUSTOM_POSTER_PACK_SIZES: CustomPosterPackSize[] = [
  {
    id: 'pack-1-a4',
    name: 'Pack of 1 A4',
    dimensions: '21.0 × 29.7 cm (Classic A4 Scale)',
    price: 60,
    photoCount: 1,
    inStock: true,
  },
  {
    id: 'pack-4-a6',
    name: 'Pack of 4 A6',
    dimensions: '10.5 × 14.8 cm (A6 Mini Prints)',
    price: 100,
    photoCount: 4,
    inStock: true,
  },
  {
    id: 'pack-4-a4',
    name: 'Pack of 4 A4',
    dimensions: '21.0 × 29.7 cm (Full A4 Scale)',
    price: 220,
    photoCount: 4,
    inStock: true,
  },
];

export const PostersPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  // Customizer Studio State
  const [selectedPack, setSelectedPack] = useState<CustomPosterPackSize>(CUSTOM_POSTER_PACK_SIZES[0]); // Pack of 1 A4 default
  const [uploadedImages, setUploadedImages] = useState<string[]>(['/varanam ayiram.jpeg']);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);

  // Catalog tab visualizer state
  const [selectedSizeTab, setSelectedSizeTab] = useState(CUSTOM_POSTER_PACK_SIZES[0]);

  const posters = SAMPLE_PRODUCTS.filter(p => p.category === 'posters');
  const requiredCount = selectedPack.photoCount;

  // Handle pack selection
  const handleSelectPack = (pack: CustomPosterPackSize) => {
    setSelectedPack(pack);
    if (uploadedImages.length > pack.photoCount) {
      setUploadedImages((prev) => prev.slice(0, pack.photoCount));
      if (activePreviewIndex >= pack.photoCount) {
        setActivePreviewIndex(0);
      }
    }
  };

  // Handle image upload from user device
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);

      Promise.all(
        fileList.map((file) => {
          return new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
              resolve((ev.target?.result as string) || URL.createObjectURL(file));
            };
            reader.onerror = () => {
              resolve(URL.createObjectURL(file));
            };
            reader.readAsDataURL(file);
          });
        })
      ).then((newUrls) => {
        setUploadedImages((prev) => {
          const isInitialDefault = prev.length === 1 && prev[0] === '/varanam ayiram.jpeg';
          const baseList = isInitialDefault ? [] : prev;
          const combined = [...baseList, ...newUrls].slice(0, requiredCount);
          return combined.length > 0 ? combined : ['/varanam ayiram.jpeg'];
        });

        addToast({
          title: 'Artwork Uploaded! 🎨',
          message: `Added ${fileList.length} photo(s). (${Math.min(fileList.length + (uploadedImages.length === 1 && uploadedImages[0] === '/varanam ayiram.jpeg' ? 0 : uploadedImages.length), requiredCount)}/${requiredCount} total)`,
          type: 'success',
        });
      });
    }
  };

  // Auto-fill demo artwork
  const handleAutoFillDemo = () => {
    const demoArtPool = [
      '/varanam ayiram.jpeg',
      '/vtv.jpeg',
      '/kaatru veliyidai.jpeg',
      '/messi.jpeg',
      '/ronaldo.jpeg',
      '/Isai Abhyankkar _ vinith.jpg',
      '/aesthetic.jpeg',
      '/A.R. Rahman.jpg',
      '/Sai Abhyankar.jpg',
      '/unnale unnale.jpeg',
      '/PR.jpg',
      '/harris.jpeg',
      '/Yuvan.jpg',
      '/logo.jpeg',
    ];

    const filled: string[] = [];
    for (let i = 0; i < requiredCount; i++) {
      filled.push(demoArtPool[i % demoArtPool.length]);
    }
    setUploadedImages(filled);
    setActivePreviewIndex(0);

    addToast({
      title: `Auto-Filled ${requiredCount} Demo Posters! ✨`,
      message: `All ${requiredCount} slots loaded for ${selectedPack.name}.`,
      type: 'success',
    });
  };

  // Remove photo from tray
  const handleRemovePhoto = (index: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : ['/varanam ayiram.jpeg'];
    });
    if (activePreviewIndex >= uploadedImages.length - 1) {
      setActivePreviewIndex(Math.max(0, uploadedImages.length - 2));
    }
  };

  // Add Custom Poster Pack to Bag
  const handleAddCustomToBag = () => {
    if (uploadedImages.length < requiredCount) {
      addToast({
        title: 'Upload More Photos 📸',
        message: `${selectedPack.name} requires ${requiredCount} photos. Currently uploaded: ${uploadedImages.length}/${requiredCount}.`,
        type: 'info',
      });
    }

    const customProduct = {
      id: 'custom-poster-pack-' + Date.now(),
      name: `Custom Wall Poster (${selectedPack.name})`,
      slug: 'custom-wall-poster',
      category: 'posters' as const,
      theme: 'Abstract & Bauhaus' as const,
      price: selectedPack.price,
      tags: [
        'Custom Upload',
        selectedPack.name,
        `${requiredCount} Photos`,
        '300 GSM Archival',
      ],
      description: JSON.stringify({
        customType: 'wall-poster',
        packSize: selectedPack.name,
        dimensions: selectedPack.dimensions,
        photoCount: requiredCount,
        photos: uploadedImages,
      }),
      customCaption: `${selectedPack.name} with ${uploadedImages.length} custom artwork(s)`,
      uploadedPhotos: uploadedImages,
      shortDescription: `${selectedPack.name} (${selectedPack.dimensions}) with ${uploadedImages.length} custom artwork(s).`,
      images: uploadedImages,
      sizes: [
        {
          id: selectedPack.id,
          name: selectedPack.name,
          dimensions: selectedPack.dimensions,
          priceMultiplier: 1.0,
          inStock: true,
        },
      ],
      finishes: [
        {
          id: 'unframed-matte',
          name: 'Archival Matte (300 GSM)',
          priceAdd: 0,
          description: '300 GSM Archival cotton rag with damage-free hanging strips.',
        },
      ],
      rating: 5.0,
      reviewCount: 1,
      paperSpecs: '300 GSM Archival Acid-Free Cotton Rag',
      inventoryCount: 99,
    };

    addToCart(customProduct, customProduct.sizes[0], customProduct.finishes[0], 1);
  };

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
            Printed with 12-color Japanese pigment inks on heavyweight acid-free cotton rag. Available in Pack of 1 A4 (₹60), Pack of 4 A6 (₹100), and Pack of 4 A4 (₹220).
          </p>
        </div>
      </div>

      {/* 2. CUSTOM POSTER CREATOR STUDIO (INTERACTIVE FEATURE) */}
      <section className="bg-studio-card rounded-3xl p-6 sm:p-10 border border-studio-border shadow-2xl scroll-reveal">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left: Interactive Customization Controls */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <span className="font-mono text-xs text-purple-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-studio-terracotta" />
                CUSTOM WALL ART LAB
              </span>
              <h2 className="font-display font-black text-2xl sm:text-3xl text-white mt-1">
                Print Your Own Custom Wall Poster
              </h2>
              <p className="text-xs text-studio-muted mt-1 leading-relaxed">
                Upload your personal photography, favorite cinema still, anime visual, or digital design. We print in ultra-fine 300 GSM archival cotton.
              </p>
            </div>

            {/* Step 1: Upload Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-2">
                  <span>1. Upload Photos ({uploadedImages.length} / {requiredCount}):</span>
                  {uploadedImages.length >= requiredCount ? (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Ready to Print
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                      Need {requiredCount - uploadedImages.length} more
                    </span>
                  )}
                </label>
                <span className="text-studio-muted font-normal text-[11px] font-mono">Supports JPG, PNG, WEBP</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-studio-sand rounded-full h-1.5 overflow-hidden border border-studio-border">
                <div 
                  className="bg-studio-terracotta h-full transition-all duration-300 rounded-full"
                  style={{ width: `${Math.min(100, (uploadedImages.length / requiredCount) * 100)}%` }}
                />
              </div>

              {/* Upload Buttons */}
              <div className="flex flex-wrap items-center gap-2.5">
                <label className="cursor-pointer inline-flex items-center gap-2 bg-studio-sand hover:bg-studio-terracotta hover:text-black border border-studio-border text-purple-200 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold transition-colors shadow-sm">
                  <Upload className="w-4 h-4 text-purple-400" />
                  <span>{requiredCount === 1 ? 'Upload 1 Photo' : `Upload up to ${requiredCount} Photos`}</span>
                  <input
                    type="file"
                    multiple={requiredCount > 1}
                    accept="image/*"
                    onChange={handleFilesUpload}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleAutoFillDemo}
                  className="inline-flex items-center gap-1.5 bg-studio-sand/70 hover:bg-purple-950 border border-studio-border text-purple-300 px-3 py-2.5 rounded-xl text-xs font-mono transition-colors"
                  title={`Auto-fill ${requiredCount} demo photos`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Auto-fill {requiredCount} Demo Photos</span>
                </button>
              </div>

              {/* Uploaded Photos Tray */}
              <div className="bg-studio-sand/40 p-3 rounded-2xl border border-studio-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-studio-muted">
                  <span>Uploaded Artwork Tray (Click to preview on wall):</span>
                  <span>{uploadedImages.length} of {requiredCount} uploaded</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                  {uploadedImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      className={`relative group rounded-xl overflow-hidden aspect-[1/1.3] border-2 cursor-pointer transition-all duration-200 ${
                        activePreviewIndex === idx
                          ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-md'
                          : 'border-studio-border hover:border-purple-400/50'
                      }`}
                    >
                      <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1.5 py-0.5 rounded font-bold">
                        #{idx + 1}
                      </span>
                      {uploadedImages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove this photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {uploadedImages.length < requiredCount && (
                    <label className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl flex flex-col items-center justify-center aspect-[1/1.3] cursor-pointer hover:bg-purple-950/30 transition-colors text-purple-300 text-center p-1">
                      <Plus className="w-4 h-4 mb-0.5" />
                      <span className="text-[9px] font-mono leading-tight">Add More</span>
                      <input
                        type="file"
                        multiple={requiredCount > 1}
                        accept="image/*"
                        onChange={handleFilesUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Select Scale / Pack Size */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center justify-between">
                <span>2. Select Scale &amp; Pack Size:</span>
                <span className="text-purple-300 text-[11px] font-mono">
                  {requiredCount} Photo{requiredCount > 1 ? 's' : ''} Required
                </span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {CUSTOM_POSTER_PACK_SIZES.map((sz) => {
                  const isSelected = selectedPack.id === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => handleSelectPack(sz)}
                      className={`p-3.5 rounded-2xl border text-left transition-all duration-300 transform active:scale-95 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/70 ring-2 ring-purple-500/50 scale-[1.02] shadow-md'
                          : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-display font-bold text-sm text-white">{sz.name}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-studio-sand text-purple-300 border border-studio-border'
                        }`}>
                          {sz.photoCount} {sz.photoCount === 1 ? 'Photo' : 'Photos'}
                        </span>
                      </div>
                      <div className="text-[11px] font-mono text-studio-muted mt-1">
                        {sz.dimensions}
                      </div>
                      <div className="text-sm font-mono text-purple-300 font-bold mt-2">
                        ₹{sz.price}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Poster to Bag Button */}
            <button
              onClick={handleAddCustomToBag}
              className="w-full bg-studio-terracotta text-black hover:bg-purple-400 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-black font-bold">
                Add Custom Wall Poster to Bag &bull; ₹{selectedPack.price}
              </span>
            </button>

          </div>

          {/* Right: Live Interactive Wall Art Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            
            {/* Gallery Wall Background Container */}
            <div className="w-full bg-[#121214] p-6 sm:p-8 rounded-3xl border border-studio-border shadow-2xl flex flex-col items-center justify-center relative overflow-hidden">
              
              {/* Studio lighting gradient spot */}
              <div className="absolute top-0 inset-x-0 h-40 bg-radial from-purple-500/10 via-transparent to-transparent pointer-events-none" />

              {/* Hanging Washi Tape Top Detail */}
              <div className="washi-tape" />

              {/* Poster Container */}
              <div 
                key={`${uploadedImages[activePreviewIndex] || '/varanam ayiram.jpeg'}-${selectedPack.id}`}
                className="w-64 sm:w-72 max-w-full rounded-sm transition-all duration-300 transform hover:scale-[1.02] animate-tabSwitch relative border-2 border-studio-border/60 shadow-[0_20px_45px_rgba(0,0,0,0.8)] bg-black"
              >
                
                {/* Artwork Stage */}
                <div className="w-full aspect-[1/1.41] overflow-hidden bg-black relative">
                  <img
                    src={uploadedImages[activePreviewIndex] || uploadedImages[0] || '/varanam ayiram.jpeg'}
                    alt="Custom Wall Poster Preview"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

              </div>

              {/* Frame Specs Pill */}
              <div className="mt-6 flex items-center gap-2 font-mono text-[10px] text-purple-300 bg-black/60 px-3.5 py-1.5 rounded-full border border-studio-border">
                <span className="text-white font-bold">{selectedPack.name}</span>
                <span>&bull;</span>
                <span>{selectedPack.photoCount} {selectedPack.photoCount === 1 ? 'Print' : 'Prints'}</span>
                <span>&bull;</span>
                <span className="text-emerald-400 font-bold">₹{selectedPack.price}</span>
              </div>

            </div>

            {/* Carousel Navigator if multiple photos exist */}
            {uploadedImages.length > 1 && (
              <div className="flex items-center gap-3 bg-studio-card px-4 py-2 rounded-2xl border border-studio-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : uploadedImages.length - 1))}
                  className="p-1.5 bg-studio-sand hover:bg-studio-terracotta hover:text-black rounded-lg text-white transition-colors"
                  title="Previous poster preview"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-purple-300 font-bold">
                  Previewing <span className="text-white font-black">#{activePreviewIndex + 1}</span> of <span className="text-white font-black">{uploadedImages.length}</span>
                </span>

                <button
                  type="button"
                  onClick={() => setActivePreviewIndex((prev) => (prev < uploadedImages.length - 1 ? prev + 1 : 0))}
                  className="p-1.5 bg-studio-sand hover:bg-studio-terracotta hover:text-black rounded-lg text-white transition-colors"
                  title="Next poster preview"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="text-center text-[11px] font-mono text-studio-muted">
              ✨ Archival 300 GSM Print: Simulated scale for {selectedPack.dimensions}
            </div>

          </div>

        </div>
      </section>

      {/* 3. INTERACTIVE POSTER SIZE & SCALE GUIDE */}
      <section className="bg-studio-card rounded-3xl p-6 sm:p-10 border border-studio-border shadow-sm space-y-8 scroll-reveal">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-studio-border">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold uppercase">
              <Ruler className="w-4 h-4" /> Scale &amp; Pack Size Guide
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CUSTOM_POSTER_PACK_SIZES.map((sz) => (
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
                {sz.name}
              </div>
              <div className="text-xs font-mono text-purple-300 font-semibold mt-0.5">
                {sz.photoCount} {sz.photoCount === 1 ? 'Print' : 'Prints'} &bull; ₹{sz.price}
              </div>
              <div className="text-[11px] text-studio-muted mt-2 font-mono">
                {sz.dimensions}
              </div>
            </button>
          ))}
        </div>

      </section>

      {/* 4. POSTERS CATALOG GRID */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-black text-2xl text-white">
              Curated Catalog Wall Posters
            </h3>
            <p className="text-xs text-studio-muted font-mono mt-0.5">
              Available in Pack of 1 A4, Pack of 4 A6, and Pack of 4 A4
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

      {/* 5. GALLERY WALL ADVICE */}
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
              <span><strong className="text-white">Mix scale:</strong> Combine Pack of 4 A4 statement prints with Pack of 4 A6 mini prints for dynamic visual rhythm.</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Eye-Level Anchor:</strong> Hang the center of your main print 57–60 inches from the floor (standard gallery eye-level).</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
              <span><strong className="text-white">Spacing:</strong> Keep 2–3 inches of consistent breathing room between adjacent poster prints.</span>
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
