import { create } from "zustand";

type TaskDialogState = {
    isCreateOpen: boolean;
    setCreateOpen: (value: boolean) => void;
    createColumnId: string | null;
    setCreateColumnId: (id: string | null) => void;

    isEditOpen: boolean;
    setEditOpen: (value: boolean) => void;
    editTaskId: string | null;
    setEditTaskId: (id: string | null) => void;

    isRemoveOpen: boolean;
    setRemoveOpen: (value: boolean) => void;
    removeTaskId: string | null;
    setRemoveTaskId: (id: string | null) => void;
}

const useTaskDialogStore = create<TaskDialogState>((set) => ({
    isCreateOpen: false,
    setCreateOpen: (value) => {
        if(value === false) {
            set({ isCreateOpen: false });
            set({ createColumnId: null }); // Reset createTaskId when closing the dialog
        }
    },
    createColumnId: null,
    setCreateColumnId: (id) => {
        if(id === undefined || id === null) {
            set({ createColumnId: null });
            set({ isCreateOpen: false }); // Close the create dialog when ID is empty
        } else {
            set({ createColumnId: id });
            set({ isCreateOpen: true }); // Automatically open the create dialog when setting the ID
        }
    },

    isEditOpen: false,
    setEditOpen: (value) => {
        if(value === false) {
            set({ isEditOpen: false });
            set({ editTaskId: null }); // Reset editTaskId when closing the dialog
        }
    },
    editTaskId: null,
    setEditTaskId: (id) => {
        if(id === undefined || id === null) {
            set({ editTaskId: null });
            set({ isEditOpen: false }); // Close the edit dialog when ID is empty
        } else {
            set({ editTaskId: id });
            set({ isEditOpen: true }); // Automatically open the edit dialog when setting the ID
        }
    },

    isRemoveOpen: false,
    setRemoveOpen: (value) => {
        if(value === false) {
            set({ isRemoveOpen: false });
            set({ removeTaskId: null }); // Reset removeTaskId when closing the dialog
        }
    },
    removeTaskId: null,
    setRemoveTaskId: (id) => {
        if(id === undefined || id === null) {
            set({ removeTaskId: null });
            set({ isRemoveOpen: false }); // Close the remove dialog when ID is empty
        } else {
            set({ removeTaskId: id });
            set({ isRemoveOpen: true }); // Automatically open the remove dialog when setting the ID
        }
    }
}));

export default useTaskDialogStore;