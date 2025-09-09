import { create } from 'zustand';

type addMemberDialog = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

export const useAddMemberDialog = create<addMemberDialog>((set) => ({
    isOpen: false,
    setIsOpen: (isOpen) => set({ isOpen })
}));