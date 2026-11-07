import { useMemo, type ReactNode } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks";
import { groupAgenda } from "@/features/projectWorkSpace/utils/agenda";
import AgendaPanel from "./AgendaPanel";
import CommandPalette from "./CommandPalette";
import TopBar from "./TopBar";
import { useShellStore } from "./shellStore";

const iconButton =
    "inline-flex size-8 shrink-0 items-center justify-center rounded-md text-shell-muted transition-colors hover:bg-shell-hover hover:text-shell-foreground focus-visible:outline-2";

const AgendaDock = () => {
    const collapsed = useShellStore((state) => state.dockCollapsed);
    const setCollapsed = useShellStore((state) => state.setDockCollapsed);
    const { data: tasks = [] } = useMyTasks();
    const groups = useMemo(() => groupAgenda(tasks), [tasks]);

    return (
        <aside
            aria-label="My agenda"
            className={cn(
                "sticky top-14 hidden h-[calc(100svh-3.5rem)] shrink-0 overflow-hidden border-r border-shell-border bg-shell-raised transition-[width] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:block",
                collapsed ? "w-14" : "w-[340px]"
            )}
        >
            {collapsed ? (
                <div className="flex flex-col items-center gap-3 pt-3">
                    <button type="button" className={iconButton} onClick={() => setCollapsed(false)} aria-label="Show my agenda" title="Show my agenda">
                        <PanelLeftOpen className="size-4" />
                    </button>
                    {groups.overdue.length > 0 && (
                        <span className="rounded-md bg-red-400/15 px-1.5 py-0.5 text-xs font-semibold text-red-300 tabular-nums" title={`${groups.overdue.length} overdue`}>
                            {groups.overdue.length}
                        </span>
                    )}
                    <span className="rounded-md bg-white/[0.08] px-1.5 py-0.5 text-xs font-semibold text-shell-foreground tabular-nums" title={`${groups.today.length} due today`}>
                        {groups.today.length}
                    </span>
                </div>
            ) : (
                <AgendaPanel
                    action={
                        <button type="button" className={iconButton} onClick={() => setCollapsed(true)} aria-label="Hide my agenda" title="Hide my agenda">
                            <PanelLeftClose className="size-4" />
                        </button>
                    }
                />
            )}
        </aside>
    );
};

const AgendaDrawer = () => {
    const open = useShellStore((state) => state.agendaDrawerOpen);
    const setOpen = useShellStore((state) => state.setAgendaDrawerOpen);

    return (
        <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
            <DialogPrimitive.Portal>
                <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-shell/60 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 lg:hidden" />
                <DialogPrimitive.Content
                    aria-describedby={undefined}
                    className="fixed inset-y-0 left-0 z-50 w-[min(22rem,88vw)] bg-shell-raised shadow-[8px_0_32px_rgb(0_0_0/0.35)] duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-left data-[state=closed]:animate-out data-[state=closed]:slide-out-to-left lg:hidden"
                >
                    <DialogPrimitive.Title className="sr-only">My agenda</DialogPrimitive.Title>
                    <AgendaPanel
                        onOpenTask={() => setOpen(false)}
                        action={
                            <DialogPrimitive.Close className={iconButton} aria-label="Close agenda">
                                <X className="size-4" />
                            </DialogPrimitive.Close>
                        }
                    />
                </DialogPrimitive.Content>
            </DialogPrimitive.Portal>
        </DialogPrimitive.Root>
    );
};

type AppShellProps = {
    children: ReactNode;
    /** Dock the personal agenda beside the page (project workspace). */
    dock?: boolean;
    projectId?: string | null;
};

const AppShell = ({ children, dock = false, projectId = null }: AppShellProps) => (
    <div className="flex min-h-svh flex-col bg-background">
        <TopBar projectId={projectId} />
        <div className="flex min-h-0 flex-1">
            {dock && <AgendaDock />}
            <main className="min-w-0 flex-1">{children}</main>
        </div>
        {dock && <AgendaDrawer />}
        <CommandPalette />
    </div>
);

export default AppShell;
