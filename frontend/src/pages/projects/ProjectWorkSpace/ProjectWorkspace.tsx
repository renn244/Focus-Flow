import MainNav from "@/components/common/Nav/MainNav";
import KanbanBoard from "../../../features/projectWorkSpace/components/Board/KanbanBoard";

type ProjectWorkspaceProps = {
}

const ProjectWorkspace = ({
}: ProjectWorkspaceProps) => {
    return (
        <div className="min-h-screen max-w-screen bg-gradient-to-br from-slate-50 to-slate-100">
            <MainNav />

            <KanbanBoard />
        </div>
    )
}

export default ProjectWorkspace