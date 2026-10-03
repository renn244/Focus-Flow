import MainNav from "@/components/common/Nav/MainNav";
import KanbanBoard from "../../../features/projectWorkSpace/components/Board/KanbanBoard";
import { CalendarDays, Clipboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import ActiveMembersDisplay from "@/features/teamMember/components/ActiveMembersDisplay";
import AddMemberDialog from "@/features/teamMember/components/AddMemberDialog";
import ChangeRoleDialog from "@/features/teamMember/components/ChangeRoleDialog";
import ProjectTeamPage from "@/features/teamMember/components/ProjectTeamPage";
import RemoveMemberDialog from "@/features/teamMember/components/RemoveMemberDialog";
import ViewMemberProfileDialog from "@/features/teamMember/components/ViewMemberProfileDialog";
import ProjectActivityDialog from "@/features/projectWorkSpace/components/Activity/ProjectActivityDialog";
import ProjectCalendar from "@/features/projectWorkSpace/components/Calendar/ProjectCalendar";
import ViewTaskDialog from "@/features/projectWorkSpace/components/Task/ViewTaskDialog";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { useState } from "react";

type ProjectWorkspaceProps = {
}

const ProjectWorkspace = ({
}: ProjectWorkspaceProps) => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const [activeView, setActiveView] = useState<"board" | "team" | "calendar">("board");

    return (
        <div className="min-h-screen max-w-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <MainNav>
                <Button variant={activeView === "board" ? "secondary" : "ghost"} size="sm" className="text-slate-600" onClick={() => setActiveView("board")}>
                    <Clipboard className="w-4 h-4" />
                    Board
                </Button>
                <Button variant={activeView === "team" ? "secondary" : "ghost"} size="sm" className="text-slate-600" onClick={() => setActiveView("team")}>
                    <Users className="w-4 h-4" />
                    Team
                </Button>
                <Button variant={activeView === "calendar" ? "secondary" : "ghost"} size="sm" className="text-slate-600" onClick={() => setActiveView("calendar")}>
                    <CalendarDays className="w-4 h-4" />
                    Calendar
                </Button>
                <ProjectActivityDialog />

                <ActiveMembersDisplay />
            </MainNav>

            {activeView === "board" && <KanbanBoard />}
            {activeView === "team" && <ProjectTeamPage />}
            {activeView === "calendar" && projectId && <ProjectCalendar projectId={projectId} />}
            <ViewTaskDialog />
            <AddMemberDialog />
            <RemoveMemberDialog />
            <ChangeRoleDialog />
            <ViewMemberProfileDialog />
        </div>
    )
}

export default ProjectWorkspace
