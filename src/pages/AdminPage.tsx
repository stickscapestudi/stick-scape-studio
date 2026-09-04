import React, { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/order.service';
import { adminService, type DashboardStats } from '../services/admin.service';
import { ADMIN_MOBILE } from '../config/env';
import type { OrderConfirmationData, OrderStatus } from '../types';
import { 
  Package, 
  Search, 
  Clock, 
  Truck, 
  Phone, 
  MapPin, 
  DollarSign, 
  Bell,
  Printer,
  ShieldCheck,
  Send,
  X,
  RefreshCw,
  AlertTriangle,
  Lock,
  LogOut,
  KeyRound,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Camera,
  Download,
  ExternalLink,
  Eye,
  Music,
  Type,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { navigate } = useNavigation();
  const { addToast } = useToast();
  const { user, isAuthenticated, login, logout, isLoading: authLoading } = useAuth();

  // Login Form State
  const [loginEmail, setLoginEmail] = useState<string>('admin@stickscape.com');
  const [loginPassword, setLoginPassword] = useState<string>('AdminPass123!');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingLogin, setIsSubmittingLogin] = useState<boolean>(false);

  // Live Stats State
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Dashboard Orders & Pagination State
  const [orders, setOrders] = useState<OrderConfirmationData[]>([]);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState<number>(0);

  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedOrderModal, setSelectedOrderModal] = useState<OrderConfirmationData | null>(null);

  // Photo Gallery Inspector Modal State for Studio Printing Access
  const [viewingPhotoGallery, setViewingPhotoGallery] = useState<{
    orderId: string;
    customerName: string;
    item: any;
    photos: string[];
    caption?: string;
    songUrl?: string;
  } | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState<number>(0);

  const downloadSinglePhoto = (imgUrl: string, filename: string) => {
    try {
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      window.open(imgUrl, '_blank');
    }
  };

  const downloadAllPhotos = (photos: string[], orderId: string) => {
    photos.forEach((url, idx) => {
      setTimeout(() => {
        downloadSinglePhoto(url, `Order_${orderId}_Polaroid_Photo_${idx + 1}.jpg`);
      }, idx * 250);
    });
    addToast({
      title: 'Downloading Customer Photos 📸',
      message: `Started batch download of ${photos.length} photo(s) for Order #${orderId}.`,
      type: 'success',
    });
  };

  // Handle Admin Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingLogin(true);

    try {
      await login(loginEmail, loginPassword);
      addToast({
        title: 'Welcome Back, Admin! 🛡️',
        message: 'Authenticated session started successfully.',
        type: 'success',
      });
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
      addToast({
        title: 'Authentication Failed 🔒',
        message: err.message || 'Invalid email or password',
        type: 'info',
      });
    } finally {
      setIsSubmittingLogin(false);
    }
  };

  // Fetch Live Stats from Backend
  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load dashboard stats:', err);
      setStatsError(err.message || 'Failed to calculate stats from server.');
    } finally {
      setIsLoadingStats(false);
    }
  }, [isAuthenticated]);

  // Fetch Paginated Orders from Backend
  const fetchOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoadingOrders(true);
    setOrdersError(null);
    try {
      const result = await orderService.getOrders({
        page,
        limit,
        search: searchQuery,
        status: selectedStatusFilter,
      });
      setOrders(result.orders);
      setTotalPages(result.pagination.totalPages);
      setTotalOrdersCount(result.pagination.total);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setOrdersError(err.message || 'Unable to connect to backend server.');
    } finally {
      setIsLoadingOrders(false);
    }
  }, [isAuthenticated, page, limit, searchQuery, selectedStatusFilter]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
      fetchOrders();
    }
  }, [isAuthenticated, fetchStats, fetchOrders]);

  // Reset page to 1 when filters change
  const handleFilterChange = (status: string) => {
    setSelectedStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? { ...o, status: updatedOrder.status } : o))
      );
      // Refresh stats after status update
      fetchStats();
      addToast({
        title: 'Order Status Updated! 📦',
        message: `Order #${orderId} set to ${newStatus}.`,
        type: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Status Update Failed',
        message: err.message || 'Failed to update order status on server.',
        type: 'info',
      });
    }
  };

  const triggerTestSmsNotification = () => {
    const msg = `⚡ *NEW ORDER RECEIVED - STICK SCAPE STUDIO*\n\n📦 Order ID: SSS-894210\n👤 Customer: Demo User\n📞 Admin Phone: +91 ${ADMIN_MOBILE}\n💰 Total Amount: ₹799.00\n📍 City: Chennai, TN\n\nDispatch pending in Admin Portal.`;
    const encoded = encodeURIComponent(msg);
    const whatsappUrl = `https://wa.me/91${ADMIN_MOBILE}?text=${encoded}`;
    
    window.open(whatsappUrl, '_blank');

    addToast({
      title: `WhatsApp Link Opened (+91 ${ADMIN_MOBILE}) 📱`,
      message: 'Manual notification draft generated.',
      type: 'success',
    });
  };

  const getStatusBadgeStyle = (status?: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
      case 'Processing':
        return 'bg-purple-950/80 text-purple-300 border-purple-500/40';
      case 'Shipped':
        return 'bg-sky-950/80 text-sky-300 border-sky-500/40';
      case 'Delivered':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40';
      case 'Cancelled':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/40';
      default:
        return 'bg-amber-950/80 text-amber-300 border-amber-500/40';
    }
  };

  // Render Login UI Screen when Unauthenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 animate-fadeIn">
        <div className="bg-studio-card rounded-3xl p-8 border border-purple-500/40 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-400/50 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-6 h-6 text-studio-terracotta" />
            </div>
            <h2 className="font-display font-black text-2xl text-white">Admin Authentication</h2>
            <p className="text-xs text-studio-muted font-mono">
              Sign in with your verified master credentials to access store dispatch and order management.
            </p>
          </div>

          {loginError && (
            <div className="bg-rose-950/80 border border-rose-500/50 text-rose-200 p-3.5 rounded-2xl text-xs font-mono flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-purple-200">Admin Email Address</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="admin@stickscape.com"
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-purple-200">Master Password</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-studio-sand border border-studio-border rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingLogin || authLoading}
              className="w-full bg-studio-terracotta hover:bg-purple-400 text-black py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg flex items-center justify-center gap-2 group disabled:opacity-75"
            >
              {isSubmittingLogin || authLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  Verifying JWT Credentials...
                </span>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-black" />
                  <span>Authenticate &amp; Open Portal</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginEmail('admin@stickscape.com');
                setLoginPassword('AdminPass123!');
                login('admin@stickscape.com', 'AdminPass123!')
                  .then(() => {
                    addToast({
                      title: 'Welcome Back, Admin! 🛡️',
                      message: 'Authenticated session started successfully.',
                      type: 'success',
                    });
                  })
                  .catch((err) => {
                    setLoginError(err.message || 'Login failed');
                  });
              }}
              disabled={isSubmittingLogin || authLoading}
              className="w-full py-2.5 px-4 bg-purple-950/60 hover:bg-purple-900 border border-purple-500/40 text-purple-300 hover:text-white rounded-xl text-xs font-mono transition-colors flex items-center justify-center gap-2"
            >
              <span>⚡ 1-Click Quick Admin Sign-In</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <button
              onClick={() => navigate('shop')}
              className="text-xs font-mono text-purple-400 hover:text-white transition-colors"
            >
              ← Return to Public Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render Authenticated Admin Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-studio-border">
        <div>
          <div className="flex items-center gap-2 font-mono text-xs text-purple-400 font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" /> Store Management Portal &bull; Logged in as <strong className="text-white font-mono">{user?.email}</strong>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-4xl text-white mt-1">
            Admin Orders &amp; Dispatch Hub
          </h1>
          <p className="text-xs text-studio-muted mt-1 font-mono">
            Manage incoming poster dispatches, status tracking, and instant mobile alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              fetchStats();
              fetchOrders();
            }}
            disabled={isLoadingOrders || isLoadingStats}
            className="px-3.5 py-2.5 bg-studio-sand hover:bg-studio-terracotta hover:text-black border border-studio-border text-purple-200 text-xs font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingOrders || isLoadingStats ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-500/50 text-rose-300 hover:text-white text-xs font-mono font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Mobile Alert Notification Card */}
      <div className="bg-gradient-to-r from-purple-950/90 via-studio-card to-purple-950/90 rounded-3xl p-6 sm:p-8 border border-purple-500/40 shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-purple-600/30 text-purple-300 rounded-2xl border border-purple-500/50 flex-shrink-0 animate-pulse">
            <Bell className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-lg text-white">
                Admin Mobile Alert Dispatch
              </span>
              <span className="bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-studio-muted max-w-xl leading-relaxed">
              Target admin phone number: <strong className="text-white font-mono bg-purple-950 px-2 py-0.5 rounded border border-purple-500/30">+91 {ADMIN_MOBILE}</strong>.
            </p>
          </div>
        </div>

        <button
          onClick={triggerTestSmsNotification}
          className="bg-studio-terracotta hover:bg-purple-400 text-black px-6 py-3 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition-all duration-300 transform active:scale-95 shadow-lg flex items-center gap-2 flex-shrink-0"
        >
          <Send className="w-4 h-4 text-black" />
          <span>Manual WhatsApp Draft (+91 {ADMIN_MOBILE})</span>
        </button>
      </div>

      {/* KPI Overview Cards (Powered by GET /api/admin/dashboard/stats) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        
        {/* Total Revenue */}
        <div className="bg-studio-card rounded-2xl p-4 border border-studio-border shadow-sm space-y-1.5 col-span-2 sm:col-span-1 lg:col-span-2">
          <div className="flex items-center justify-between text-studio-muted text-[11px] font-mono">
            <span>TOTAL REVENUE</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {isLoadingStats ? (
              <span className="text-neutral-500 animate-pulse">₹...</span>
            ) : (
              `₹${(stats?.totalRevenue || 0).toLocaleString()}`
            )}
          </div>
          <p className="text-[10px] text-emerald-400 font-mono">Excludes Cancelled Orders</p>
        </div>

        {/* Total Orders */}
        <div className="bg-studio-card rounded-2xl p-4 border border-studio-border shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-studio-muted text-[11px] font-mono">
            <span>TOTAL ORDERS</span>
            <Package className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-mono font-black text-2xl text-white">
            {isLoadingStats ? '...' : stats?.totalOrders || 0}
          </div>
          <p className="text-[10px] text-purple-300 font-mono">All DB Records</p>
        </div>

        {/* Pending Orders */}
        <div className="bg-studio-card rounded-2xl p-4 border border-studio-border shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-studio-muted text-[11px] font-mono">
            <span>PENDING</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-mono font-black text-2xl text-amber-300">
            {isLoadingStats ? '...' : stats?.pendingOrders || 0}
          </div>
          <p className="text-[10px] text-amber-400/80 font-mono">Action Required</p>
        </div>

        {/* Shipped / Processing Orders */}
        <div className="bg-studio-card rounded-2xl p-4 border border-studio-border shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-studio-muted text-[11px] font-mono">
            <span>IN TRANSIT</span>
            <Truck className="w-4 h-4 text-sky-400" />
          </div>
          <div className="font-mono font-black text-2xl text-sky-300">
            {isLoadingStats ? '...' : (stats?.processingOrders || 0) + (stats?.shippedOrders || 0)}
          </div>
          <p className="text-[10px] text-sky-400/80 font-mono">Processing / Shipped</p>
        </div>

        {/* Delivered Orders */}
        <div className="bg-studio-card rounded-2xl p-4 border border-studio-border shadow-sm space-y-1.5">
          <div className="flex items-center justify-between text-studio-muted text-[11px] font-mono">
            <span>DELIVERED</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-mono font-black text-2xl text-emerald-300">
            {isLoadingStats ? '...' : stats?.deliveredOrders || 0}
          </div>
          <p className="text-[10px] text-emerald-400/80 font-mono">Completed</p>
        </div>

      </div>

      {statsError && (
        <div className="bg-amber-950/60 border border-amber-500/50 rounded-2xl p-3 flex items-center justify-between text-amber-200 text-xs font-mono">
          <span>Failed to load live statistics.</span>
          <button onClick={fetchStats} className="underline font-bold">Retry</button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="bg-studio-card rounded-2xl p-4 sm:p-5 border border-studio-border shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => handleFilterChange(st)}
              className={`text-xs font-mono px-3.5 py-2 rounded-xl transition-all ${
                selectedStatusFilter === st
                  ? 'bg-studio-terracotta text-black font-bold shadow-md'
                  : 'bg-studio-sand text-purple-200 hover:bg-studio-terracotta hover:text-black border border-studio-border'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            placeholder="Search Order ID, Name, Phone..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full bg-studio-sand border border-studio-border rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-studio-terracotta font-mono"
          />
          <Search className="w-4 h-4 text-studio-muted absolute left-3 top-2.5" />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPage(1);
              }}
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>

      {/* API Error State Alert */}
      {ordersError && (
        <div className="bg-red-950/60 border border-red-500/50 rounded-2xl p-4 flex items-center justify-between text-red-200 text-xs font-mono">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <strong className="text-white block font-bold">API Connection Error</strong>
              <span>{ordersError}</span>
            </div>
          </div>
          <button
            onClick={fetchOrders}
            className="px-3 py-1.5 bg-red-900 hover:bg-red-800 text-white rounded-lg transition-colors font-bold flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Orders Table Container */}
      <div className="bg-studio-card rounded-3xl border border-studio-border overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-studio-sand/80 border-b border-studio-border text-[11px] font-mono uppercase tracking-wider text-purple-300">
                <th className="py-4 px-6">Order ID &amp; Date</th>
                <th className="py-4 px-6">Customer Info</th>
                <th className="py-4 px-6">Items Purchased</th>
                <th className="py-4 px-6">Total Amount</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-studio-border text-xs">
              {isLoadingOrders ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-purple-300 font-mono space-y-2">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-studio-terracotta" />
                    <div>Loading orders from PostgreSQL backend...</div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-studio-muted font-mono">
                    No orders matched your search or status filter.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const currentStatus = order.status || 'Pending';
                  return (
                    <tr key={order.orderId} className="hover:bg-studio-sand/40 transition-colors">
                      
                      {/* Order ID & Date */}
                      <td className="py-4 px-6 align-top">
                        <div className="font-mono font-bold text-sm text-white">
                          #{order.orderId}
                        </div>
                        <div className="text-[11px] text-studio-muted font-mono mt-0.5">
                          {order.orderDate}
                        </div>
                        <div className="text-[10px] font-mono uppercase mt-1 flex items-center gap-1">
                          <span className="text-purple-300">{(order.paymentMethod || 'COD').toUpperCase()}</span>
                          <span className={`px-1.5 py-0.2 rounded ${order.paymentStatus === 'Paid' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-amber-950 text-amber-300 border border-amber-500/30'}`}>
                            {order.paymentStatus || 'Pending'}
                          </span>
                        </div>
                      </td>

                      {/* Customer Info */}
                      <td className="py-4 px-6 align-top space-y-1">
                        <div className="font-bold text-white text-sm">
                          {order.customer.firstName} {order.customer.lastName}
                        </div>
                        {order.customer.phone && (
                          <div className="flex items-center gap-1.5 text-[11px] text-studio-muted">
                            <Phone className="w-3 h-3 text-purple-400" />
                            <a href={`tel:${order.customer.phone}`} className="hover:underline font-mono">
                              {order.customer.phone}
                            </a>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-[11px] text-studio-muted">
                          <MapPin className="w-3 h-3 text-purple-400" />
                          <span>{order.customer.city || 'India'}, {order.customer.state || ''}</span>
                        </div>
                      </td>

                      {/* Items Purchased */}
                      <td className="py-4 px-6 align-top space-y-3">
                        {order.items && order.items.length > 0 ? (
                          order.items.map((item, idx) => {
                            const photos = (item.uploadedPhotos && item.uploadedPhotos.length > 0)
                              ? item.uploadedPhotos
                              : (item.images && item.images.length > 0)
                              ? item.images
                              : (item.image ? [item.image] : []);
                            const isCustomPrint = item.category === 'polaroids' || item.name.toLowerCase().includes('polaroid') || item.name.toLowerCase().includes('custom') || photos.length > 0;

                            return (
                              <div key={idx} className="space-y-2">
                                <div className="flex items-center gap-2.5">
                                  <img
                                    src={photos[0] || item.image || '/logo.jpeg'}
                                    alt={item.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-studio-border flex-shrink-0 shadow-sm"
                                  />
                                  <div className="truncate max-w-xs">
                                    <span className="font-medium text-white block truncate text-xs">
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-studio-muted font-mono">
                                      {item.selectedSize?.name || (item as any).size || 'Standard Scale'} &bull; Qty: {item.quantity || 1}
                                    </span>
                                  </div>
                                </div>

                                {/* Customer Uploaded Photos / Artwork Preview Tray */}
                                {isCustomPrint && photos.length > 0 && (
                                  <div className="bg-purple-950/40 p-2.5 rounded-2xl border border-purple-500/30 space-y-2">
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-purple-300 font-bold">
                                        <Camera className="w-3.5 h-3.5 text-studio-terracotta" />
                                        <span>{photos.length} Customer {photos.length > 1 ? 'Photos' : 'Upload'}</span>
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setViewingPhotoGallery({
                                            orderId: order.orderId,
                                            customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
                                            item,
                                            photos,
                                            caption: item.customCaption,
                                            songUrl: item.songUrl,
                                          });
                                          setActivePhotoIdx(0);
                                        }}
                                        className="text-[10px] font-mono font-bold bg-studio-terracotta hover:bg-studio-terracottaHover text-white px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                                      >
                                        <Eye className="w-3 h-3" />
                                        <span>View Photos ({photos.length})</span>
                                      </button>
                                    </div>

                                    {/* Thumbnail strip */}
                                    <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                                      {photos.slice(0, 6).map((p, pIdx) => (
                                        <img
                                          key={pIdx}
                                          src={p}
                                          alt={`Photo ${pIdx + 1}`}
                                          className="w-7 h-7 rounded-lg object-cover border border-purple-400/40 flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                                          onClick={() => {
                                            setViewingPhotoGallery({
                                              orderId: order.orderId,
                                              customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
                                              item,
                                              photos,
                                              caption: item.customCaption,
                                              songUrl: item.songUrl,
                                            });
                                            setActivePhotoIdx(pIdx);
                                          }}
                                          title={`Click to view Photo #${pIdx + 1}`}
                                        />
                                      ))}
                                      {photos.length > 6 && (
                                        <span className="text-[10px] font-mono font-bold text-purple-300 bg-purple-900/60 px-1.5 py-1 rounded-md">
                                          +{photos.length - 6}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })
                        ) : (
                          <span className="text-studio-muted italic text-xs">No items detailed</span>
                        )}
                      </td>

                      {/* Total Amount */}
                      <td className="py-4 px-6 align-top">
                        <div className="font-mono font-black text-sm text-white">
                          ₹{Math.round(order.total)}
                        </div>
                        <div className="text-[10px] text-studio-muted font-mono mt-0.5">
                          {order.shippingCost === 0 ? 'Free Delivery' : `+₹${order.shippingCost} Ship`}
                        </div>
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-6 align-top">
                        <select
                          value={currentStatus}
                          onChange={(e) =>
                            handleStatusChange(
                              order.orderId,
                              e.target.value as OrderStatus
                            )
                          }
                          className={`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border focus:outline-none cursor-pointer transition-colors ${getStatusBadgeStyle(
                            currentStatus
                          )}`}
                        >
                          <option value="Pending" className="bg-studio-card text-white">Pending</option>
                          <option value="Processing" className="bg-studio-card text-white">Processing</option>
                          <option value="Shipped" className="bg-studio-card text-white">Shipped</option>
                          <option value="Delivered" className="bg-studio-card text-white">Delivered</option>
                          <option value="Cancelled" className="bg-studio-card text-white">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 align-top text-right space-y-2">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedOrderModal(order)}
                            className="p-2 bg-studio-sand border border-studio-border text-purple-200 hover:bg-studio-terracotta hover:text-black rounded-lg transition-colors text-xs font-mono"
                            title="View Full Order Details"
                          >
                            Details
                          </button>

                          <a
                            href={`https://wa.me/91${ADMIN_MOBILE}?text=${encodeURIComponent(
                              `📦 Order #${order.orderId} Updates:\nCustomer: ${order.customer.firstName} (${order.customer.phone})\nStatus: ${currentStatus}\nTotal: ₹${order.total}`
                            )}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 bg-emerald-950 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500 hover:text-black rounded-lg transition-colors text-xs font-mono"
                            title="Open WhatsApp Update (Manual)"
                          >
                            WhatsApp
                          </a>
                        </div>
                      </td>

                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer Controls */}
        {totalPages > 1 && (
          <div className="p-4 bg-studio-sand/60 border-t border-studio-border flex items-center justify-between text-xs font-mono">
            <span className="text-studio-muted">
              Showing Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong> ({totalOrdersCount} Total Records)
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoadingOrders}
                className="px-3 py-1.5 bg-studio-card border border-studio-border text-purple-200 hover:text-white rounded-lg disabled:opacity-50 flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Prev
              </button>

              <span className="px-3 py-1 bg-purple-950 text-studio-terracotta font-bold rounded-lg border border-purple-500/30">
                {page} / {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoadingOrders}
                className="px-3 py-1.5 bg-studio-card border border-studio-border text-purple-200 hover:text-white rounded-lg disabled:opacity-50 flex items-center gap-1"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Full Order Detail Modal with Photo Access */}
      {selectedOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-studio-card w-full max-w-3xl rounded-3xl border border-purple-500/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between pb-4 border-b border-studio-border">
              <div>
                <span className="font-mono text-xs text-purple-400 font-bold uppercase">ORDER SPECIFICATION &bull; STUDIO DISPATCH</span>
                <h3 className="font-display font-black text-2xl text-white">
                  Order #{selectedOrderModal.orderId}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrderModal(null)}
                className="p-2 text-studio-muted hover:text-white bg-studio-sand rounded-xl border border-studio-border transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-studio-sand/40 p-4 rounded-2xl border border-studio-border text-xs">
              <div className="space-y-1">
                <span className="font-mono text-[10px] text-purple-300 font-bold uppercase">Customer Name &amp; Contact:</span>
                <p className="font-bold text-white text-sm">
                  {selectedOrderModal.customer.firstName} {selectedOrderModal.customer.lastName}
                </p>
                <p className="font-mono text-studio-muted">{selectedOrderModal.customer.phone}</p>
                <p className="font-mono text-studio-muted">{selectedOrderModal.customer.email}</p>
              </div>

              <div className="space-y-1">
                <span className="font-mono text-[10px] text-purple-300 font-bold uppercase">Delivery Address:</span>
                <p className="text-white leading-relaxed">
                  {selectedOrderModal.customer.address} {selectedOrderModal.customer.apartment && `(${selectedOrderModal.customer.apartment})`}
                </p>
                <p className="text-studio-muted font-mono">
                  {selectedOrderModal.customer.city}, {selectedOrderModal.customer.state} - {selectedOrderModal.customer.postalCode}
                </p>
              </div>
            </div>

            {/* Items List with Uploaded Photos Preview */}
            <div className="space-y-4">
              <span className="font-mono text-xs font-bold text-purple-300 uppercase">Items &amp; Custom Photos for Printing:</span>
              <div className="space-y-4">
                {selectedOrderModal.items && selectedOrderModal.items.length > 0 ? (
                  selectedOrderModal.items.map((item, i) => {
                    const photos = (item.uploadedPhotos && item.uploadedPhotos.length > 0)
                      ? item.uploadedPhotos
                      : (item.images && item.images.length > 0)
                      ? item.images
                      : (item.image ? [item.image] : []);
                    const isCustomPrint = item.category === 'polaroids' || item.name.toLowerCase().includes('polaroid') || item.name.toLowerCase().includes('custom') || photos.length > 0;

                    return (
                      <div key={i} className="p-4 rounded-2xl border border-studio-border bg-studio-sand/20 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <img src={photos[0] || item.image || '/logo.jpeg'} alt="" className="w-12 h-12 rounded-xl object-cover border border-studio-border" />
                            <div>
                              <h4 className="font-bold text-white text-xs">{item.name}</h4>
                              <p className="text-[11px] text-studio-muted font-mono">{(item as any).selectedSize?.name || (item as any).size || 'Standard Scale'} &bull; Qty: {item.quantity || 1}</p>
                            </div>
                          </div>
                          <div className="font-mono font-bold text-white text-xs">
                            ₹{Math.round(item.unitPrice * item.quantity)}
                          </div>
                        </div>

                        {/* Customer Uploaded Photo / Artwork Section */}
                        {isCustomPrint && photos.length > 0 && (
                          <div className="bg-purple-950/40 p-4 rounded-2xl border border-purple-500/40 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-purple-500/30 pb-2">
                              <div>
                                <span className="font-mono text-xs font-bold text-white flex items-center gap-1.5">
                                  <Camera className="w-4 h-4 text-studio-terracotta" />
                                  <span>Customer Uploaded Artwork / Prints ({photos.length} Photo{photos.length > 1 ? 's' : ''})</span>
                                </span>
                                <p className="text-[10px] text-purple-300 font-mono mt-0.5">
                                  Archival 300 GSM Print / 350 GSM Resin Cardstock &bull; Ready for studio print
                                </p>
                              </div>

                              <button
                                type="button"
                                onClick={() => downloadAllPhotos(photos, selectedOrderModal.orderId)}
                                className="inline-flex items-center gap-1.5 bg-studio-terracotta hover:bg-studio-terracottaHover text-white px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download All ({photos.length})</span>
                              </button>
                            </div>

                            {/* Caption or Song URL Info */}
                            {item.customCaption && (
                              <div className="flex items-center gap-2 text-xs font-mono bg-studio-sand/60 px-3 py-2 rounded-xl border border-studio-border">
                                <Type className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                <span className="text-purple-300">Printed Handwritten Caption:</span>
                                <strong className="text-white italic">"{item.customCaption}"</strong>
                              </div>
                            )}

                            {item.songUrl && (
                              <div className="flex items-center justify-between gap-2 text-xs font-mono bg-studio-sand/60 px-3 py-2 rounded-xl border border-studio-border">
                                <div className="flex items-center gap-2 truncate">
                                  <Music className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                                  <span className="text-purple-300">Scannable Spotify / Song Bar:</span>
                                  <span className="text-white truncate max-w-xs">{item.songUrl}</span>
                                </div>
                                <a
                                  href={item.songUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-studio-terracotta hover:underline font-bold flex items-center gap-1 flex-shrink-0"
                                >
                                  <span>Open Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}

                            {/* Photos Grid */}
                            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
                              {photos.map((imgUrl, pIdx) => (
                                <div
                                  key={pIdx}
                                  className="relative group rounded-xl overflow-hidden aspect-square border border-purple-500/40 bg-black/40 shadow-sm"
                                >
                                  <img src={imgUrl} alt={`Photo ${pIdx + 1}`} className="w-full h-full object-cover" />
                                  <span className="absolute bottom-1 left-1 bg-black/80 text-white font-mono text-[9px] px-1 rounded font-bold">
                                    #{pIdx + 1}
                                  </span>

                                  {/* Hover Actions */}
                                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setViewingPhotoGallery({
                                          orderId: selectedOrderModal.orderId,
                                          customerName: `${selectedOrderModal.customer.firstName} ${selectedOrderModal.customer.lastName}`.trim(),
                                          item,
                                          photos,
                                          caption: item.customCaption,
                                          songUrl: item.songUrl,
                                        });
                                        setActivePhotoIdx(pIdx);
                                      }}
                                      className="p-1.5 bg-studio-sand hover:bg-studio-terracotta hover:text-black rounded-lg text-white transition-colors"
                                      title="View Large"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadSinglePhoto(imgUrl, `Order_${selectedOrderModal.orderId}_Photo_${pIdx + 1}.jpg`)}
                                      className="p-1.5 bg-studio-terracotta hover:bg-purple-400 text-white hover:text-black rounded-lg transition-colors"
                                      title="Download Original"
                                    >
                                      <Download className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-center text-studio-muted italic text-xs">No items detailed in this order.</div>
                )}
              </div>
            </div>

            {/* Total Summary */}
            <div className="flex items-center justify-between pt-4 border-t border-studio-border font-mono">
              <span className="text-xs text-studio-muted">Grand Total (Inc. Taxes &amp; Shipping):</span>
              <span className="text-2xl font-black text-white">₹{Math.round(selectedOrderModal.total)}</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-studio-sand hover:bg-studio-terracotta hover:text-black text-purple-200 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors border border-studio-border flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Print Packing Slip</span>
              </button>

              <a
                href={`https://wa.me/91${ADMIN_MOBILE}?text=${encodeURIComponent(`Dispatching Order #${selectedOrderModal.orderId} for ${selectedOrderModal.customer.firstName}`)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 bg-studio-terracotta text-black hover:bg-purple-400 py-3 rounded-xl font-display font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-black" />
                <span>Open WhatsApp Slip (+91 {ADMIN_MOBILE})</span>
              </a>
            </div>

          </div>
        </div>
      )}

      {/* Dedicated Polaroid Photo Gallery & High-Res Inspection Modal */}
      {viewingPhotoGallery && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-studio-card w-full max-w-4xl rounded-3xl border border-purple-500/50 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[95vh] overflow-y-auto custom-scrollbar">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-studio-border">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-purple-400 uppercase font-bold">
                  <Camera className="w-4 h-4 text-studio-terracotta" />
                  <span>Customer Uploaded Print &amp; Photo Lab &bull; Order #{viewingPhotoGallery.orderId}</span>
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white mt-0.5">
                  Photo #{activePhotoIdx + 1} of {viewingPhotoGallery.photos.length} &bull; {viewingPhotoGallery.customerName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => downloadAllPhotos(viewingPhotoGallery.photos, viewingPhotoGallery.orderId)}
                  className="bg-studio-terracotta hover:bg-studio-terracottaHover text-white px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-4 h-4" />
                  <span>Download All ({viewingPhotoGallery.photos.length})</span>
                </button>

                <button
                  onClick={() => setViewingPhotoGallery(null)}
                  className="p-2 text-studio-muted hover:text-white bg-studio-sand rounded-xl border border-studio-border transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Main Stage: High-Resolution Photo Viewer */}
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="relative max-h-[50vh] flex items-center justify-center">
                <img
                  src={viewingPhotoGallery.photos[activePhotoIdx]}
                  alt={`Customer Uploaded Photo #${activePhotoIdx + 1}`}
                  className="max-h-[50vh] max-w-full rounded-2xl border-2 border-purple-500/50 shadow-2xl object-contain bg-black"
                />

                {/* Left / Right Nav Overlay Buttons */}
                {viewingPhotoGallery.photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev > 0 ? prev - 1 : viewingPhotoGallery.photos.length - 1))}
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2.5 bg-black/80 hover:bg-studio-terracotta text-white rounded-full transition-colors shadow-lg border border-white/20"
                      title="Previous Photo"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setActivePhotoIdx((prev) => (prev < viewingPhotoGallery.photos.length - 1 ? prev + 1 : 0))}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-black/80 hover:bg-studio-terracotta text-white rounded-full transition-colors shadow-lg border border-white/20"
                      title="Next Photo"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Photo Actions & Metadata Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 w-full bg-studio-sand/60 p-4 rounded-2xl border border-studio-border text-xs font-mono">
                <div className="space-y-1">
                  <span className="text-purple-300 font-bold block">
                    Photo #{activePhotoIdx + 1} &bull; Format: High-Res Original
                  </span>
                  {viewingPhotoGallery.caption && (
                    <span className="text-studio-muted block">
                      Printed Caption: <strong className="text-white italic">"{viewingPhotoGallery.caption}"</strong>
                    </span>
                  )}
                  {viewingPhotoGallery.songUrl && (
                    <span className="text-studio-muted block">
                      Spotify Song Embed: <strong className="text-white">{viewingPhotoGallery.songUrl}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadSinglePhoto(viewingPhotoGallery.photos[activePhotoIdx], `Order_${viewingPhotoGallery.orderId}_Photo_${activePhotoIdx + 1}.jpg`)}
                    className="px-4 py-2.5 bg-studio-terracotta hover:bg-studio-terracottaHover text-white rounded-xl font-mono font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download This Photo (#{activePhotoIdx + 1})</span>
                  </button>

                  <a
                    href={viewingPhotoGallery.photos[activePhotoIdx]}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 bg-studio-sand hover:bg-purple-900 border border-studio-border text-purple-300 hover:text-white rounded-xl font-mono text-xs transition-colors flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in New Tab</span>
                  </a>
                </div>
              </div>

              {/* Thumbnail Strip Tray */}
              <div className="w-full space-y-2">
                <span className="text-[11px] font-mono uppercase text-studio-muted block font-bold">
                  All {viewingPhotoGallery.photos.length} Photos in this Polaroid Pack (Click to switch):
                </span>
                <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-12 gap-2 max-h-36 overflow-y-auto p-1 custom-scrollbar">
                  {viewingPhotoGallery.photos.map((p, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActivePhotoIdx(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                        activePhotoIdx === idx
                          ? 'border-studio-terracotta ring-2 ring-studio-terracotta/50 scale-105 shadow-md'
                          : 'border-studio-border hover:border-purple-400/50'
                      }`}
                    >
                      <img src={p} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <span className="absolute bottom-0.5 left-0.5 bg-black/80 text-white font-mono text-[8px] px-1 rounded">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
