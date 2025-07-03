import { create } from "zustand";

type ProjectDialogState = {
    isCreateOpen: boolean;
    isEditOpen: boolean;
    
    setCreateOpen: (value: boolean) => void;
    setEditOpen: (value: boolean) => void;

    // Additional state for edit project dialog
    editProjectId: string | undefined; // Optional, can be set when opening the edit dialog
    setEditProjectId: (id: string) => void; // Optional, can be set when opening the edit dialog
}

const useProjectDialogStore = create<ProjectDialogState>((set) => ({
    // Create Project
    isCreateOpen: false,
    setCreateOpen: (value) => set({ isCreateOpen: value }),

    // Edit Project
    isEditOpen: false,
    setEditOpen: (value) => {
        // do nothing because setEditProjectId will handle opening the dialog
        if(value === false) {
            set({ isEditOpen: false });
            set({ editProjectId: undefined }); // Reset editProjectId when closing the dialog/
        }
    },

    // Additional state for edit project dialog
    editProjectId: undefined,
    setEditProjectId: (id: string | undefined | null) => {
        if(id === undefined || id === null) {
            set({ editProjectId: undefined });
            set({ isEditOpen: false }); // Close the edit dialog when ID is empty
        } else {
            set({ editProjectId: id });
            set({ isEditOpen: true }); // Automatically open the edit dialog when setting the ID
        }
    }
}));

export default useProjectDialogStore;