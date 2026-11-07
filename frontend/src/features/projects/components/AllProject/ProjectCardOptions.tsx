import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Archive, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import useProjectDialogStore from "../../store/useProjectDialog";
import type { Project } from "../../type";

type ProjectCardOptionsProps = {
    projectId: Project['_id'];
}

const ProjectCardOptions = ({
    projectId
}: ProjectCardOptionsProps) => {
    const setEditProjectId = useProjectDialogStore((state) => state.setEditProjectId);
    const setViewProjectId = useProjectDialogStore((state) => state.setViewProjectId);
    const setArchiveProjectId = useProjectDialogStore((state) => state.setArchiveProjectId)
    const setDeleteProjectId = useProjectDialogStore((state) => state.setDeleteProjectId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground" aria-label="Project options" title="Project options">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setViewProjectId(projectId)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditProjectId(projectId)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setArchiveProjectId(projectId)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDeleteProjectId(projectId)}
                className="text-red-600 focus:text-red-600">
                    <Trash2 className="w-4 h-4 mr-2 text-red-600" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ProjectCardOptions
