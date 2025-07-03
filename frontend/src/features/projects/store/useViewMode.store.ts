import { create } from "zustand";

type ViewModeState = {
    viewMode: "grid" | "list";
    setViewMode: (mode: "grid" | "list") => void;
}

const useViewModeStore = create<ViewModeState>((set) => ({
    viewMode: "grid", // default view mode
    setViewMode: (mode) => set({ viewMode: mode }),
}));

export default useViewModeStore;