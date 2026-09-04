import React, { useState, useEffect } from 'react';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { customerAuthService } from '../services/customer-auth.service';
import {
  User,
  MapPin,
  Package,
  LogOut,
  Phone,
  Edit2,
  Save,
  Clock,
  CheckCircle,
  Truck,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { customer, updateProfile, logout, isLoggedIn } = useCustomerAuth();
  const { navigate } = useNavigation();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Editable Profile State
  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [apartment, setApartment] = useState(customer?.apartment || '');
  const [city, setCity] = useState(customer?.city || '');
  const [state, setState] = useState(customer?.state || '');
  const [postalCode, setPostalCode] = useState(customer?.postalCode || '');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // Sync state if customer changes
  useEffect(() => {
    if (customer) {
      setName(customer.name || '');
      setPhone(customer.phone || '');
      setAddress(customer.address || '');
      setApartment(customer.apartment || '');
      setCity(customer.city || '');
      setState(customer.state || '');
      setPostalCode(customer.postalCode || '');
    }
  }, [customer]);

  // Fetch customer orders on mount
  useEffect(() => {
    if (isLoggedIn) {
      setIsLoadingOrders(true);
      customerAuthService
        .getCustomerOrders()
        .then((data) => setOrders(data))
        .catch(() => {})
        .finally(() => setIsLoadingOrders(false));
    }
  }, [isLoggedIn]);

  if (!isLoggedIn || !customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-studio-card border border-studio-border rounded-3xl p-8 backdrop-blur-xl shadow-2xl text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-studio-sand border border-studio-border flex items-center justify-center text-studio-terracotta shadow-md">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-display font-black text-studio-charcoal">Sign In to Your <span className="text-purple-400">Account</span></h2>
          <p className="text-xs text-studio-muted font-mono">
            Log in to manage saved shipping addresses, view past orders, and enjoy faster checkout.
          </p>
          <button
            onClick={() => navigate('login')}
            className="w-full py-3 px-4 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Handle Profile Update
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || null,
        address: address.trim() || null,
        apartment: apartment.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        postalCode: postalCode.trim() || null,
      });
      setIsEditing(false);
      addToast({
        title: 'Address & Profile Saved! ✅',
        message: 'Your shipping address will be automatically pre-filled at checkout.',
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Update Failed',
        message: err.message || 'Could not update profile.',
        type: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Delivered
          </span>
        );
      case 'Shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Truck className="w-3 h-3" /> In Transit
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Clock className="w-3 h-3" /> Printing & Curing
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-400/20 text-purple-300 border border-purple-400/40">
            Pending Dispatch
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-fadeIn">
      {/* Top Profile Header Bar */}
      <div className="bg-studio-card border border-studio-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-studio-terracotta flex items-center justify-center text-white text-2xl font-display font-black shadow-lg shadow-purple-500/20 flex-shrink-0">
            {customer.avatarUrl ? (
              <img
                src={customer.avatarUrl}
                alt={customer.name}
                className="w-full h-full rounded-2xl object-cover"
              />
            ) : (
              customer.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-display font-black text-studio-charcoal">
                {customer.name}
              </h1>
              {customer.authProvider === 'GOOGLE' && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white text-black">
                  Google
                </span>
              )}
            </div>
            <p className="text-xs text-studio-muted font-mono">{customer.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => navigate('shop')}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Shop New Art</span>
          </button>

          <button
            onClick={() => {
              logout();
              addToast({
                title: 'Signed Out',
                message: 'You have been signed out of your account.',
                type: 'info',
              });
              navigate('home');
            }}
            className="p-2.5 rounded-xl bg-studio-sand border border-studio-border hover:bg-red-950/40 text-studio-muted hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-studio-border pb-2 font-mono text-xs font-bold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'bg-studio-terracotta text-white font-bold shadow-md'
              : 'text-studio-muted hover:text-studio-charcoal bg-studio-sand border border-studio-border'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Address &amp; Profile</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`py-2.5 px-5 rounded-xl transition-all flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-studio-terracotta text-white font-bold shadow-md'
              : 'text-studio-muted hover:text-studio-charcoal bg-studio-sand border border-studio-border'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>My Orders ({orders.length})</span>
        </button>
      </div>

      {/* Tab 1: Profile & Saved Shipping Address */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
          <div className="lg:col-span-2 bg-studio-card border border-studio-border rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-display font-bold text-studio-charcoal flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-purple-400" />
                  <span>Default <span className="text-purple-400">Shipping</span> Address</span>
                </h3>
                <p className="text-xs text-studio-muted font-mono mt-0.5">
                  Pre-filled automatically whenever you checkout.
                </p>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="py-1.5 px-3 rounded-lg bg-studio-sand hover:bg-studio-terracotta hover:text-white border border-studio-border text-purple-300 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Address</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-purple-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-purple-300">
                      Phone Number (for Courier SMS)
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono font-bold uppercase text-purple-300">
                    Street Address / House No.
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 42 Beach Road"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-purple-300">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Chennai"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-purple-300">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-mono font-bold uppercase text-purple-300">
                      Postal Code / PIN
                    </label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 600001"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-studio-sand border border-studio-border text-studio-charcoal text-xs font-mono focus:outline-none focus:border-studio-terracotta"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="py-2.5 px-5 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="py-2.5 px-4 rounded-xl bg-studio-sand border border-studio-border text-studio-muted hover:text-white font-mono text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-5 rounded-2xl bg-studio-sand/60 border border-studio-border space-y-3 font-mono text-xs">
                {customer.address || customer.city ? (
                  <>
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <User className="w-4 h-4 text-purple-400" />
                      <span>{customer.name}</span>
                    </div>
                    <div className="flex items-start gap-2 text-studio-muted">
                      <MapPin className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                      <span className="text-studio-charcoal">
                        {[customer.address, customer.city, customer.state, customer.postalCode]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    </div>
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-studio-muted">
                        <Phone className="w-4 h-4 text-emerald-400" />
                        <span className="text-studio-charcoal">+91 {customer.phone}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-studio-muted">No default shipping address saved yet.</p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-purple-400 font-bold hover:underline"
                    >
                      + Click here to add your shipping address
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Account Security & Info Panel */}
          <div className="bg-studio-card border border-studio-border rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4 font-mono text-xs">
            <h4 className="text-sm font-display font-bold text-studio-charcoal uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Account <span className="text-purple-400">Security</span></span>
            </h4>

            <div className="space-y-2.5 text-studio-muted">
              <div className="flex justify-between pb-2 border-b border-studio-border/60">
                <span>Account Type:</span>
                <span className="text-white font-bold">{customer.authProvider || 'Email'}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-studio-border/60">
                <span>Primary Email:</span>
                <span className="text-white truncate max-w-[150px]">{customer.email}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-studio-border/60">
                <span>Delivery Guarantee:</span>
                <span className="text-emerald-400 font-bold">100% Free Replacements</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-studio-sand border border-studio-border text-[11px] text-studio-muted">
              💡 <strong className="text-purple-300">Pro Tip:</strong> Orders above <span className="text-purple-300 font-bold">₹499</span> qualify for Free Priority Courier dispatch.
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders History */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-fadeIn">
          {isLoadingOrders ? (
            <div className="py-16 text-center text-studio-muted font-mono text-xs flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-studio-terracotta border-t-transparent rounded-full animate-spin" />
              <span>Loading your orders...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-studio-card border border-studio-border rounded-3xl p-12 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-studio-sand border border-studio-border flex items-center justify-center text-studio-muted">
                <ShoppingBag className="w-8 h-8 text-studio-terracotta" />
              </div>
              <h3 className="text-lg font-display font-bold text-studio-charcoal">No Orders Found Yet</h3>
              <p className="text-xs text-studio-muted font-mono max-w-sm mx-auto">
                Explore our curated Tamil cinema posters, aesthetic Polaroids, and room bundles to
                place your first order!
              </p>
              <button
                onClick={() => navigate('shop')}
                className="py-3 px-6 rounded-xl bg-studio-terracotta hover:bg-studio-terracottaHover text-white font-display font-black text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Browse Art Catalog
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((ord: any) => (
                <div
                  key={ord.id}
                  className="bg-studio-card border border-studio-border hover:border-studio-terracotta rounded-3xl p-5 sm:p-6 transition-all backdrop-blur-xl shadow-lg space-y-4"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-studio-border/60">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-mono font-bold text-studio-terracotta">
                          #{ord.orderNumber}
                        </span>
                        {getStatusBadge(ord.status)}
                      </div>
                      <p className="text-[11px] text-studio-muted font-mono">
                        Placed on{' '}
                        {new Date(ord.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-white font-mono">
                        ₹{Number(ord.totalAmount)}
                      </span>
                      <button
                        onClick={() =>
                          navigate('track-order', {
                            orderNumber: ord.orderNumber,
                            mobile: ord.mobile,
                          })
                        }
                        className="py-1.5 px-3 rounded-lg bg-studio-sand hover:bg-studio-terracotta hover:text-white border border-studio-border text-purple-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
                      >
                        <span>Live Tracking</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2">
                    {ord.items?.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-xs font-mono text-studio-muted"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-studio-terracotta" />
                          <span className="text-studio-charcoal">{item.productName}</span>
                          <span>× {item.quantity}</span>
                        </div>
                        <span className="text-purple-300 font-bold">₹{Number(item.lineTotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Shipping Address Summary */}
                  <div className="pt-2 text-[11px] font-mono text-studio-muted flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-studio-terracotta" />
                    <span>
                      Shipping to: <strong className="text-studio-charcoal">{ord.customerName}</strong>, {ord.city} ({ord.postalCode})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
