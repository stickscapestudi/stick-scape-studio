import React, { useState, useMemo, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useWishlist } from '../context/WishlistContext';
import { SAMPLE_PRODUCTS } from '../data/products';
import type { AestheticTheme } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  Sparkles, 
  Heart, 
  Filter, 
  Grid3X3, 
  LayoutGrid
} from 'lucide-react';

export const ShopPage: React.FC = () => {
  const { params } = useNavigation();
  const { wishlistIds, isInWishlist } = useWishlist();

  // State
  const [searchQuery, setSearchQuery] = useState(params.search || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(params.category || 'all');
  const [selectedTheme, setSelectedTheme] = useState<string>(params.theme || 'All');
  const [sortBy, setSortBy] = useState<string>('popular');
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [showWishlistOnly, setShowWishlistOnly] = useState<boolean>(params.wishlist === 'true');
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);
  const [gridCols, setGridCols] = useState<3 | 4>(4);

  // Sync state if navigation params change
  useEffect(() => {
    if (params.search !== undefined) setSearchQuery(params.search);
    if (params.category !== undefined) setSelectedCategory(params.category);
    if (params.theme !== undefined) setSelectedTheme(params.theme);
    if (params.wishlist !== undefined) setShowWishlistOnly(params.wishlist === 'true');
  }, [params]);

  const themes: AestheticTheme[] = [
    'All',
    'Minimalist',
    'Anime & Manga',
    'Cinematic & Movie',
    'Retro Film',
    'Botanical & Nature',
    'Cyberpunk & Neon',
    'Vintage Music',
    'Abstract & Bauhaus'
  ];

  // Filtering & Sorting
  const filteredProducts = useMemo(() => {
    return SAMPLE_PRODUCTS.filter((product) => {
      // Category filter
      if (selectedCategory !== 'all' && product.category !== selectedCategory) {
        return false;
      }

      // Theme filter
      if (selectedTheme !== 'All' && product.theme !== selectedTheme) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesTags = product.tags.some(t => t.toLowerCase().includes(q));
        const matchesTheme = product.theme.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesTags && !matchesTheme) return false;
      }

      // Price filter
      if (product.price > maxPrice) {
        return false;
      }

      // Wishlist filter
      if (showWishlistOnly && !isInWishlist(product.id)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      // Default: Popularity / Bestseller
      return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0) || b.reviewCount - a.reviewCount;
    });
  }, [selectedCategory, selectedTheme, searchQuery, maxPrice, showWishlistOnly, sortBy, wishlistIds]);

  const clearAllFilters = () => {
    setSelectedCategory('all');
    setSelectedTheme('All');
    setSearchQuery('');
    setMaxPrice(1000);
    setShowWishlistOnly(false);
  };

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedTheme !== 'All' || 
    searchQuery.trim() !== '' || 
    maxPrice < 1000 || 
    showWishlistOnly;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-studio-card rounded-3xl p-8 sm:p-12 border border-purple-500/30 relative overflow-hidden">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs text-purple-400 uppercase font-bold tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> Curated Studio Catalog
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
            {showWishlistOnly ? 'Your Saved Favorites' : 'All Prints & Collections'}
          </h1>
          <p className="text-sm text-studio-muted leading-relaxed">
            {showWishlistOnly
              ? 'Items you have saved to your personal collection. Ready to make your walls look stunning?'
              : 'Browse our complete library of 300 GSM posters, 35mm Polaroid card packs, and gallery bundles.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="bg-studio-card rounded-2xl p-4 sm:p-5 border border-studio-border shadow-sm flex flex-col lg:flex-row items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {[
            { id: 'all', label: 'All Art' },
            { id: 'posters', label: 'Wall Posters' },
            { id: 'polaroids', label: 'Polaroid Packs' },
            { id: 'bundles', label: 'Room Bundles' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                setShowWishlistOnly(false);
              }}
              className={`text-xs font-mono px-4 py-2.5 rounded-xl transition-all ${
                selectedCategory === cat.id && !showWishlistOnly
                  ? 'bg-studio-terracotta text-black font-bold shadow-md'
                  : 'bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border'
              }`}
            >
              {cat.label}
            </button>
          ))}

          <button
            onClick={() => setShowWishlistOnly(!showWishlistOnly)}
            className={`text-xs font-mono px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${
              showWishlistOnly
                ? 'bg-studio-terracotta text-black font-bold shadow-md'
                : 'bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showWishlistOnly ? 'fill-current' : ''}`} />
            <span>Wishlist ({wishlistIds.length})</span>
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              placeholder="Search art..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-studio-sand border border-studio-border rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta"
            />
            <Search className="w-4 h-4 text-studio-muted absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-studio-muted hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-studio-sand border border-studio-border rounded-xl px-3 py-2 text-xs font-mono text-purple-200 focus:outline-none focus:border-studio-terracotta"
            >
              <option value="popular">Sort: Popular</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="reviews">Most Reviewed</option>
            </select>
          </div>

          {/* Mobile Filter Toggle */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden p-2 bg-studio-sand text-purple-200 border border-studio-border rounded-xl"
            aria-label="Toggle Filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Desktop Grid Switcher */}
          <div className="hidden sm:flex items-center gap-1 border-l border-studio-border pl-3">
            <button
              onClick={() => setGridCols(3)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 3 ? 'bg-studio-terracotta text-black font-bold' : 'text-studio-muted hover:text-white'
              }`}
              title="3 Columns"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setGridCols(4)}
              className={`p-1.5 rounded-lg transition-colors ${
                gridCols === 4 ? 'bg-studio-terracotta text-black font-bold' : 'text-studio-muted hover:text-white'
              }`}
              title="4 Columns"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content: Sidebar + Products */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Sidebar Filters */}
        <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} bg-studio-card rounded-2xl p-6 border border-studio-border shadow-sm space-y-6`}>
          
          <div className="flex items-center justify-between pb-4 border-b border-studio-border">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-purple-400" /> Filters
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-purple-400 font-mono font-semibold hover:underline"
              >
                Reset All
              </button>
            )}
          </div>

          {/* Aesthetic Theme */}
          <div className="space-y-2.5">
            <label className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold block">
              Aesthetic Theme
            </label>
            <div className="flex flex-col gap-1">
              {themes.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTheme(t)}
                  className={`text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors ${
                    selectedTheme === t
                      ? 'bg-studio-terracotta font-bold text-black'
                      : 'text-purple-200 hover:bg-studio-sand'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="space-y-3 pt-4 border-t border-studio-border">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono uppercase tracking-wider text-purple-300 font-bold">Max Price</span>
              <span className="font-mono font-bold text-white">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-purple-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-studio-muted font-mono">
              <span>₹10</span>
              <span>₹500</span>
              <span>₹1,000</span>
            </div>
          </div>

          {/* Paper / Material specs badge */}
          <div className="pt-4 border-t border-studio-border bg-studio-sand/50 p-4 rounded-xl space-y-1 border border-studio-border">
            <div className="text-xs font-bold text-white">✨ Studio Quality Guarantee</div>
            <p className="text-[11px] text-studio-muted leading-relaxed">
              All posters are 300 GSM cotton rag. Polaroids are 350 GSM glossy resin-coated cardstock.
            </p>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-6">
          
          {/* Active Filter Pills Bar */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-studio-muted font-mono">Active:</span>
              {selectedCategory !== 'all' && (
                <span className="bg-studio-sand border border-studio-border text-white px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {selectedTheme !== 'All' && (
                <span className="bg-studio-sand border border-studio-border text-white px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  Theme: {selectedTheme}
                  <button onClick={() => setSelectedTheme('All')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {searchQuery && (
                <span className="bg-studio-sand border border-studio-border text-white px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {showWishlistOnly && (
                <span className="bg-studio-terracotta text-black font-bold px-3 py-1 rounded-full font-mono flex items-center gap-1.5">
                  Wishlist Only
                  <button onClick={() => setShowWishlistOnly(false)}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Products Count Indicator */}
          <div className="flex items-center justify-between text-xs text-studio-muted font-mono">
            <span>Showing <strong className="text-white">{filteredProducts.length}</strong> unique prints</span>
            <span>Worldwide Shipping in 24h</span>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-studio-card rounded-3xl p-12 text-center border border-studio-border space-y-4 animate-tabSwitch">
              <div className="w-16 h-16 bg-studio-sand rounded-full flex items-center justify-center mx-auto text-purple-400 border border-studio-border">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-display font-bold text-xl text-white">No prints matched your filters</h3>
              <p className="text-xs text-studio-muted max-w-sm mx-auto">
                Try searching for something else like "Vaaranam Aayiram", "Rahman", "Yuvan", or reset your price and theme filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="mt-2 bg-studio-terracotta text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-purple-400 transition-colors shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div 
              key={`${selectedCategory}-${selectedTheme}-${searchQuery}-${sortBy}-${maxPrice}-${showWishlistOnly}-${gridCols}`}
              className={`grid gap-4 sm:gap-6 animate-tabSwitch ${
                gridCols === 3 ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              }`}
            >
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

        </main>
      </div>

    </div>
  );
};
