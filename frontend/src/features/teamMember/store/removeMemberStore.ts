import { create } from 'zustand';

type removeMemberDialog = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  
  memberId: string | null;
  setMemberId: (memberId: string | null) => void;
}

export const useRemoveMemberDialog = create<removeMemberDialog>((set) => ({
  isOpen: false,
  setIsOpen: (value) => {
    if(value === false) {
      set({ isOpen: false });
      set({ memberId: null });
    }
  },
  
  memberId: null,
  setMemberId: (id) => {
    if(id === undefined || id === null) {
      set({ memberId: null });
      set({ isOpen: false });
    } else {
      set({ memberId: id });
      set({ isOpen: true });
    }
  },
}));

