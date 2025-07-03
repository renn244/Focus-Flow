import { create } from "zustand";

type ProjectFilterState = {
    filterStatus: "all" | "active" | "completed" | "archived";
    setFilterStatus: (status: "all" | "active" | "completed" | "archived") => void;
    sortBy: "name" | "progress" | "dueDate" | "lastActivity";
    setSortBy: (sort: "name" | "progress" | "dueDate" | "lastActivity") => void;
}

const useProjectFilterStore = create<ProjectFilterState>((set) => ({
    filterStatus: "all",
    setFilterStatus: (status) => set({ filterStatus: status }),
    sortBy: "name",
    setSortBy: (sort) => set({ sortBy: sort }),
}));

export default useProjectFilterStore;