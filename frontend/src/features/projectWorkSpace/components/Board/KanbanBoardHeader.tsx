import { useGetBoards } from "../../hooks/useGetBoards";
import { Button } from "@/components/ui/button"
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useGetBoardById } from "../../hooks/useGetBoardById";
import useBoardDialogStore from "../../store/useBoardDialog";
import { useProjectIdStore } from "../../store/useProjectIdDialog";
import SwitchBoard from "./SwitchBoard";
import useSelectBoardStore from "../../store/useSelectBoard";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EditBoardDialog from "./EditBoardDialog";

type KanbanBoardHeaderProps = {
}

const KanbanBoardHeader = ({
}: KanbanBoardHeaderProps) => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const setCreateOpen = useBoardDialogStore((state) => state.setCreateOpen);
    const setEditBoardId = useBoardDialogStore((state) => state.setEditBoardId);

    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    
    const { data: boards } = useGetBoards(projectId!);    
    const { data: board } = useGetBoardById(selectedBoardId || boards?.[0]?._id || "");

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <div>
                    {board?.name && <h2 className="text-xl font-semibold text-slate-900">{board.name}</h2>}
                    {board?.description && <p className="text-sm text-slate-600">{board.description}</p>}
                </div>
                {board && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setEditBoardId(board._id)}>
                                <Edit className="h-4 w-4" />
                                Edit Board
                            </DropdownMenuItem>
                            <DropdownMenuItem
                            className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 text-red-600" />
                                Delete Board
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            <div className="flex items-center gap-3">
                <SwitchBoard boards={boards || []} />

                <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4" />
                    New Board
                </Button>
            </div>

            {/* Dialogs */}
            {board && <EditBoardDialog board={board} />}
        </div>
    )
}

export default KanbanBoardHeader