import React, { useState } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { POLAROID_PACK_SIZES, POLAROID_FINISHES } from '../data/products';
import { 
  Camera, 
  Sparkles, 
  Upload,
  Music,
  Type,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';

type BottomPrintMode = 'caption' | 'song';

const getRequiredPhotoCount = (packId: string): number => {
  switch (packId) {
    case 'pack-1': return 1;
    case 'pack-16': return 16;
    case 'pack-32': return 32;
    default: return 1;
  }
};

export const PolaroidsPage: React.FC = () => {
  const { navigate: _navigate } = useNavigation();
  const { addToCart } = useCart();
  const { addToast } = useToast();

  const [selectedPack, setSelectedPack] = useState(POLAROID_PACK_SIZES[0]); // Pack of 1 default
  const [uploadedImages, setUploadedImages] = useState<string[]>(['/vtv-polaroid.jpg']);
  const [activePreviewIndex, setActivePreviewIndex] = useState<number>(0);
  const [bottomMode, setBottomMode] = useState<BottomPrintMode>('caption');
  const [customCaption, setCustomCaption] = useState('Enter your Caption');
  const [songUrl, setSongUrl] = useState('https://open.spotify.com/track/hosanna-vtv');
  const [customBorder] = useState(POLAROID_FINISHES[0]);

  const requiredCount = getRequiredPhotoCount(selectedPack.id);

  const handleSelectPack = (pack: typeof POLAROID_PACK_SIZES[0]) => {
    setSelectedPack(pack);
    const target = getRequiredPhotoCount(pack.id);
    if (uploadedImages.length > target) {
      setUploadedImages((prev) => prev.slice(0, target));
      if (activePreviewIndex >= target) {
        setActivePreviewIndex(0);
      }
    }
  };

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
          const isInitialDefault = prev.length === 1 && prev[0] === '/vtv-polaroid.jpg';
          const baseList = isInitialDefault ? [] : prev;
          const combined = [...baseList, ...newUrls].slice(0, requiredCount);
          return combined.length > 0 ? combined : ['/vtv-polaroid.jpg'];
        });

        addToast({
          title: 'Photos Uploaded! 📸',
          message: `Added ${fileList.length} photo(s). (${Math.min(fileList.length + (uploadedImages.length === 1 && uploadedImages[0] === '/vtv-polaroid.jpg' ? 0 : uploadedImages.length), requiredCount)}/${requiredCount} total)`,
          type: 'success',
        });
      });
    }
  };

  const handleAutoFillDemo = () => {
    const demoPool = [
      '/vtv-polaroid.jpg',
      '/varanam ayiram.jpeg',
      '/A.R. Rahman.jpg',
      '/Yuvan.jpg',
      '/harris.jpeg',
      '/kaatru veliyidai.jpeg',
      '/messi.jpeg',
      '/ronaldo.jpeg',
      '/unnale unnale.jpeg',
      '/Sai Abhyankar.jpg',
      '/PR.jpg',
      '/Isai Abhyankkar _ vinith.jpg',
      '/aesthetic.jpeg',
      '/logo.jpeg',
    ];
    const filled: string[] = [];
    for (let i = 0; i < requiredCount; i++) {
      filled.push(demoPool[i % demoPool.length]);
    }
    setUploadedImages(filled);
    setActivePreviewIndex(0);
    addToast({
      title: `Auto-Filled ${requiredCount} Demo Photos! ✨`,
      message: `All ${requiredCount} photo slots are loaded for ${selectedPack.name}.`,
      type: 'success',
    });
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedImages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length > 0 ? updated : ['/vtv-polaroid.jpg'];
    });
    if (activePreviewIndex >= uploadedImages.length - 1) {
      setActivePreviewIndex(Math.max(0, uploadedImages.length - 2));
    }
  };

  const handleAddCustomToBag = () => {
    const isSong = bottomMode === 'song';
    const effectiveCaption = isSong ? undefined : (customCaption.trim() || 'Custom Photo');
    const effectiveSong = isSong ? (songUrl.trim() || 'https://open.spotify.com') : undefined;

    if (uploadedImages.length < requiredCount) {
      addToast({
        title: 'Upload More Photos 📸',
        message: `${selectedPack.name} requires ${requiredCount} photos. Currently uploaded: ${uploadedImages.length}/${requiredCount}.`,
        type: 'info',
      });
    }

    // Create custom product wrapper
    const customProduct = {
      id: 'custom-polaroid-pack-' + Date.now(),
      name: isSong
        ? `Custom Polaroid (${selectedPack.name.split('(')[0].trim()} • Song Embed)`
        : `Custom Polaroid (${selectedPack.name.split('(')[0].trim()} • ${effectiveCaption})`,
      slug: 'custom-polaroid-pack',
      category: 'polaroids' as const,
      theme: 'Retro Film' as const,
      price: 50.00,
      tags: [
        'Custom Upload',
        'Personalized',
        `${requiredCount} Photos`,
        ...(isSong ? ['Spotify Song Code'] : ['Handwritten Caption'])
      ],
      description: JSON.stringify({
        customType: 'polaroid',
        packSize: selectedPack.name,
        photoCount: requiredCount,
        bottomMode,
        caption: effectiveCaption,
        songUrl: effectiveSong,
        photos: uploadedImages,
      }),
      customCaption: effectiveCaption,
      songUrl: effectiveSong,
      uploadedPhotos: uploadedImages,
      shortDescription: `${selectedPack.name.split('(')[0].trim()} with ${uploadedImages.length} custom photo(s) & ${isSong ? 'song embed' : 'caption'}.`,
      images: uploadedImages,
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
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

            {/* Step 1: Upload Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-2">
                  <span>1. Upload Photos ({uploadedImages.length} / {requiredCount}):</span>
                  {uploadedImages.length >= requiredCount ? (
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3" /> Ready
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

              {/* Upload Action Buttons */}
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

              {/* Uploaded Photos Tray / Grid */}
              <div className="bg-studio-sand/40 p-3 rounded-2xl border border-studio-border space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-studio-muted">
                  <span>Uploaded Photo Tray (Click to preview on frame):</span>
                  <span>{uploadedImages.length} of {requiredCount} uploaded</span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
                  {uploadedImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePreviewIndex(idx)}
                      className={`relative group rounded-xl overflow-hidden aspect-square border-2 cursor-pointer transition-all duration-200 ${
                        activePreviewIndex === idx
                          ? 'border-purple-500 ring-2 ring-purple-500/50 scale-105 shadow-md'
                          : 'border-studio-border hover:border-purple-400/50'
                      }`}
                    >
                      <img src={imgUrl} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 rounded font-bold">
                        #{idx + 1}
                      </span>
                      {uploadedImages.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemovePhoto(idx);
                          }}
                          className="absolute top-1 right-1 p-0.5 bg-black/80 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove this photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}

                  {uploadedImages.length < requiredCount && (
                    <label className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-purple-950/30 transition-colors text-purple-300 text-center p-1">
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

            {/* Step 2: Choose Bottom Style (Caption OR Song URL) */}
            <div className="space-y-3">
              <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center justify-between">
                <span>2. Choose Bottom Print Style:</span>
                <span className="text-purple-300 font-mono text-[11px] font-bold">Choose Either One</span>
              </label>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-2 bg-studio-sand/80 p-1.5 rounded-2xl border border-studio-border">
                <button
                  type="button"
                  onClick={() => setBottomMode('caption')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    bottomMode === 'caption'
                      ? 'bg-studio-terracotta text-black shadow-md'
                      : 'text-purple-200 hover:text-white hover:bg-black/30'
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Text Caption</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBottomMode('song')}
                  className={`py-2.5 px-3 rounded-xl text-xs font-mono font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    bottomMode === 'song'
                      ? 'bg-studio-terracotta text-black shadow-md'
                      : 'text-purple-200 hover:text-white hover:bg-black/30'
                  }`}
                >
                  <Music className="w-3.5 h-3.5" />
                  <span>Song URL</span>
                </button>
              </div>

              {/* Dynamic Input Based on Selection */}
              {bottomMode === 'caption' ? (
                <div className="space-y-1.5 animate-fadeIn">
                  <input
                    type="text"
                    maxLength={40}
                    placeholder="Enter your Caption"
                    value={customCaption}
                    onChange={(e) => setCustomCaption(e.target.value)}
                    className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
                  />
                  <p className="text-[11px] text-studio-muted font-mono">
                    ✍️ Printed in our aesthetic vintage handwritten font across the bottom margin.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 animate-fadeIn">
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="Paste Song URL (e.g. https://open.spotify.com/track/...)"
                      value={songUrl}
                      onChange={(e) => setSongUrl(e.target.value)}
                      className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-2.5 pl-10 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
                    />
                    <Music className="w-4 h-4 text-purple-400 absolute left-3.5 top-3" />
                  </div>
                  <p className="text-[11px] text-studio-muted font-mono">
                    🎵 We'll print a scannable Spotify music soundwave and track code on the bottom margin!
                  </p>
                </div>
              )}
            </div>

            {/* Step 3: Pack Quantity */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center justify-between">
                <span>3. Select Pack Size:</span>
                <span className="text-purple-300 text-[11px] font-mono">
                  {requiredCount} Photo{requiredCount > 1 ? 's' : ''} Required
                </span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {POLAROID_PACK_SIZES.map((sz) => {
                  const count = getRequiredPhotoCount(sz.id);
                  const isSelected = selectedPack.id === sz.id;
                  return (
                    <button
                      key={sz.id}
                      type="button"
                      onClick={() => handleSelectPack(sz)}
                      className={`p-3 rounded-xl border text-left transition-all duration-300 transform active:scale-95 ${
                        isSelected
                          ? 'border-purple-500 bg-purple-950/70 ring-2 ring-purple-500/50 scale-[1.02] shadow-md'
                          : 'border-studio-border bg-studio-sand/40 hover:bg-studio-sand'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white">{sz.name.split('(')[0].trim()}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-purple-600 text-white' : 'bg-studio-sand text-purple-300 border border-studio-border'
                        }`}>
                          {count} {count === 1 ? 'Photo' : 'Photos'}
                        </span>
                      </div>
                      <div className="text-xs font-mono text-purple-300 font-bold mt-1.5">
                        ₹{Math.round(50.00 * sz.priceMultiplier + customBorder.priceAdd)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom to Bag Button */}
            <button
              onClick={handleAddCustomToBag}
              className="w-full bg-studio-terracotta text-black hover:bg-purple-400 py-3.5 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-[0.98] shadow-md flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span className="text-black font-bold">Add Custom Polaroid Pack to Bag &bull; ₹{Math.round(50.00 * selectedPack.priceMultiplier + customBorder.priceAdd)}</span>
            </button>

          </div>

          {/* Right: Live Interactive Polaroid Preview Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center space-y-4">
            <div className="relative">
              <div className="washi-tape" />
              
              {/* Polaroid Frame Container with switching animation */}
              <div 
                key={`${uploadedImages[activePreviewIndex] || '/vtv-polaroid.jpg'}-${bottomMode}-${bottomMode === 'caption' ? customCaption : songUrl}`}
                className="w-72 sm:w-80 p-4 pb-7 rounded-md shadow-2xl bg-white text-neutral-800 transition-all duration-300 transform rotate-1 hover:rotate-0 animate-tabSwitch border border-neutral-200/60"
              >
                {/* Photo Center */}
                <div className="aspect-square w-full overflow-hidden rounded-sm bg-neutral-100 shadow-inner">
                  <img
                    src={uploadedImages[activePreviewIndex] || uploadedImages[0] || '/vtv-polaroid.jpg'}
                    alt="Custom Polaroid Preview"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>

                {/* Bottom Footer: EITHER Caption OR Scannable Song Bar */}
                {bottomMode === 'caption' ? (
                  <div className="mt-4 text-center">
                    <div className="font-serif italic text-base tracking-wide px-2 truncate text-neutral-900">
                      {customCaption || 'Enter your Caption'}
                    </div>
                    <div className="mt-1 font-mono text-[9px] text-neutral-400 uppercase tracking-widest">
                      STICK SCAPE &bull; 350 GSM RESIN
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-col items-center justify-center gap-1 bg-neutral-100/90 py-2 px-3 rounded-lg border border-neutral-200 mx-1">
                    <div className="flex items-center gap-1.5 w-full justify-center">
                      <Music className="w-3.5 h-3.5 text-purple-700 animate-pulse flex-shrink-0" />
                      <div className="flex items-center gap-0.5 h-3">
                        <span className="w-0.5 h-2 bg-purple-700 rounded-full animate-bounce"></span>
                        <span className="w-0.5 h-3 bg-purple-700 rounded-full animate-pulse"></span>
                        <span className="w-0.5 h-1.5 bg-purple-700 rounded-full"></span>
                        <span className="w-0.5 h-3 bg-purple-700 rounded-full animate-pulse"></span>
                        <span className="w-0.5 h-2 bg-purple-700 rounded-full"></span>
                        <span className="w-0.5 h-3.5 bg-purple-700 rounded-full animate-bounce"></span>
                        <span className="w-0.5 h-1.5 bg-purple-700 rounded-full"></span>
                        <span className="w-0.5 h-2.5 bg-purple-700 rounded-full animate-pulse"></span>
                        <span className="w-0.5 h-2 bg-purple-700 rounded-full"></span>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] text-neutral-600 truncate max-w-[200px]">
                      {songUrl.replace(/^https?:\/\/(www\.)?/, '') || 'spotify.com/track/...'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Carousel Navigator if multiple photos exist */}
            {uploadedImages.length > 1 && (
              <div className="flex items-center gap-3 bg-studio-card px-4 py-2 rounded-2xl border border-studio-border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setActivePreviewIndex((prev) => (prev > 0 ? prev - 1 : uploadedImages.length - 1))}
                  className="p-1.5 bg-studio-sand hover:bg-studio-terracotta hover:text-black rounded-lg text-white transition-colors"
                  title="Previous photo preview"
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
                  title="Next photo preview"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. POLAROID ACCESSORIES HIGHLIGHT */}
      <section className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 grid grid-cols-1 md:grid-cols-3 gap-6 scroll-reveal">
        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN 32 PACK</div>
          <h4 className="font-display font-bold text-base text-white">32 Mini Wooden Pegs</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            Smooth natural beechwood mini clips that securely hold prints without pinching or piercing the cardstock.
          </p>
        </div>

        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN 32 PACK</div>
          <h4 className="font-display font-bold text-base text-white">3M Natural Jute Twine</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            Durable vintage twine string for zig-zag wall suspension across desks, headboards, and cozy corners.
          </p>
        </div>

        <div className="bg-studio-sand p-6 rounded-2xl border border-studio-border shadow-sm space-y-2">
          <div className="font-mono text-xs font-bold text-purple-400 uppercase">INCLUDED IN ALL PACKS</div>
          <h4 className="font-display font-bold text-base text-white">350 GSM Resin Cardstock</h4>
          <p className="text-xs text-studio-muted leading-relaxed">
            Premium laboratory-grade glossy photographic paper with authentic white borders and smudge-proof finish.
          </p>
        </div>
      </section>

    </div>
  );
};
