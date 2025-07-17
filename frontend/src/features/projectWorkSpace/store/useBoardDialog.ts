import { create } from "zustand";

type BoardDialogState = {
    isCreateOpen: boolean;
    setCreateOpen: (value: boolean) => void;

    isEditOpen: boolean;
    setEditOpen: (value: boolean) => void;
    editBoardId: string | undefined;
    setEditBoardId: (id: string | undefined | null) => void;

    isDeleteOpen: boolean;
    setDeleteOpen: (value: boolean) => void;
    deleteBoardId: string | undefined;
    setDeleteBoardId: (id: string | undefined | null) => void;
}

const useBoardDialogStore = create<BoardDialogState>((set) => ({
    isCreateOpen: false,
    setCreateOpen: (value) => set({ isCreateOpen: value }),

    isEditOpen: false,
    setEditOpen: (value) => {
        if(value === false) {
            set({ isEditOpen: false });
            set({ editBoardId: undefined }); // Reset editBoardId when closing the dialog
        }
    },
    editBoardId: undefined,
    setEditBoardId: (id) => {
        if(id === undefined || id === null) {
            set({ editBoardId: undefined });
            set({ isEditOpen: false }); // Close the edit dialog when ID is empty
        } else {
            set({ editBoardId: id });
            set({ isEditOpen: true }); // Automatically open the edit dialog when setting the ID
        }
    },

    isDeleteOpen: false,
    setDeleteOpen: (value) => {
        if(value === false) {
            set({ isDeleteOpen: false });
            set({ deleteBoardId: undefined }); // Reset boardToDelete when closing the dialog
        }
    },
    deleteBoardId: undefined,
    setDeleteBoardId: (id) => {
        if(id === undefined || id === null) {
            set({ deleteBoardId: undefined });
            set({ isDeleteOpen: false }); // Close the delete dialog when ID is empty
        } else {
            set({ deleteBoardId: id });
            set({ isDeleteOpen: true }); // Automatically open the delete dialog when setting the ID
        }
    },
}))

export default useBoardDialogStore;