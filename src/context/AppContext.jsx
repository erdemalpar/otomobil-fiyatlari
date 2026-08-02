import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('ofl_favorites');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const [compares, setCompares] = useState(() => {
    try {
      const saved = localStorage.getItem('ofl_compares');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    localStorage.setItem('ofl_favorites', JSON.stringify(Array.from(favorites)));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('ofl_compares', JSON.stringify(Array.from(compares)));
  }, [compares]);

  const toggleFavorite = (id) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleCompare = (id) => {
    setCompares(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (next.size < 4) next.add(id);
        else alert('Karşılaştırma listesine en fazla 4 araç ekleyebilirsiniz.');
      }
      return next;
    });
  };

  const clearFavorites = () => setFavorites(new Set());
  const clearCompares = () => setCompares(new Set());
  const removeFavorite = (id) => setFavorites(prev => { const n = new Set(prev); n.delete(id); return n; });
  const removeCompare = (id) => setCompares(prev => { const n = new Set(prev); n.delete(id); return n; });

  return (
    <AppContext.Provider value={{ 
      favorites, toggleFavorite, setFavorites, clearFavorites, removeFavorite,
      compares, toggleCompare, setCompares, clearCompares, removeCompare
    }}>
      {children}
    </AppContext.Provider>
  );
};
