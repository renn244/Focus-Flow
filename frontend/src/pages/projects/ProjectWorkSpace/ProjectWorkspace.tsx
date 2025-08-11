import MainNav from "@/components/common/Nav/MainNav";
import KanbanBoard from "../../../features/projectWorkSpace/components/Board/KanbanBoard";
import { Calendar, Clipboard, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTeamManagementStore } from "@/features/teamMember/store/TeamManagementStore";

type ProjectWorkspaceProps = {
}

const ProjectWorkspace = ({
}: ProjectWorkspaceProps) => {
    const setIsOpen = useTeamManagementStore((state) => state.setIsOpen);

    return (
        <div className="min-h-screen max-w-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <MainNav>
                <Button variant="ghost" size="sm" className="text-slate-600">
                    <Clipboard className="w-4 h-4 mr-2" />
                    Board
                </Button>
                <Button onClick={() => setIsOpen(true)} variant="ghost" size="sm" className="text-slate-600">
                    <Users className="w-4 h-4 mr-2" />
                    Team
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendar
                </Button>
            </MainNav>

            <KanbanBoard />
        </div>
    )
}

export default ProjectWorkspace