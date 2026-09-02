import React, { useState } from 'react';
import type { Product } from '../../types';
import { useNavigation } from '../../context/NavigationContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { Heart, ShoppingBag, Star, Check, Sparkles } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigate } = useNavigation();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [isAddedRecently, setIsAddedRecently] = useState(false);

  const isFavorite = isInWishlist(product.id);
  const isPolaroid = product.category === 'polaroids';
  const isBundle = product.category === 'bundles';

  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const currentPrice = (product.price * selectedSize.priceMultiplier).toFixed(2);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    const defaultFinish = product.finishes ? product.finishes[0] : undefined;
    addToCart(product, selectedSize, defaultFinish, 1);
    setIsAddedRecently(true);
    setShowSizePicker(false);
    setTimeout(() => setIsAddedRecently(false), 2000);
  };

  return (
    <div
      onMouseLeave={() => {
        setShowSizePicker(false);
      }}
      onClick={() => navigate('product', { id: product.id })}
      className={`group cursor-pointer flex flex-col justify-between transition-all duration-300 ${
        isPolaroid
          ? 'polaroid-card rounded-md bg-studio-card border border-studio-border/80 hover:shadow-polaroid-hover hover:border-purple-500/80'
          : 'bg-studio-card rounded-2xl p-3 sm:p-4 border border-studio-border/80 shadow-sm hover:shadow-art-hover hover:-translate-y-1 hover:border-purple-500/80'
      }`}
    >
      {/* Top Image Container */}
      <div className="relative overflow-hidden rounded-xl bg-studio-sand/60 aspect-[4/5]">
        
        {/* Washi Tape for Polaroids */}
        {isPolaroid && <div className="washi-tape" />}

        {/* Card Image */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {product.isBestSeller && (
            <span className="bg-purple-950/90 text-purple-200 border border-purple-500/40 font-mono text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Bestseller
            </span>
          )}
          {discountPercent > 0 && (
            <span className="bg-studio-terracotta text-white font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              Save {discountPercent}%
            </span>
          )}
          {isBundle && (
            <span className="bg-studio-sage/20 text-purple-200 border border-purple-400/30 font-mono text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm">
              {product.bundleItemsCount} Art Pieces
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all duration-200 z-10 ${
            isFavorite
              ? 'bg-purple-600 text-white shadow-md scale-110'
              : 'bg-studio-card/80 text-white hover:bg-purple-600 hover:text-white border border-white/10 opacity-90 sm:opacity-0 group-hover:opacity-100'
          }`}
          aria-label="Save to wishlist"
        >
          <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        {/* Quick Add overlay button on desktop hover */}
        <div className="absolute bottom-3 inset-x-3 hidden sm:block transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
          {showSizePicker ? (
            <div 
              onClick={(e) => e.stopPropagation()} 
              className="bg-studio-dark/95 backdrop-blur-md text-white p-2 rounded-xl shadow-xl space-y-1.5 border border-white/20 animate-fadeIn"
            >
              <div className="text-[10px] font-mono text-neutral-300 px-1 uppercase tracking-wider">Select Size/Pack:</div>
              <div className="grid grid-cols-2 gap-1">
                {product.sizes.map((sz) => (
                  <button
                    key={sz.id}
                    onClick={() => {
                      setSelectedSize(sz);
                    }}
                    className={`text-[11px] py-1 px-2 rounded-md font-mono text-left truncate transition-colors ${
                      selectedSize.id === sz.id ? 'bg-studio-terracotta text-black font-bold' : 'bg-studio-sand hover:bg-white/10 text-purple-200'
                    }`}
                  >
                    {sz.name.split(' ')[0]} - ₹{(product.price * sz.priceMultiplier).toFixed(0)}
                  </button>
                ))}
              </div>
              <button
                onClick={handleQuickAdd}
                className="w-full bg-studio-terracotta text-black hover:bg-purple-400 font-display font-bold py-1.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
              >
                Confirm &amp; Add
              </button>
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSizePicker(true);
                }}
                className="flex-1 bg-studio-terracotta hover:bg-purple-400 text-black backdrop-blur-md py-2.5 px-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center justify-center gap-1.5 border border-purple-400/30"
              >
                {isAddedRecently ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-black stroke-[3]" />
                    <span className="text-black font-bold">Added!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                    <span className="text-black font-bold">Quick Add</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Card Info Details */}
      <div className="mt-3.5 flex flex-col justify-between flex-1">
        <div>
          {/* Aesthetic Tag & Rating */}
          <div className="flex items-center justify-between text-xs text-studio-muted font-mono mb-1">
            <span className="uppercase tracking-wider text-[11px] font-semibold text-purple-400">
              {product.theme}
            </span>
            <div className="flex items-center gap-1 text-amber-400 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-current" />
              <span>{product.rating.toFixed(1)}</span>
              <span className="text-studio-muted font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="font-display font-bold text-sm text-white group-hover:text-purple-400 transition-colors line-clamp-1">
            {product.name}
          </h3>

          <p className="text-xs text-studio-muted line-clamp-1 mt-0.5 font-normal">
            {product.shortDescription}
          </p>
        </div>

        {/* Price & Mobile Add Button */}
        <div className="mt-3 pt-2.5 border-t border-studio-border/60 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-mono font-bold text-base text-white">
                ₹{Math.round(Number(currentPrice))}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xs text-studio-muted line-through">
                  ₹{Math.round(product.originalPrice * selectedSize.priceMultiplier)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-purple-300/70 font-mono block -mt-0.5">
              {selectedSize.name.split(' ')[0]} format
            </span>
          </div>

          {/* Mobile Quick Add Button */}
          <button
            onClick={handleQuickAdd}
            className="sm:hidden p-2 bg-studio-terracotta text-black rounded-lg hover:bg-purple-400 transition-colors shadow-sm font-bold"
            aria-label="Add to bag"
          >
            <ShoppingBag className="w-4 h-4 text-black" />
          </button>
        </div>

      </div>
    </div>
  );
};
