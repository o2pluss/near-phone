import { create } from 'zustand';

interface SearchFilters {
  carrier: string;
  model: string;
  storage: string;
  location: string;
  distance: number[];
  minPrice: string;
  maxPrice: string;
  conditions: {
    numberPorting: boolean;
    newSubscription: boolean;
    budget: boolean;
    cardDiscount: boolean;
    bundleDiscount: boolean;
    requiredPlan: boolean;
    additionalService: boolean;
  };
}

interface SearchState {
  filters: SearchFilters;
  searchResults: any[];
  isLoading: boolean;
  lastSearchQuery: string;
  
  setFilters: (filters: Partial<SearchFilters>) => void;
  setSearchResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
  setLastSearchQuery: (query: string) => void;
  clearFilters: () => void;
}

const initialFilters: SearchFilters = {
  carrier: '',
  model: '',
  storage: '',
  location: '',
  distance: [5],
  minPrice: '',
  maxPrice: '',
  conditions: {
    numberPorting: false,
    newSubscription: false,
    budget: false,
    cardDiscount: false,
    bundleDiscount: false,
    requiredPlan: false,
    additionalService: false,
  }
};

export const useSearchStore = create<SearchState>()((set, get) => ({
  filters: initialFilters,
  searchResults: [],
  isLoading: false,
  lastSearchQuery: '',
  
  setFilters: (newFilters: Partial<SearchFilters>) => {
    const currentFilters = get().filters;
    set({ 
      filters: { 
        ...currentFilters, 
        ...newFilters 
      } 
    });
  },
  
  setSearchResults: (results: any[]) => {
    set({ searchResults: results });
  },
  
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
  
  setLastSearchQuery: (query: string) => {
    set({ lastSearchQuery: query });
  },
  
  clearFilters: () => {
    set({ filters: initialFilters });
  },
}));