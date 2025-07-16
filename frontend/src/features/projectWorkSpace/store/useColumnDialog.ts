import { create } from "zustand";

type ColumnDialogState = {
    isCreateOpen: boolean;
    setCreateOpen: (value: boolean) => void;

    isEditOpen: boolean;
    setEditOpen: (value: boolean) => void;
    editColumnId: string | undefined;
    setEditColumnId: (id: string | undefined | null) => void;

    isRemoveOpen: boolean;
    setRemoveOpen: (value: boolean) => void;
    removeColumnId: string | undefined;
    setRemoveColumnId: (id: string | undefined | null) => void;
}

const useColumnDialogStore = create<ColumnDialogState>((set) => ({
    isCreateOpen: false,
    setCreateOpen: (value) => set({ isCreateOpen: value }),

    isEditOpen: false,
    setEditOpen: (value) => {
        if(value === false) {
            set({ isEditOpen: false });
            set({ editColumnId: undefined }); // Reset editColumnId when closing the dialog
        }
    },
    editColumnId: undefined,
    setEditColumnId: (id) => {
        if(id === undefined || id === null) {
            set({ editColumnId: undefined });
            set({ isEditOpen: false }); // Close the edit dialog when ID is empty
        } else {
            set({ editColumnId: id });
            set({ isEditOpen: true }); // Automatically open the edit dialog when setting the ID
        }
    },

    isRemoveOpen: false,
    setRemoveOpen: (value) => {
        if(value === false) {
            set({ isRemoveOpen: false });
            set({ removeColumnId: undefined }); // Reset removeColumnId when closing the dialog
        }
    },
    removeColumnId: undefined,
    setRemoveColumnId: (id) => {
        if(id === undefined || id === null) {
            set({ removeColumnId: undefined });
            set({ isRemoveOpen: false }); // Close the remove dialog when ID is empty
        } else {
            set({ removeColumnId: id });
            set({ isRemoveOpen: true }); // Automatically open the remove dialog when setting the ID
        }
    },
}))

export default useColumnDialogStore;