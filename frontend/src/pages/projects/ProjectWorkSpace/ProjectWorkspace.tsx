import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";
import { toast } from "sonner";
import AppShell from "@/components/layout/AppShell";
import { useShellStore } from "@/components/layout/shellStore";
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
import WorkspaceHeader, { settingsView, workspaceViews } from "@/features/projectWorkSpace/components/WorkspaceHeader";
import ViewTaskDialog from "@/features/projectWorkSpace/components/Task/ViewTaskDialog";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { useGetProjectById } from "@/features/projects/hooks/useGetProjectById";
import ActiveMembersDisplay from "@/features/teamMember/components/ActiveMembersDisplay";
import AddMemberDialog from "@/features/teamMember/components/AddMemberDialog";
import ChangeRoleDialog from "@/features/teamMember/components/ChangeRoleDialog";
import ProjectTeamPage from "@/features/teamMember/components/ProjectTeamPage";
import RemoveMemberDialog from "@/features/teamMember/components/RemoveMemberDialog";
import ViewMemberProfileDialog from "@/features/teamMember/components/ViewMemberProfileDialog";

type View = WorkspaceView;

const views = workspaceViews;

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
            <WorkspaceHeader
                name={project?.name}
                color={project?.color}
                loading={isLoading}
                views={shownViews}
                activeView={activeView}
                onSelectView={setActiveView}
                onOpenAgenda={() => setAgendaDrawerOpen(true)}
                actions={
                    <>
                        <div className="hidden sm:block"><ActiveMembersDisplay /></div>
                        <ProjectActivityDialog />
                    </>
                }
            />

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
