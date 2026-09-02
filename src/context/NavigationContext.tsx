import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OrderConfirmationData } from '../types';

export type PageRoute = 
  | 'home'
  | 'shop'
  | 'posters'
  | 'polaroids'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'about'
  | 'contact'
  | 'order-confirmation'
  | 'track-order'
  | 'admin';

interface NavigationContextType {
  currentPage: PageRoute;
  params: Record<string, string>;
  navigate: (page: PageRoute, params?: Record<string, string>) => void;
  lastOrder: OrderConfirmationData | null;
  setLastOrder: (order: OrderConfirmationData | null) => void;
  newOrderNotification: OrderConfirmationData | null;
  setNewOrderNotification: (order: OrderConfirmationData | null) => void;
  dismissNotification: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const parseRoute = (): { page: PageRoute; params: Record<string, string> } => {
    try {
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [pathPart, queryPart] = hash.split('?');
      
      const queryParams: Record<string, string> = {};
      if (queryPart) {
        const searchParams = new URLSearchParams(queryPart);
        searchParams.forEach((val, key) => {
          queryParams[key] = val;
        });
      }

      const segments = pathPart.split('/').filter(Boolean);
      const pageSegment = segments[0] || 'home';

      if (pageSegment === 'product' && segments[1]) {
        queryParams.id = segments[1];
        return { page: 'product', params: queryParams };
      }

      const validPages: PageRoute[] = [
        'home', 'shop', 'posters', 'polaroids', 'product',
        'cart', 'checkout', 'about', 'contact', 'order-confirmation', 'track-order', 'admin'
      ];

      if (validPages.includes(pageSegment as PageRoute)) {
        return { page: pageSegment as PageRoute, params: queryParams };
      }
    } catch {
      // Fallback
    }

    return { page: 'home', params: {} };
  };

  const initial = parseRoute();
  const [currentPage, setCurrentPage] = useState<PageRoute>(initial.page);
  const [params, setParams] = useState<Record<string, string>>(initial.params);
  
  // Last confirmed order session state for confirmation page
  const [lastOrder, setLastOrder] = useState<OrderConfirmationData | null>(() => {
    try {
      const saved = localStorage.getItem('stick_scape_last_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [newOrderNotification, setNewOrderNotification] = useState<OrderConfirmationData | null>(null);

  useEffect(() => {
    try {
      if (lastOrder) {
        localStorage.setItem('stick_scape_last_order', JSON.stringify(lastOrder));
      } else {
        localStorage.removeItem('stick_scape_last_order');
      }
    } catch {
      // localStorage fallback
    }
  }, [lastOrder]);

  const dismissNotification = () => {
    setNewOrderNotification(null);
  };

  const changeRouteState = (page: PageRoute, newParams: Record<string, string>) => {
    if (typeof document !== 'undefined' && 'startViewTransition' in document && typeof (document as any).startViewTransition === 'function') {
      (document as any).startViewTransition(() => {
        setCurrentPage(page);
        setParams(newParams);
      });
    } else {
      setCurrentPage(page);
      setParams(newParams);
    }
  };

  // Sync state on hash change (browser back/forward button)
  useEffect(() => {
    const handlePopState = () => {
      const route = parseRoute();
      changeRouteState(route.page, route.params);
    };

    window.addEventListener('hashchange', handlePopState);
    return () => window.removeEventListener('hashchange', handlePopState);
  }, []);

  const navigate = (page: PageRoute, newParams: Record<string, string> = {}) => {
    changeRouteState(page, newParams);

    // Build URL hash
    let hashUrl = `#/${page}`;
    if (page === 'product' && newParams.id) {
      hashUrl = `#/${page}/${newParams.id}`;
    }

    const searchParams = new URLSearchParams();
    Object.entries(newParams).forEach(([k, v]) => {
      if (page === 'product' && k === 'id') return;
      if (v) searchParams.append(k, v);
    });

    const queryString = searchParams.toString();
    if (queryString) {
      hashUrl += `?${queryString}`;
    }

    window.location.hash = hashUrl;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <NavigationContext.Provider
      value={{
        currentPage,
        params,
        navigate,
        lastOrder,
        setLastOrder,
        newOrderNotification,
        setNewOrderNotification,
        dismissNotification,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextType => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};
