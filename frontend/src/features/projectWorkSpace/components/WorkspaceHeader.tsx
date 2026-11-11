import type { ReactNode } from "react";
import { CalendarDays, ListChecks, ListTodo, NotebookText, Settings, SquareKanban, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { projectDotClass } from "@/features/projects/hooks/useNavProjects";
import type { WorkspaceView } from "../store/useWorkspaceView";

export const workspaceViews: { id: WorkspaceView; label: string; icon: typeof SquareKanban }[] = [
    { id: "board", label: "Board", icon: SquareKanban },
    { id: "list", label: "My list", icon: ListChecks },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "team", label: "Team", icon: Users },
    { id: "notes", label: "Notes", icon: NotebookText },
];

export const settingsView = { id: "settings" as WorkspaceView, label: "Settings", icon: Settings };

type WorkspaceHeaderProps = {
    name?: string;
    color?: string;
    loading?: boolean;
    views: typeof workspaceViews;
    activeView: WorkspaceView;
    onSelectView: (view: WorkspaceView) => void;
    /** Members, activity and other controls at the end of the title row. */
    actions?: ReactNode;
    onOpenAgenda: () => void;
};

/** The project's title row and view tabs on the white band above the work area. */
const WorkspaceHeader = ({ name, color, loading = false, views, activeView, onSelectView, actions, onOpenAgenda }: WorkspaceHeaderProps) => (
    <div className="border-b bg-card">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pt-5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3">
                {loading ? (
                    <Skeleton className="h-7 w-56" />
                ) : (
                    <>
                        <span aria-hidden="true" className={cn("size-3 shrink-0 rounded", projectDotClass(color))} />
                        <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl" title={name}>
                            {name ?? "Project"}
                        </h1>
                    </>
                )}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>

        <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Scrolls sideways on phones; the faded edge hints at the tabs further right. */}
            <div role="tablist" aria-label="Project views" className="-mb-px flex min-w-0 gap-1 overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,black_85%,transparent)] sm:[mask-image:none] [&::-webkit-scrollbar]:hidden">
                {views.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={activeView === id}
                        onClick={() => onSelectView(id)}
                        className={cn(
                            "mt-3 flex h-10 shrink-0 items-center gap-2 border-b-2 px-2.5 text-sm font-medium sm:px-3 transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2",
                            activeView === id ? "border-shell-accent text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                        )}
                    >
                        <Icon className="hidden size-4 sm:block" />
                        {label}
                    </button>
                ))}
            </div>
            <button
                type="button"
                onClick={onOpenAgenda}
                aria-label="My agenda"
                title="My agenda"
                className="mb-1.5 flex h-8 shrink-0 items-center gap-2 rounded-md border px-2 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-2 sm:px-2.5 lg:hidden"
            >
                <ListTodo className="size-4" />
                <span className="hidden sm:inline">My agenda</span>
            </button>
        </div>
    </div>
);

export default WorkspaceHeader;
