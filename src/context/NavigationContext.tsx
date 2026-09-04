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
  | 'login'
  | 'account'
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
      if (typeof window === 'undefined') {
        return { page: 'home', params: {} };
      }

      const queryParams: Record<string, string> = {};

      // 1. Parse standard URL search parameters (?param=value)
      if (window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.forEach((val, key) => {
          queryParams[key] = val;
        });
      }

      // 2. Parse direct pathname (e.g., /admin, /shop, /product/prod-01)
      const pathname = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
      const pathSegments = pathname ? pathname.split('/').filter(Boolean) : [];

      // 3. Parse hash routing (e.g., #/admin or #admin)
      const hash = window.location.hash.replace(/^#\/?/, '');
      const [hashPath, hashQuery] = hash.split('?');
      if (hashQuery) {
        const hashSearchParams = new URLSearchParams(hashQuery);
        hashSearchParams.forEach((val, key) => {
          queryParams[key] = val;
        });
      }
      const hashSegments = hashPath ? hashPath.toLowerCase().split('/').filter(Boolean) : [];

      // Special priority for Admin: /admin, /admin/, #/admin, #admin, ?page=admin, ?route=admin, ?admin=true
      if (
        pathname === 'admin' ||
        pathname.startsWith('admin/') ||
        hashSegments[0] === 'admin' ||
        queryParams.page === 'admin' ||
        queryParams.route === 'admin' ||
        queryParams.admin === 'true'
      ) {
        return { page: 'admin', params: queryParams };
      }

      // Determine active path segments (hash takes priority if explicitly set, otherwise pathname)
      const activeSegments = hashSegments.length > 0 ? hashSegments : pathSegments;
      const pageSegment = activeSegments[0] || 'home';

      if (pageSegment === 'product' && activeSegments[1]) {
        queryParams.id = activeSegments[1];
        return { page: 'product', params: queryParams };
      }

      const validPages: PageRoute[] = [
        'home', 'shop', 'posters', 'polaroids', 'product',
        'cart', 'checkout', 'about', 'contact', 'order-confirmation', 'track-order',
        'login', 'account', 'admin'
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

  // Sync state on history change (browser back/forward button, URL change)
  useEffect(() => {
    const handleLocationChange = () => {
      const route = parseRoute();
      changeRouteState(route.page, route.params);
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (page: PageRoute, newParams: Record<string, string> = {}) => {
    changeRouteState(page, newParams);

    // Build URL hash and history state
    let hashUrl = `#/${page === 'home' ? '' : page}`;
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

    // Safely update history and hash
    try {
      const pathname = page === 'home' ? '/' : `/${page}`;
      const pathWithQuery = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.pushState({ page, params: newParams }, '', pathWithQuery);
    } catch {
      // Fallback
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
