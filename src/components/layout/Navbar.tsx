import React, { useState } from 'react';
import { useNavigation, type PageRoute } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  Package,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { SAMPLE_PRODUCTS } from '../../data/products';

export const Navbar: React.FC = () => {
  const { currentPage, navigate } = useNavigation();
  const { totalItemsCount, openCart } = useCart();
  const { wishlistCount } = useWishlist();
  const { customer, isLoggedIn, logout } = useCustomerAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navLinks: { label: string; page: PageRoute; params?: Record<string, string> }[] = [
    { label: 'Home', page: 'home' },
    { label: 'All Art', page: 'shop' },
    { label: 'Wall Posters', page: 'posters' },
    { label: 'Polaroid Prints', page: 'polaroids' },
    { label: 'Room Bundles', page: 'shop', params: { category: 'bundles' } },
    { label: 'Track Order', page: 'track-order' },
    { label: 'About Studio', page: 'about' },
    { label: 'Contact', page: 'contact' },
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
            className="cursor-pointer flex items-center group flex-shrink-0 py-1"
          >
            <img 
              src="/logo-transparent.png" 
              alt="Stick Scape Studio" 
              className="h-11 sm:h-12 w-auto max-w-[190px] sm:max-w-[220px] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(253,155,0,0.2)]"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-3.5 xl:gap-6 2xl:gap-8 flex-shrink-0">
            {navLinks.map((link) => {
              const isActive = 
                currentPage === link.page && 
                (!link.params || Object.keys(link.params).every(k => !link.params || link.params[k] === ''));
              return (
                <button
                  key={link.label}
                  onClick={() => navigate(link.page, link.params)}
                  className={`text-xs xl:text-sm font-medium tracking-wide transition-colors duration-200 py-1 relative whitespace-nowrap flex-shrink-0 ${
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
          <div className="flex items-center gap-2 sm:gap-3 xl:gap-4 flex-shrink-0">
            
            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-studio-charcoal hover:text-studio-terracotta hover:bg-studio-sand/50 rounded-full transition-colors flex-shrink-0"
              aria-label="Search art and polaroids"
              title="Search art"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <button
              onClick={() => navigate('shop', { wishlist: 'true' })}
              className="p-2 text-studio-charcoal hover:text-studio-terracotta hover:bg-studio-sand/50 rounded-full transition-colors relative flex-shrink-0"
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

            {/* User Account / Sign In Dropdown Button */}
            <div className="relative flex-shrink-0">
              {isLoggedIn && customer ? (
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-studio-sand/80 border border-transparent hover:border-studio-terracotta/40 transition-all flex-shrink-0"
                  title="My Account"
                >
                  <div className="w-8 h-8 rounded-full bg-studio-terracotta flex items-center justify-center text-white text-xs font-display font-black shadow-sm">
                    {customer.avatarUrl ? (
                      <img
                        src={customer.avatarUrl}
                        alt={customer.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      customer.name.charAt(0).toUpperCase()
                    )}
                  </div>
                </button>
              ) : (
                <button
                  onClick={() => navigate('login')}
                  className="hidden sm:flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider py-1.5 px-3.5 rounded-full bg-studio-sand hover:bg-studio-terracotta hover:text-white text-studio-charcoal border border-studio-border hover:border-studio-terracotta transition-all whitespace-nowrap flex-shrink-0"
                  title="Sign In"
                >
                  <User className="w-3.5 h-3.5 text-studio-terracotta" />
                  <span className="whitespace-nowrap">Sign In</span>
                </button>
              )}

              {/* User Dropdown Menu */}
              {userDropdownOpen && isLoggedIn && customer && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-studio-card border border-studio-border rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn space-y-1 text-xs font-mono">
                    <div className="p-2.5 pb-2 border-b border-studio-border/70">
                      <p className="font-bold text-white truncate">{customer.name}</p>
                      <p className="text-[10px] text-purple-400 truncate">{customer.email}</p>
                    </div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('account');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-studio-sand text-white hover:text-purple-300 flex items-center gap-2 transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-purple-400" />
                      <span>Saved Address</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('account');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-studio-sand text-white hover:text-purple-300 flex items-center gap-2 transition-colors"
                    >
                      <Package className="w-4 h-4 text-purple-400" />
                      <span>My Orders</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('admin');
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-purple-950/40 text-purple-300 hover:text-purple-200 flex items-center gap-2 transition-colors border-t border-studio-border/70 mt-1 pt-2"
                    >
                      <ShieldCheck className="w-4 h-4 text-studio-terracotta" />
                      <span>Admin Portal</span>
                    </button>

                    <div className="border-t border-studio-border/70 pt-1">
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('home');
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Bag Trigger */}
            <button
              onClick={openCart}
              className="flex items-center gap-2 bg-studio-terracotta text-white px-4 py-2.5 rounded-full hover:bg-studio-terracottaHover transition-colors shadow-md duration-300 font-bold group whitespace-nowrap flex-shrink-0"
              aria-label={`Shopping bag with ${totalItemsCount} items`}
            >
              <ShoppingBag className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline text-white whitespace-nowrap">Bag</span>
              <span className="bg-black/30 text-white font-mono text-xs px-2 py-0.5 rounded-full font-black">
                {totalItemsCount}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-studio-charcoal hover:text-studio-terracotta rounded-lg focus:outline-none lg:hidden flex-shrink-0"
              aria-label="Open mobile menu"
            >
              <Menu className="w-6 h-6" />
            </button>

          </div>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-studio-dark/80 backdrop-blur-md flex items-start justify-center pt-20 px-4 animate-fadeIn">
          <div className="bg-studio-card w-full max-w-2xl rounded-2xl shadow-2xl border border-studio-border p-6 overflow-hidden">
            
            <div className="flex items-center justify-between pb-4 border-b border-studio-border">
              <div className="flex items-center gap-2 text-studio-terracotta font-mono text-xs tracking-wider uppercase font-semibold">
                <Sparkles className="w-4 h-4" /> Discover Posters &amp; Polaroids
              </div>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-studio-muted hover:text-studio-charcoal rounded-lg"
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
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-12 py-3.5 text-sm text-studio-charcoal focus:outline-none focus:border-studio-terracotta focus:ring-1 focus:ring-studio-terracotta placeholder:text-studio-muted/60"
              />
              <Search className="w-5 h-5 text-studio-muted absolute left-4 top-4" />
              <button
                type="submit"
                className="absolute right-2.5 top-2.5 bg-studio-terracotta text-white font-bold px-4 py-1.5 rounded-lg text-xs hover:bg-studio-terracottaHover transition-colors"
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
                        <h5 className="text-sm font-semibold text-studio-charcoal">{prod.name}</h5>
                        <span className="text-xs text-purple-400 capitalize">{prod.category} &bull; ₹{Math.round(prod.price)}</span>
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
                    className="text-xs bg-studio-sand hover:bg-studio-terracotta hover:text-white font-semibold px-3 py-1.5 rounded-full transition-colors text-purple-200 border border-studio-border"
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
                <div 
                  onClick={() => {
                    navigate('home');
                    setMobileMenuOpen(false);
                  }}
                  className="cursor-pointer flex items-center"
                >
                  <img 
                    src="/logo-transparent.png" 
                    alt="Stick Scape Studio" 
                    className="h-10 w-auto max-w-[160px] object-contain drop-shadow-[0_2px_8px_rgba(253,155,0,0.2)]"
                  />
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-studio-muted hover:text-studio-charcoal rounded-lg"
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
                    className="text-left font-display font-bold text-xl text-studio-charcoal hover:text-studio-terracotta transition-colors py-1 flex items-center justify-between"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-studio-muted" />
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-studio-border space-y-3">
              {isLoggedIn && customer ? (
                <div className="p-3 rounded-2xl bg-studio-sand/80 border border-purple-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-studio-terracotta flex items-center justify-center text-white text-xs font-display font-black">
                      {customer.avatarUrl ? (
                        <img
                          src={customer.avatarUrl}
                          alt={customer.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        customer.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-xs font-mono">
                      <p className="font-bold text-white truncate max-w-[120px]">{customer.name}</p>
                      <button
                        onClick={() => {
                          navigate('account');
                          setMobileMenuOpen(false);
                        }}
                        className="text-[11px] text-purple-400 hover:underline"
                      >
                        View Account &bull;
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                      navigate('home');
                    }}
                    className="p-1.5 text-studio-muted hover:text-red-400"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    navigate('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md"
                >
                  <User className="w-4 h-4 text-white" />
                  <span>Customer Sign In / Join</span>
                </button>
              )}

              <button
                onClick={() => {
                  navigate('shop', { wishlist: 'true' });
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-studio-sand flex items-center justify-between text-sm font-semibold text-studio-charcoal hover:border-studio-terracotta/40 border border-studio-border"
              >
                <span className="flex items-center gap-2"><Heart className="w-4 h-4 text-studio-terracotta" /> Saved Favorites</span>
                <span className="font-mono text-xs bg-studio-terracotta text-white font-bold px-2 py-0.5 rounded-full">{wishlistCount}</span>
              </button>

              <button
                onClick={() => {
                  navigate('admin');
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-purple-950/40 hover:bg-purple-900 border border-purple-500/30 flex items-center justify-between text-xs font-mono text-purple-300 hover:text-white transition-colors"
              >
                <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-studio-terracotta" /> Admin Management Hub</span>
                <span>&rarr;</span>
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
