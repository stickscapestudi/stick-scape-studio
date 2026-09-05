import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../context/ToastContext';
import { reviewService } from '../services/review.service';
import type { CustomerReview } from '../types';
import { 
  Star, 
  Send, 
  CheckCircle2, 
  Search, 
  MessageSquare, 
  Mail, 
  Phone, 
  Sparkles, 
  X, 
  RefreshCw, 
  Award, 
} from 'lucide-react';
import confetti from 'canvas-confetti';

const POPULAR_PRODUCTS = [
  'Customized Polaroids (Pack of 16)',
  'Customized Polaroids (Pack of 32)',
  'Customized Spotify Soundwave Polaroids',
  'Customized Wall Poster (A4 - 300 GSM)',
  'Customized Wall Poster (A3 - 350 GSM)',
  'Vintage Movie Poster Collection',
  'Anime & Aesthetic Poster Bundle',
  'Custom Album Art Cardstock Print',
];

export const ReviewsPage: React.FC = () => {
  const { addToast } = useToast();

  const [reviews, setReviews] = useState<CustomerReview[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<number | 'all'>('all');

  // Review Form State with all 6 required fields
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    mobile: '',
    productName: 'Customized Polaroids (Pack of 16)',
    customProductName: '',
    rating: 5,
    feedback: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hoverRating, setHoverRating] = useState<number>(0);


  // Fetch Reviews from Database / API
  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await reviewService.getReviews();
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // Handle Review Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalProduct = formData.productName === 'Other Custom Product' && formData.customProductName.trim()
      ? formData.customProductName.trim()
      : formData.productName;

    if (
      !formData.customerName.trim() ||
      !formData.email.trim() ||
      !formData.mobile.trim() ||
      !finalProduct.trim() ||
      !formData.feedback.trim()
    ) {
      addToast({
        title: 'Missing Details',
        message: 'Please fill in Customer Name, Mail ID, Mobile Number, Product Name, and Feedback.',
        type: 'info',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: formData.customerName.trim(),
        email: formData.email.trim(),
        mobile: formData.mobile.trim(),
        productName: finalProduct,
        rating: formData.rating,
        feedback: formData.feedback.trim(),
      };

      const newRev = await reviewService.submitReview(payload);
      setReviews((prev) => [newRev, ...prev]);

      // Trigger Celebration Confetti

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      addToast({
        title: 'Review Submitted! ⭐',
        message: 'Thank you for your valuable feedback. Your review is now live!',
        type: 'success',
      });

      // Reset form
      setFormData({
        customerName: '',
        email: '',
        mobile: '',
        productName: 'Customized Polaroids (Pack of 16)',
        customProductName: '',
        rating: 5,
        feedback: '',
      });
    } catch (err: any) {
      addToast({
        title: 'Submission Failed',
        message: err.message || 'Unable to submit review. Please try again.',
        type: 'info',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered reviews
  const filteredReviews = reviews.filter((rev) => {
    const matchesRating = selectedRatingFilter === 'all' || (rev.rating || 5) === selectedRatingFilter;
    if (!matchesRating) return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = (rev.customerName || rev.author || '').toLowerCase();
    const email = (rev.email || '').toLowerCase();
    const mobile = (rev.mobile || '').toLowerCase();
    const prod = (rev.productName || rev.productTitle || '').toLowerCase();
    const feedback = (rev.feedback || rev.comment || '').toLowerCase();

    return name.includes(q) || email.includes(q) || mobile.includes(q) || prod.includes(q) || feedback.includes(q);
  });

  // Calculate Average Rating
  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 animate-fadeIn">
      
      {/* 1. Page Header & Live Rating Banner */}
      <div className="bg-gradient-to-r from-purple-950/80 via-studio-card to-purple-950/80 rounded-3xl p-8 sm:p-12 border border-purple-500/40 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-purple-300 uppercase font-bold tracking-wider bg-purple-900/60 px-3 py-1 rounded-full border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5 text-studio-terracotta" /> Verified Collector Reviews &amp; Feedback
            </div>
            <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight">
              Customer Reviews &amp; Feedback
            </h1>
            <p className="text-sm text-studio-muted leading-relaxed">
              Read real feedback from art lovers who customized their Polaroid packs, room posters, and soundwave cards with Stick Scape Studio.
            </p>
          </div>

          {/* Quick Rating Score Card */}
          <div className="bg-black/60 backdrop-blur-md p-6 rounded-3xl border border-purple-500/40 flex items-center gap-6 shadow-xl flex-shrink-0">
            <div className="text-center">
              <div className="font-display font-black text-4xl sm:text-5xl text-white">
                {averageRating}
              </div>
              <div className="flex items-center justify-center gap-1 text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-[11px] font-mono text-studio-muted block mt-1">
                Out of 5.0 Stars
              </span>
            </div>

            <div className="h-14 w-px bg-studio-border" />

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <Award className="w-4 h-4 text-studio-terracotta" />
                <span>100% Archival Matte</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{reviews.length} Verified Reviews</span>
              </div>
              <span className="text-[10px] font-mono text-purple-300 block">
                Top Rated Across India 🇮🇳
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Review Submission Form Section */}
      <div className="bg-studio-card rounded-3xl p-6 sm:p-10 border border-purple-500/40 shadow-2xl relative overflow-hidden">
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-studio-terracotta/20 border border-studio-terracotta/40 text-studio-terracotta mb-1">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
              Write Your Feedback &amp; Review
            </h2>
            <p className="text-xs sm:text-sm text-studio-muted font-mono max-w-xl mx-auto">
              Please share your name, mail ID, mobile number, the product you purchased, your star rating, and your feedback.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            
            {/* Row 1: Customer Name & Mail ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                  <span>Customer Name</span>
                  <span className="text-studio-terracotta">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="e.g. Sri Nikesh .T"
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                  <span>Mail ID</span>
                  <span className="text-studio-terracotta">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. customer@gmail.com"
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Mobile Number & Product Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                  <span>Mobile Number</span>
                  <span className="text-studio-terracotta">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                  <span>Product Name</span>
                  <span className="text-studio-terracotta">*</span>
                </label>
                <select
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-studio-terracotta font-mono transition-colors"
                >
                  {POPULAR_PRODUCTS.map((prod) => (
                    <option key={prod} value={prod} className="bg-studio-card text-white">
                      {prod}
                    </option>
                  ))}
                  <option value="Other Custom Product" className="bg-studio-card text-white">
                    Other Custom Product...
                  </option>
                </select>
              </div>
            </div>

            {/* Optional Custom Product Name if "Other" Selected */}
            {formData.productName === 'Other Custom Product' && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-mono font-bold uppercase text-purple-200">
                  Custom Product Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.customProductName}
                  onChange={(e) => setFormData({ ...formData, customProductName: e.target.value })}
                  placeholder="Enter custom product name..."
                  className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
                />
              </div>
            )}

            {/* Row 3: Interactive Star Rating */}
            <div className="bg-studio-sand/70 p-4 rounded-2xl border border-studio-border space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                  <span>Star Rating</span>
                  <span className="text-studio-terracotta">*</span>
                </label>
                <span className="text-xs font-mono font-bold text-amber-300">
                  {formData.rating === 5 ? '5 Stars — Excellent! 🌟' : `${formData.rating} of 5 Stars`}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                    title={`Rate ${star} star(s)`}
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= (hoverRating || formData.rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-neutral-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Row 4: Customer Feedback */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-purple-200 flex items-center gap-1.5">
                <span>Customer Feedback</span>
                <span className="text-studio-terracotta">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.feedback}
                onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                placeholder="Tell us what you loved about your order (print quality, paper thickness, fast shipping, packaging, etc.)..."
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono resize-none transition-colors"
              />
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-4 rounded-2xl font-display font-bold text-sm uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-xl flex items-center justify-center gap-2 group disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Submitting Feedback...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4 text-black group-hover:translate-x-1 transition-transform" />
                  <span>Submit Customer Review &amp; Feedback</span>
                </>
              )}
            </button>

          </form>

        </div>
      </div>

      {/* 3. Community Reviews Showcase */}
      <div className="space-y-6">
        
        {/* Controls: Search & Rating Filter Pills */}
        <div className="bg-studio-card rounded-2xl p-4 sm:p-5 border border-studio-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Rating Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setSelectedRatingFilter('all')}
              className={`text-xs font-mono px-3.5 py-2 rounded-xl transition-all ${
                selectedRatingFilter === 'all'
                  ? 'bg-studio-terracotta text-black font-bold shadow-md'
                  : 'bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border'
              }`}
            >
              All Reviews ({reviews.length})
            </button>

            {[5, 4, 3, 2, 1].map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRatingFilter(r)}
                className={`text-xs font-mono px-3 py-2 rounded-xl transition-all flex items-center gap-1 ${
                  selectedRatingFilter === r
                    ? 'bg-studio-terracotta text-black font-bold shadow-md'
                    : 'bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border'
                }`}
              >
                <span>{r}</span>
                <Star className="w-3 h-3 fill-current" />
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Search reviews by name, product..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-studio-sand border border-studio-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
            />
            <Search className="w-4 h-4 text-studio-muted absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Reviews Cards List */}
        {isLoading ? (
          <div className="py-16 text-center text-purple-300 font-mono space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-studio-terracotta" />
            <div>Loading verified collector reviews...</div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="py-16 text-center bg-studio-card rounded-3xl border border-studio-border p-8 space-y-2">
            <div className="text-3xl">💬</div>
            <h3 className="font-display font-bold text-lg text-white">No reviews found</h3>
            <p className="text-xs text-studio-muted font-mono">
              Be the first to leave feedback for this rating or search term above!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev) => {
              const author = rev.customerName || rev.author || 'Verified Collector';
              const email = rev.email || 'customer@stickscape.com';
              const mobile = rev.mobile || '9876543210';
              const product = rev.productName || rev.productTitle || 'Customized Polaroids';
              const rating = rev.rating || 5;
              const feedback = rev.feedback || rev.comment || '';

              return (
                <div
                  key={rev.id}
                  className="bg-studio-card rounded-3xl p-6 sm:p-7 border border-studio-border hover:border-purple-500/50 transition-all duration-300 shadow-xl flex flex-col justify-between space-y-5 group"
                >
                  <div className="space-y-4">
                    
                    {/* Top: Star Rating & Verified Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400 bg-black/40 px-3 py-1 rounded-xl border border-amber-500/30">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-600'}`}
                          />
                        ))}
                        <span className="text-xs font-mono font-bold text-amber-300 ml-1">
                          {rating}.0
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </div>

                    {/* Product Name Tag */}
                    <div className="inline-block bg-purple-950/70 text-purple-200 border border-purple-500/30 px-3 py-1 rounded-lg text-xs font-mono font-bold">
                      📦 {product}
                    </div>

                    {/* Feedback Text */}
                    <p className="text-xs sm:text-sm text-white leading-relaxed italic bg-studio-sand/40 p-4 rounded-2xl border border-white/5 font-mono">
                      "{feedback}"
                    </p>
                  </div>

                  {/* Customer Information Footer */}
                  <div className="pt-4 border-t border-studio-border space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-purple-950 border border-purple-500/40 text-purple-300 font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {author.charAt(0)}
                        </div>
                        <span className="font-bold text-white text-sm">{author}</span>
                      </div>
                    </div>

                    {/* Mail ID */}
                    <div className="flex items-center gap-2 text-studio-muted text-[11px] truncate">
                      <Mail className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="truncate">{email}</span>
                    </div>

                    {/* Mobile Number */}
                    <div className="flex items-center justify-between text-studio-muted text-[11px]">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>+91 {mobile}</span>
                      </div>
                      <a
                        href={`https://wa.me/91${mobile}?text=${encodeURIComponent(`Hi ${author}, thank you for your review on Stick Scape Studio!`)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-studio-terracotta hover:underline font-bold"
                      >
                        WhatsApp
                      </a>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};
