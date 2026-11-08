import { create } from "zustand";

export type WorkspaceView = "board" | "list" | "calendar" | "team" | "notes" | "settings";

type WorkspaceViewState = {
    view: WorkspaceView;
    setView: (view: WorkspaceView) => void;
    selectedNoteId: string | null;
    setSelectedNoteId: (noteId: string | null) => void;
    /** Switches the workspace to the Notes tab with one note open. */
    openNote: (noteId: string) => void;
};

const useWorkspaceViewStore = create<WorkspaceViewState>((set) => ({
    view: "board",
    setView: (view) => set({ view }),
    selectedNoteId: null,
    setSelectedNoteId: (selectedNoteId) => set({ selectedNoteId }),
    openNote: (noteId) => set({ view: "notes", selectedNoteId: noteId }),
}));

export default useWorkspaceViewStore;
