import { create } from "zustand";

type ProjectDialogState = {
    isCreateOpen: boolean;
    isEditOpen: boolean;
    
    setCreateOpen: (value: boolean) => void;
    setEditOpen: (value: boolean) => void;

    // Additional state for edit project dialog
    editProjectId: string | undefined; // Optional, can be set when opening the edit dialog
    setEditProjectId: (id: string) => void; // Optional, can be set when opening the edit dialog

    // View Project Dialog
    isViewOpen: boolean;
    setViewOpen: (value: boolean) => void;
    // Additional state for view project dialog
    viewProjectId: string | undefined; // Optional, can be set when opening the view
    setViewProjectId: (id: string | undefined | null) => void; // Optional, can be set when opening the view dialog

    // Achived Project Dialog
    isArchiveOpen: boolean;
    setArchiveOpen: (value: boolean) => void;
    // Additional state for archive project dialog
    archiveProjectId: string | undefined; // Optional, can be set when opening the archive
    setArchiveProjectId: (id: string | undefined | null) => void; // Optional, can be set when opening the archive dialog
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
    },

    //View Project Dialog
    isViewOpen: false,
    setViewOpen: (value) => {
        if(value === false) {
            set({ isViewOpen: false });
            set({ viewProjectId: undefined }); // Reset viewProjectId when closing the dialog
        }
    },

    // Additional state for view project dialog
    viewProjectId: undefined,
    setViewProjectId: (id: string | undefined | null) => {
        if(id === undefined || id === null) {
            set({ viewProjectId: undefined });
            set({ isViewOpen: false }); // Close the view dialog when ID is empty
        } else {
            set({ viewProjectId: id });
            set({ isViewOpen: true }); // Automatically open the view dialog when setting the ID
        }
    },

    // Archive Project Dialog
    isArchiveOpen: false,
    setArchiveOpen: (value) => {
        if(value === false) {
            set({ isArchiveOpen: false });
            set({ archiveProjectId: undefined }); // Reset archiveProjectId when closing the dialog
        }
    },

    // Additional state for archive project dialog
    archiveProjectId: undefined,
    setArchiveProjectId: (id: string | undefined | null) => {
        if(id === undefined || id === null) {
            set({ archiveProjectId: undefined });
            set({ isArchiveOpen: false }); // Close the archive dialog when ID is empty
        } else {
            set({ archiveProjectId: id });
            set({ isArchiveOpen: true }); // Automatically open the archive dialog when setting the ID
        }
    }
}));

export default useProjectDialogStore;