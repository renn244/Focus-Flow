import { create } from "zustand";

type SelectedProjectState = {
    selectedProjects: string[]; // project Id's
    handleSelectProject: (projectId: string) => void;
}

const useSelectedProjectStore = create<SelectedProjectState>((set) => ({
    selectedProjects: [],
    handleSelectProject: (projectId) => set((state) => {
        const isSelected = state.selectedProjects.includes(projectId);
        return {
            selectedProjects: isSelected
                ? state.selectedProjects.filter(id => id !== projectId) // remove if already selected
                : [...state.selectedProjects, projectId], // add if not selected
        };
    }),
}))

export default useSelectedProjectStore;