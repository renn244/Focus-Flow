import { create } from "zustand";
import type { TeamMemberWithUser } from "../type";

type ViewMemberProfileStore = {
    isOpen: boolean;
    member: TeamMemberWithUser | null;
    setMember: (member: TeamMemberWithUser) => void;
    setIsOpen: (isOpen: boolean) => void;
}

export const useViewMemberProfileDialog = create<ViewMemberProfileStore>((set) => ({
    isOpen: false,
    member: null,
    setMember: (member) => set({ member, isOpen: true }),
    setIsOpen: (isOpen) => set(isOpen ? { isOpen: true } : { isOpen: false, member: null }),
}));
