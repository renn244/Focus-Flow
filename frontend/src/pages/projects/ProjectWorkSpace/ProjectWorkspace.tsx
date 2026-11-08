import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import { CalendarDays, ListChecks, ListTodo, NotebookText, Settings, SquareKanban, Users } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useShellStore } from "@/components/layout/shellStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import KanbanBoard from "@/features/projectWorkSpace/components/Board/KanbanBoard";
import ProjectActivityDialog from "@/features/projectWorkSpace/components/Activity/ProjectActivityDialog";
import ProjectCalendar from "@/features/projectWorkSpace/components/Calendar/ProjectCalendar";
import ProjectList from "@/features/projectWorkSpace/components/List/ProjectList";
import ProjectNotes from "@/features/projectWorkSpace/components/Notes/ProjectNotes";
import ProjectSettings from "@/features/projectWorkSpace/components/Settings/ProjectSettings";
import useTaskDialogStore from "@/features/projectWorkSpace/store/useTaskDialog";
import { useAuthContext } from "@/context/authContext";
import { useGetMembers } from "@/features/teamMember/hooks/useGetMembers";
import useWorkspaceViewStore, { type WorkspaceView } from "@/features/projectWorkSpace/store/useWorkspaceView";
import ViewTaskDialog from "@/features/projectWorkSpace/components/Task/ViewTaskDialog";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { useGetProjectById } from "@/features/projects/hooks/useGetProjectById";
import { projectDotClass } from "@/features/projects/hooks/useNavProjects";
import ActiveMembersDisplay from "@/features/teamMember/components/ActiveMembersDisplay";
import AddMemberDialog from "@/features/teamMember/components/AddMemberDialog";
import ChangeRoleDialog from "@/features/teamMember/components/ChangeRoleDialog";
import ProjectTeamPage from "@/features/teamMember/components/ProjectTeamPage";
import RemoveMemberDialog from "@/features/teamMember/components/RemoveMemberDialog";
import ViewMemberProfileDialog from "@/features/teamMember/components/ViewMemberProfileDialog";

type View = WorkspaceView;

const views: { id: View; label: string; icon: typeof SquareKanban }[] = [
    { id: "board", label: "Board", icon: SquareKanban },
    { id: "list", label: "My list", icon: ListChecks },
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "team", label: "Team", icon: Users },
    { id: "notes", label: "Notes", icon: NotebookText },
];

const settingsView = { id: "settings" as View, label: "Settings", icon: Settings };

const VIEW_IDS: View[] = ["board", "list", "calendar", "team", "notes", "settings"];

/** Messages for where "Add to Discord" sent the person back to. */
const discordResults: Record<string, { ok: boolean; text: string }> = {
    connected: { ok: true, text: "Discord connected. Now pick the channel FocusFlow should post in." },
    cancelled: { ok: false, text: "Connecting Discord was cancelled." },
    forbidden: { ok: false, text: "Only project owners and admins can connect Discord." },
    failed: { ok: false, text: "Discord didn’t confirm the server. Try again." },
};

type WorkspaceSearch = { view?: string; task?: string; note?: string; discord?: string };

const ProjectWorkspace = () => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const activeView = useWorkspaceViewStore((state) => state.view);
    const setActiveView = useWorkspaceViewStore((state) => state.setView);
    const openNote = useWorkspaceViewStore((state) => state.openNote);
    const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
    const search = useSearch({ strict: false }) as WorkspaceSearch;
    const { user } = useAuthContext();
    const { data: members } = useGetMembers(projectId || "");
    // The server also sends "owner", which the shared role type leaves out.
    const myRole: string | undefined = members?.find((member) => member.user._id === user?._id)?.role;
    const canManage = myRole === "owner" || myRole === "admin";
    const shownViews = canManage ? [...views, settingsView] : views;

    // Links from Discord and the "Add to Discord" return open a task, a note, or a tab, once.
    useEffect(() => {
        const { view, task, note, discord } = search;
        if (!view && !task && !note && !discord) return;
        if (note) openNote(note);
        else if (view && VIEW_IDS.includes(view as View)) setActiveView(view as View);
        if (task) setViewTaskId(task);
        if (discord) {
            const result = discordResults[discord];
            if (result) (result.ok ? toast.success : toast.error)(result.text);
        }
        window.history.replaceState(window.history.state, "", window.location.pathname);
    }, [search, openNote, setActiveView, setViewTaskId]);
    const { data: project, isLoading } = useGetProjectById(projectId || "");
    const setAgendaDrawerOpen = useShellStore((state) => state.setAgendaDrawerOpen);

    return (
        <AppShell dock projectId={projectId}>
            <div className="border-b bg-card">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 pt-5 sm:px-6 lg:px-8">
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                        {isLoading ? (
                            <Skeleton className="h-7 w-56" />
                        ) : (
                            <>
                                <span aria-hidden="true" className={cn("size-3 shrink-0 rounded", projectDotClass(project?.color))} />
                                <h1 className="truncate text-xl font-semibold tracking-tight text-foreground sm:text-2xl" title={project?.name}>
                                    {project?.name ?? "Project"}
                                </h1>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:block"><ActiveMembersDisplay /></div>
                        <ProjectActivityDialog />
                    </div>
                </div>

                <div className="flex items-end justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div role="tablist" aria-label="Project views" className="-mb-px flex gap-1 overflow-x-auto">
                        {shownViews.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                role="tab"
                                aria-selected={activeView === id}
                                onClick={() => setActiveView(id)}
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
                        onClick={() => setAgendaDrawerOpen(true)}
                        className="mb-1.5 flex h-8 shrink-0 items-center gap-2 rounded-md border px-2.5 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-2 lg:hidden"
                    >
                        <ListTodo className="size-4" />
                        <span className="sm:hidden">Agenda</span>
                        <span className="hidden sm:inline">My agenda</span>
                    </button>
                </div>
            </div>

            {activeView === "board" && <KanbanBoard />}
            {activeView === "list" && <ProjectList />}
            {activeView === "team" && <ProjectTeamPage />}
            {activeView === "calendar" && projectId && <ProjectCalendar projectId={projectId} />}
            {activeView === "notes" && projectId && <ProjectNotes projectId={projectId} />}
            {activeView === "settings" && projectId && (canManage ? <ProjectSettings projectId={projectId} /> : members && <p className="app-content text-sm text-muted-foreground">Only project owners and admins can open settings.</p>)}
            <ViewTaskDialog />
            <AddMemberDialog />
            <RemoveMemberDialog />
            <ChangeRoleDialog />
            <ViewMemberProfileDialog />
        </AppShell>
    );
};

export default ProjectWorkspace;
