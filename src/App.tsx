import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { WishlistProvider } from './context/WishlistContext';
import { CartProvider } from './context/CartContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { ToastContainer } from './components/common/ToastContainer';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { PostersPage } from './pages/PostersPage';
import { PolaroidsPage } from './pages/PolaroidsPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { ReviewsPage } from './pages/ReviewsPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { TrackOrderPage } from './pages/TrackOrderPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { AccountPage } from './pages/AccountPage';
import { OrderNotificationModal } from './components/common/OrderNotificationModal';

const AppContent: React.FC = () => {
  const { currentPage } = useNavigation();

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const observeScrollElements = () => {
      const elements = document.querySelectorAll('.scroll-reveal, .scroll-scale');
      if (!elements.length) return;

      if (!('IntersectionObserver' in window)) {
        elements.forEach(el => el.classList.add('is-visible'));
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );

      elements.forEach(el => observer.observe(el));
      return () => observer.disconnect();
    };

    const timer = setTimeout(observeScrollElements, 60);
    return () => clearTimeout(timer);
  }, [currentPage]);

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'posters':
        return <PostersPage />;
      case 'polaroids':
        return <PolaroidsPage />;
      case 'product':
        return <ProductDetailsPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'about':
        return <AboutPage />;
      case 'contact':
        return <ContactPage />;
      case 'reviews':
        return <ReviewsPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'track-order':
        return <TrackOrderPage />;
      case 'login':
        return <LoginPage />;
      case 'account':
        return <AccountPage />;
      case 'admin':
        return <AdminPage />;
      default:
        return <HomePage />;
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-between bg-studio-bg selection:bg-studio-terracotta selection:text-white">
      <div>
        <Navbar />
        <main key={currentPage} className="animate-fadeIn">
          {renderCurrentPage()}
        </main>
      </div>

      <CartDrawer />
      <ToastContainer />
      <OrderNotificationModal />
      <Footer />
    </div>
  );
};

export function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CustomerAuthProvider>
          <WishlistProvider>
            <CartProvider>
              <NavigationProvider>
                <AppContent />
              </NavigationProvider>
            </CartProvider>
          </WishlistProvider>
        </CustomerAuthProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
