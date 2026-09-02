import React, { useState } from 'react';
import { useNavigation, type PageRoute } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/products';

export const Navbar: React.FC = () => {
  const { currentPage, navigate } = useNavigation();
  const { totalItemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks: { label: string; page: PageRoute; params?: Record<string, string> }[] = [
    { label: 'Home', page: 'home' },
    { label: 'All Art', page: 'shop' },
    { label: 'Wall Posters', page: 'posters' },
    { label: 'Polaroid Prints', page: 'polaroids' },
    { label: 'Room Bundles', page: 'shop', params: { category: 'bundles' } },
    { label: 'Track Order', page: 'track-order' },
    { label: 'About Studio', page: 'about' },
    { label: 'Contact', page: 'contact' },
    { label: 'Admin', page: 'admin' },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('shop', { search: searchQuery.trim() });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const searchResults = searchQuery.trim().length > 1
    ? SAMPLE_PRODUCTS.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      ).slice(0, 5)
    : [];

  return (
    <>
      {/* Main Navigation */}
      <header className="sticky top-0 z-40 bg-studio-bg/90 backdrop-blur-md border-b border-studio-border transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo (Far Left) */}
          <div 
            onClick={() => navigate('home')}
            className="cursor-pointer flex items-center gap-3 group flex-shrink-0"
          >
            <img 
              src="/logo.jpeg" 
              alt="Stick Scape Studio" 
              className="w-11 h-11 object-cover rounded-xl shadow-md border border-studio-border group-hover:border-studio-terracotta transition-colors duration-300"
            />
            <div>
              <span className="font-display font-black text-xl tracking-tight text-white uppercase group-hover:text-studio-terracotta transition-colors">
                STICK SCAPE
              </span>
              <span className="block font-mono text-[10px] tracking-widest text-white uppercase -mt-1 font-bold">
                STUDIO &bull; ART PRINTS
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = 
                currentPage === link.page && 
                (!link.params || Object.keys(link.params).every(k => !link.params || link.params[k] === ''));
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.page, link.params)}
                  className={`text-sm font-medium tracking-wide transition-colors duration-200 py-1 relative ${
                    isActive
                      ? 'text-studio-terracotta font-semibold'
                      : 'text-studio-charcoal hover:text-studio-terracotta'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-studio-terracotta rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Actions: Search, Wishlist, Bag, Mobile Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-studio-charcoal hover:text-studio-terracotta hover:bg-studio-sand/50 rounded-full transition-colors"
              aria-label="Search art and polaroids"
              title="Search art"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => navigate('shop', { wishlist: 'true' })}
              className="p-2 text-studio-charcoal hover:text-studio-terracotta hover:bg-studio-sand/50 rounded-full transition-colors relative"
              aria-label={`Wishlist with ${wishlistCount} items`}
              title="Saved Favorites"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-studio-terracotta text-white font-mono text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Cart Bag Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 bg-studio-terracotta text-black px-4 py-2.5 rounded-full hover:bg-purple-400 transition-colors shadow-md duration-300 font-bold group"
              aria-label={`Shopping bag with ${totalItemsCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-black group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline text-black">Bag</span>
              <span className="bg-black/20 text-black font-mono text-xs px-2 py-0.5 rounded-full font-black">
                {totalItemsCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-white hover:text-studio-terracotta rounded-lg focus:outline-none lg:hidden"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="bg-studio-card w-full max-w-2xl rounded-2xl shadow-2xl border border-studio-border p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-4 border-b border-studio-border">
              <div className="flex items-center gap-2 text-studio-terracotta font-mono text-xs tracking-wider uppercase font-semibold">
                <Sparkles className="w-4 h-4" /> Discover Posters &amp; Polaroids
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-studio-muted hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSearchSubmit} className="mt-4 relative">
              <input
                type="text"
                autoFocus
                placeholder="Search by aesthetic, title, anime, botanical, polaroids..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-12 py-3.5 text-sm text-white focus:outline-none focus:border-studio-terracotta focus:ring-1 focus:ring-studio-terracotta placeholder:text-neutral-500"
              />
              <Search className="w-5 h-5 text-studio-muted absolute left-4 top-4" />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 bg-studio-terracotta text-black font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-purple-400 transition-colors"
              >
                Search
              </button>
            </form>

            {/* Live Autocomplete Results */}
            {searchResults.length > 0 && (
              <div className="mt-4 pt-2 divide-y divide-studio-border/60">
                <p className="text-xs font-mono uppercase text-studio-muted mb-2 tracking-wider">Matching Products</p>
                {searchResults.map((prod) => (
                  <div
                    key={prod.id}
                    onClick={() => {
                      navigate('product', { id: prod.id });
                      setSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="py-2.5 px-2 flex items-center justify-between hover:bg-studio-sand/40 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-md" />
                      <div>
                        <h5 className="text-sm font-semibold text-studio-dark">{prod.name}</h5>
                        <span className="text-xs text-studio-muted capitalize">{prod.category} &bull; ${prod.price.toFixed(2)}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-studio-muted" />
                  </div>
                ))}
              </div>
            )}

            {/* Quick Keyword Suggestions */}
            <div className="mt-5 pt-4 border-t border-studio-border">
              <p className="text-xs text-studio-muted font-mono uppercase tracking-wider mb-2">Popular Searches:</p>
              <div className="flex flex-wrap gap-2">
                {['Kyoto Cyberpunk', 'Vintage Film Polaroids', 'Botanical', 'Gallery Wall Bundles', 'Minimalist Aura'].map((term) => (
                  <button
                    key={term}
                    onClick={() => {
                      navigate('shop', { search: term });
                      setSearchOpen(false);
                    }}
                    className="text-xs bg-studio-sand hover:bg-studio-terracotta hover:text-black font-semibold px-3 py-1.5 rounded-full transition-colors text-purple-200 border border-studio-border"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-studio-dark/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-0 left-0 bottom-0 w-4/5 max-w-sm bg-studio-card border-r border-studio-border p-6 flex flex-col justify-between shadow-2xl animate-fadeIn">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-studio-border">
                <div className="flex items-center gap-2.5">
                  <img 
                    src="/logo.jpeg" 
                    alt="Stick Scape Studio" 
                    className="w-9 h-9 object-cover rounded-lg shadow-sm border border-studio-border"
                  />
                  <span className="font-display font-black text-lg tracking-tight uppercase">
                    STICK SCAPE
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-studio-muted hover:text-studio-dark rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="py-6 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.label}
                    onClick={() => {
                      navigate(link.page, link.params);
                      setMobileMenuOpen(false);
                    }}
                    className="text-left font-display font-bold text-xl text-studio-dark hover:text-studio-terracotta transition-colors py-1 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-studio-muted" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-studio-border">
              <button
                onClick={() => {
                  navigate('shop', { wishlist: 'true' });
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 mb-3 rounded-xl bg-studio-sand flex items-center justify-between text-sm font-semibold text-studio-charcoal"
              >
                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-studio-terracotta" /> Saved Favorites</span>
                <span className="font-mono text-xs bg-studio-terracotta text-black font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </button>
              
              <div className="text-xs text-studio-muted font-mono leading-relaxed">
                STICK SCAPE STUDIO &copy; {new Date().getFullYear()}<br />
                Aesthetic Room Decor &amp; Wall Art
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
