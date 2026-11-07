import { create } from "zustand";

const DOCK_KEY = "focusflow:agenda-dock-collapsed";

const readCollapsed = () => {
    try {
        return localStorage.getItem(DOCK_KEY) === "true";
    } catch {
        return false;
    }
};

type ShellState = {
    /** Desktop agenda dock collapsed to its slim strip; remembered per browser. */
    dockCollapsed: boolean;
    setDockCollapsed: (collapsed: boolean) => void;
    /** Agenda drawer on screens without room for the dock. */
    agendaDrawerOpen: boolean;
    setAgendaDrawerOpen: (open: boolean) => void;
    commandOpen: boolean;
    setCommandOpen: (open: boolean) => void;
};

export const useShellStore = create<ShellState>((set) => ({
    dockCollapsed: readCollapsed(),
    setDockCollapsed: (dockCollapsed) => {
        try {
            localStorage.setItem(DOCK_KEY, String(dockCollapsed));
        } catch {
            // Storage blocked (private mode, site data cleared): keep the in-memory value only.
        }
        set({ dockCollapsed });
    },
    agendaDrawerOpen: false,
    setAgendaDrawerOpen: (agendaDrawerOpen) => set({ agendaDrawerOpen }),
    commandOpen: false,
    setCommandOpen: (commandOpen) => set({ commandOpen }),
}));
