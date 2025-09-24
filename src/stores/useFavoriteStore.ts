import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Store {
  id: string;
  name: string;
  address: string;
  distance: number;
  phone: string;
  rating: number;
  reviewCount: number;
  model: string;
  price: number;
  conditions: string[];
  hours: string;
  addedDate: string;
}

interface FavoriteState {
  favoriteStores: Store[];
  addFavorite: (store: Store) => void;
  removeFavorite: (storeId: string) => void;
  isFavorite: (storeId: string) => boolean;
  toggleFavorite: (store: Store) => void;
  clearFavorites: () => void;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favoriteStores: [],
      
      addFavorite: (store: Store) => {
        const currentFavorites = get().favoriteStores;
        const isAlreadyFavorite = currentFavorites.some(fav => fav.id === store.id);
        
        if (!isAlreadyFavorite) {
          const storeWithDate = {
            ...store,
            addedDate: new Date().toISOString().split('T')[0]
          };
          set({ favoriteStores: [...currentFavorites, storeWithDate] });
        }
      },
      
      removeFavorite: (storeId: string) => {
        const currentFavorites = get().favoriteStores;
        set({ favoriteStores: currentFavorites.filter(store => store.id !== storeId) });
      },
      
      isFavorite: (storeId: string) => {
        return get().favoriteStores.some(store => store.id === storeId);
      },
      
      toggleFavorite: (store: Store) => {
        const isFav = get().isFavorite(store.id);
        if (isFav) {
          get().removeFavorite(store.id);
        } else {
          get().addFavorite(store);
        }
      },
      
      clearFavorites: () => {
        set({ favoriteStores: [] });
      },
    }),
    {
      name: 'favorite-storage',
    }
  )
);