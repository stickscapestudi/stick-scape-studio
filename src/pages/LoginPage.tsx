import React, { useState } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  MapPin,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, loginWithGoogle, isLoggedIn, customer } = useCustomerAuth();
  const { navigate, params } = useNavigation();
  const { addToast } = useToast();

  const [mode, setMode] = useState<'login' | 'register'>(
    params.mode === 'register' ? 'register' : 'login'
  );

  // Form Fields State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [showExtraAddress, setShowExtraAddress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already logged in, show logged-in welcome banner with button to go to Account or Shop
  if (isLoggedIn && customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-studio-card border border-studio-border rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-6 animate-fadeIn">
          <div className="w-20 h-20 mx-auto rounded-full bg-studio-terracotta flex items-center justify-center text-white text-3xl font-display font-black shadow-lg shadow-purple-500/20">
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

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Logged In
            </span>
            <h2 className="text-2xl font-display font-black text-studio-charcoal">
              Welcome back, <span className="text-purple-400">{customer.name}</span>!
            </h2>
            <p className="text-xs text-studio-muted font-mono">{customer.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => navigate('account')}
              className="py-3 px-4 rounded-xl bg-studio-sand hover:bg-studio-terracotta hover:text-white border border-studio-border text-studio-charcoal font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md"
            >
              My Account
            </button>
            <button
              onClick={() => navigate('shop')}
              className="py-3 px-4 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shop Art</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Handle Standard Email & Password Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        if (!email.trim() || !password) {
          throw new Error('Please enter both email and password.');
        }
        await login(email.trim(), password);
        addToast({
          title: 'Welcome Back! 🎨',
          message: 'You have signed in to your Stick Scape account.',
          type: 'success',
        });
      } else {
        if (!name.trim() || !email.trim() || !password) {
          throw new Error('Please provide your name, email, and password.');
        }
        if (password.length < 6) {
          throw new Error('Password must be at least 6 characters long.');
        }
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          city: city.trim() || undefined,
          state: state.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
        });
        addToast({
          title: 'Account Created! 🚀',
          message: 'Welcome to Stick Scape Studio. Your shipping details are saved!',
          type: 'success',
        });
      }

      // Redirect to target redirect route (e.g. checkout or account)
      const targetPage = params.redirect === 'checkout' ? 'checkout' : 'account';
      navigate(targetPage as any);
    } catch (err: any) {
      setFormError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Google Sign-In (Interactive Google Login Modal & Simulation)
  const handleGoogleSignIn = async () => {
    setFormError(null);
    setIsSubmitting(true);

    try {
      // Prompt user for Google email address
      const promptEmail = prompt(
        'Sign in with Google Account:\nEnter your Google Email Address:',
        email || ''
      );

      if (!promptEmail || !promptEmail.trim()) {
        setIsSubmitting(false);
        return;
      }

      const googleEmail = promptEmail.trim();
      const googleName = googleEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
      const mockGoogleId = `google_sub_${Math.abs(
        googleEmail.split('').reduce((a, b) => (a << 5) - a + b.charCodeAt(0), 0)
      )}`;

      await loginWithGoogle({
        googleId: mockGoogleId,
        email: googleEmail,
        name: googleName || 'Google Collector',
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          googleName
        )}&backgroundColor=9333ea,ffffff`,
      });

      addToast({
        title: 'Signed in with Google! 🌐',
        message: `Welcome ${googleName}! Your Google account is connected.`,
        type: 'success',
      });

      const targetPage = params.redirect === 'checkout' ? 'checkout' : 'account';
      navigate(targetPage as any);
    } catch (err: any) {
      setFormError(err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-tr from-purple-600/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Main Studio Card */}
      <div className="max-w-md w-full bg-studio-card border border-studio-border rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl space-y-6 animate-fadeIn">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-950/60 border border-purple-500/30 text-purple-400 mb-1">
            <Sparkles className="w-6 h-6 text-purple-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-studio-charcoal tracking-tight">
            {mode === 'login' ? (
              <>Customer <span className="text-purple-400">Sign In</span></>
            ) : (
              <>Join the <span className="text-purple-400">Studio Club</span></>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-studio-muted font-mono">
            {mode === 'login'
              ? 'Access saved addresses, past orders, and express checkout.'
              : 'Save your delivery address and receive VIP drop perks.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-studio-sand/80 rounded-2xl border border-studio-border text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setFormError(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'login'
                ? 'bg-studio-terracotta text-white shadow-md font-bold'
                : 'text-studio-muted hover:text-studio-charcoal'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setFormError(null);
            }}
            className={`py-2.5 rounded-xl transition-all ${
              mode === 'register'
                ? 'bg-studio-terracotta text-white shadow-md font-bold'
                : 'text-studio-muted hover:text-studio-charcoal'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Google SSO Button */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-white hover:bg-zinc-100 text-zinc-900 rounded-2xl font-display font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] border border-zinc-200"
          >
            {/* Google Multicolored SVG Icon */}
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-studio-border w-full" />
          <span className="bg-studio-card px-3 text-[11px] font-mono uppercase text-studio-muted tracking-widest absolute">
            Or with email
          </span>
        </div>

        {/* Error Alert */}
        {formError && (
          <div className="p-3.5 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono flex items-start gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{formError}</span>
          </div>
        )}

        {/* Standard Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Register Mode Only) */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-purple-300">
                Your Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-studio-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/60 text-sm focus:outline-none focus:border-studio-terracotta transition-colors font-mono"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-purple-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-studio-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                autoComplete="off"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/60 text-sm focus:outline-none focus:border-studio-terracotta transition-colors font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-mono font-bold uppercase text-purple-300">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-[11px] text-studio-muted font-mono hover:text-purple-300 cursor-pointer">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-studio-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'register' ? 'At least 6 characters' : '••••••••'}
                autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/60 text-sm focus:outline-none focus:border-studio-terracotta transition-colors font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-studio-muted hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Optional Shipping Details Expander (Register Mode Only) */}
          {mode === 'register' && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowExtraAddress(!showExtraAddress)}
                className="text-xs text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1.5 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>
                  {showExtraAddress
                    ? '− Hide saved shipping details'
                    : '+ Save delivery address now (Optional)'}
                </span>
              </button>

              {showExtraAddress && (
                <div className="mt-3 space-y-3 p-3.5 rounded-2xl bg-studio-sand/60 border border-purple-500/20 text-xs font-mono animate-fadeIn">
                  <div>
                    <label className="text-[11px] text-studio-muted block mb-1">
                      Phone Number (for Courier updates)
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-studio-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="9876543210"
                        className="w-full pl-9 pr-3 py-2 rounded-lg bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/50 text-xs focus:outline-none focus:border-studio-terracotta"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] text-studio-muted block mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House/Flat No, Street Name"
                      className="w-full px-3 py-2 rounded-lg bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/50 text-xs focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[11px] text-studio-muted block mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Chennai"
                        className="w-full px-2.5 py-2 rounded-lg bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/50 text-xs focus:outline-none focus:border-studio-terracotta"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-studio-muted block mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="Tamil Nadu"
                        className="w-full px-2.5 py-2 rounded-lg bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/50 text-xs focus:outline-none focus:border-studio-terracotta"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-studio-muted block mb-1">Pincode</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="600001"
                        className="w-full px-2.5 py-2 rounded-lg bg-studio-sand border border-studio-border text-studio-charcoal placeholder-studio-muted/50 text-xs focus:outline-none focus:border-studio-terracotta"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-studio-terracotta hover:bg-studio-terracottaHover text-white rounded-2xl font-display font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2 text-white">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Account' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Privacy Footer & Admin Portal Link */}
        <div className="pt-2 text-center text-[11px] text-studio-muted font-mono space-y-2">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted &amp; Secure Authentication</span>
          </div>

          <div className="pt-2 border-t border-studio-border/70">
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="text-xs text-purple-400 hover:text-white font-mono flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <span>Store Manager or Staff?</span>
              <strong className="underline text-studio-terracotta">Open Admin Portal &rarr;</strong>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
