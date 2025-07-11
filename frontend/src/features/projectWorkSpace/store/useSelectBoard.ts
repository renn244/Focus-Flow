import { create } from "zustand";

type SelectBoardState = {
    selectedBoardId: string | null | undefined;
    setSelectedBoardId: (id: string | null | undefined) => void;
}

const useSelectBoardStore = create<SelectBoardState>((set) => ({
    selectedBoardId: null,
    setSelectedBoardId: (id: string | null | undefined) => {
        set({ selectedBoardId: id });
    }
}))

export default useSelectBoardStore;