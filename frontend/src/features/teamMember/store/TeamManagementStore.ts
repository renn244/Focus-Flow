import { create } from 'zustand';

type TeamManagementState = {
    isOpen: boolean;
    setIsOpen: (value: boolean) => void;
}

export const useTeamManagementStore = create<TeamManagementState>((set) => ({
    isOpen: false,
    setIsOpen: (value) => set({ isOpen: value })
}));