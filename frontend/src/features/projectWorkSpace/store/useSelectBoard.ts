import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SelectBoardState = {
    selectedBoardId: string | null | undefined;
    setSelectedBoardId: (id: string | null | undefined) => void;
}

const useSelectBoardStore = create<SelectBoardState>()(
    persist(
        (set, get) => ({
            selectedBoardId: get()?.selectedBoardId || null,
            setSelectedBoardId: (id: string | null | undefined) => {
                set({ selectedBoardId: id });
            }
        }),
        {
            name: "selected-board-storage", // unique name for the storage
            storage: createJSONStorage(() => sessionStorage)
        }
    ), 
)

export default useSelectBoardStore;