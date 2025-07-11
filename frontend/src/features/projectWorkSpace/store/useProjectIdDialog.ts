import { create } from "zustand";


type projectIdState = {
    projectId: string | null;
    setProjectId: (id: string | null) => void;
}

export const useProjectIdStore = create<projectIdState>((set) => ({
    projectId: null,
    setProjectId: (id) => set({ projectId: id }),
}))