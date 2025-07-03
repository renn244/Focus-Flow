import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react"
import useProjectDialogStore from "../../store/useProjectDialog";

type ProjectCardOptionsProps = {
    projectId: string;
}

const ProjectCardOptions = ({
    projectId
}: ProjectCardOptionsProps) => {
    const setEditProjectId = useProjectDialogStore((state) => state.setEditProjectId);
    const setViewProjectId = useProjectDialogStore((state) => state.setViewProjectId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
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
                <DropdownMenuItem>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ProjectCardOptions