import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { OrderConfirmationData } from '../types';

export type PageRoute = 
  | 'home'
  | 'shop'
  | 'posters'
  | 'polaroids'
  | 'bouquets'
  | 'product'
  | 'cart'
  | 'checkout'
  | 'about'
  | 'contact'
  | 'reviews'
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
      const validPages: PageRoute[] = [
        'home', 'shop', 'posters', 'polaroids', 'bouquets', 'product',
        'cart', 'checkout', 'about', 'contact', 'reviews', 'order-confirmation', 'track-order',
        'login', 'account', 'admin'
      ];

      let pageSegment: PageRoute = 'home';
      if (
        hashSegments.length > 0 &&
        (validPages.includes(hashSegments[0] as PageRoute) ||
          hashSegments[0] === 'feedback' ||
          hashSegments[0] === 'review' ||
          hashSegments[0] === 'reviews' ||
          hashSegments[0] === 'bouquet' ||
          hashSegments[0] === 'bouquets')
      ) {
        if (hashSegments[0] === 'feedback' || hashSegments[0] === 'review' || hashSegments[0] === 'reviews') {
          pageSegment = 'reviews';
        } else if (hashSegments[0] === 'bouquet' || hashSegments[0] === 'bouquets') {
          pageSegment = 'bouquets';
        } else {
          pageSegment = hashSegments[0] as PageRoute;
        }

        if (pageSegment === 'product' && hashSegments[1]) {
          queryParams.id = hashSegments[1];
        }
        return { page: pageSegment, params: queryParams };
      } else if (
        pathSegments.length > 0 &&
        (validPages.includes(pathSegments[0] as PageRoute) ||
          pathSegments[0] === 'feedback' ||
          pathSegments[0] === 'review' ||
          pathSegments[0] === 'reviews' ||
          pathSegments[0] === 'bouquet' ||
          pathSegments[0] === 'bouquets')
      ) {
        if (pathSegments[0] === 'feedback' || pathSegments[0] === 'review' || pathSegments[0] === 'reviews') {
          pageSegment = 'reviews';
        } else if (pathSegments[0] === 'bouquet' || pathSegments[0] === 'bouquets') {
          pageSegment = 'bouquets';
        } else {
          pageSegment = pathSegments[0] as PageRoute;
        }

        if (pageSegment === 'product' && pathSegments[1]) {
          queryParams.id = pathSegments[1];
        }
        return { page: pageSegment, params: queryParams };
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
    const handleLocationChange = (event?: Event) => {
      const popEvent = event as PopStateEvent | undefined;
      if (popEvent && popEvent.state && popEvent.state.page) {
        changeRouteState(popEvent.state.page, popEvent.state.params || {});
      } else {
        const route = parseRoute();
        changeRouteState(route.page, route.params);
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);

    // Initial history state replacement if empty so first back navigation is smooth
    if (!window.history.state) {
      const route = parseRoute();
      let hashUrl = `#/${route.page === 'home' ? '' : route.page}`;
      if (route.page === 'product' && route.params.id) {
        hashUrl = `#/${route.page}/${route.params.id}`;
      }
      try {
        window.history.replaceState({ page: route.page, params: route.params }, '', hashUrl);
      } catch {
        // Fallback
      }
    }

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  const navigate = (page: PageRoute, newParams: Record<string, string> = {}) => {
    changeRouteState(page, newParams);

    // Build URL representation
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

    // Single unified history push
    try {
      window.history.pushState({ page, params: newParams }, '', hashUrl);
    } catch {
      window.location.hash = hashUrl;
    }

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
