import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  theme: "dark";
  selectedEntity: string | null;
  searchQuery: string;
  activeFilter: string;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "dark") => void;
  setSelectedEntity: (entityId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setActiveFilter: (filter: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  theme: "dark",
  selectedEntity: null,
  searchQuery: "",
  activeFilter: "ALL",
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setTheme: (theme) => set({ theme }),
  setSelectedEntity: (entityId) => set({ selectedEntity: entityId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
