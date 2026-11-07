import { CalendarDays, ListTodo, NotebookText, SquareKanban, Users } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { useShellStore } from "@/components/layout/shellStore";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import KanbanBoard from "@/features/projectWorkSpace/components/Board/KanbanBoard";
import ProjectActivityDialog from "@/features/projectWorkSpace/components/Activity/ProjectActivityDialog";
import ProjectCalendar from "@/features/projectWorkSpace/components/Calendar/ProjectCalendar";
import ProjectNotes from "@/features/projectWorkSpace/components/Notes/ProjectNotes";
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
    { id: "calendar", label: "Calendar", icon: CalendarDays },
    { id: "team", label: "Team", icon: Users },
    { id: "notes", label: "Notes", icon: NotebookText },
];

const ProjectWorkspace = () => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const activeView = useWorkspaceViewStore((state) => state.view);
    const setActiveView = useWorkspaceViewStore((state) => state.setView);
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
                        {views.map(({ id, label, icon: Icon }) => (
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
            {activeView === "team" && <ProjectTeamPage />}
            {activeView === "calendar" && projectId && <ProjectCalendar projectId={projectId} />}
            {activeView === "notes" && projectId && <ProjectNotes projectId={projectId} />}
            <ViewTaskDialog />
            <AddMemberDialog />
            <RemoveMemberDialog />
            <ChangeRoleDialog />
            <ViewMemberProfileDialog />
        </AppShell>
    );
};

export default ProjectWorkspace;
