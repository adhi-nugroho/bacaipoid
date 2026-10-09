import { create } from 'zustand';

interface CatalogState {
    searchQuery: string;
    selectedStatus: string;

    setSearchQuery: (query: string) => void;
    setSelectedStatus: (status: string) => void;
    resetFilters: () => void;
}

export const useCatalogStore = create<CatalogState>((set) => ({
    searchQuery: '',
    selectedStatus: 'all',

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setSelectedStatus: (selectedStatus) => set({ selectedStatus }),
    resetFilters: () => set({ searchQuery: '', selectedStatus: 'all' }),
}));
