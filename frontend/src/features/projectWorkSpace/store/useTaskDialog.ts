import { create } from "zustand";

type TaskDialogState = {
    isCreateOpen: boolean;
    setCreateOpen: (value: boolean) => void;
    createColumnId: string | null;
    setCreateColumnId: (id: string | null) => void;
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
}));

export default useTaskDialogStore;