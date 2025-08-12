import { create } from 'zustand';

type changeRoleStore = {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    memberId: string | null;
    setMemberId: (id: string | null | undefined) => void;
}

export const useChangeRoleStore = create<changeRoleStore>((set) => ({
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
}))