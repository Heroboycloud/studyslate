import { useState, useEffect, useCallback } from 'react';

export interface Route {
  name: string;
  params: URLSearchParams;
}

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const [path, queryString] = hash.split('?');
  const params = new URLSearchParams(queryString || '');
  
  // Normalize path
  let name = path.replace(/^\/|\/saved$/, '').replace(/\/$/, '') || 'home';
  
  return { name, params };
}

export function useRoute() {
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash());
    };

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((to: string, params?: Record<string, string>) => {
    const searchParams = new URLSearchParams(params);
    const queryString = searchParams.toString();
    const hash = queryString ? `#/${to}?${queryString}` : `#/${to}`;
    window.location.hash = hash;
  }, []);

  return { route, navigate };
}
