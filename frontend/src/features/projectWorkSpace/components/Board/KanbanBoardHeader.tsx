import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useGetBoardById } from "../../hooks/Board/useGetBoardById"; 
import { useGetBoards } from "../../hooks/Board/useGetBoards"; 
import useBoardDialogStore from "../../store/useBoardDialog";
import { useProjectIdStore } from "../../store/useProjectId";
import useSelectBoardStore from "../../store/useSelectBoard";
import DeleteBoardDialog from "./DeleteBoardDialog";
import EditBoardDialog from "./EditBoardDialog";
import SwitchBoard from "./SwitchBoard";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import useTaskDialogStore from "../../store/useTaskDialog";
import { useBoardSocket } from "../../hooks/Board/useBoardSocket";
import CreateColumnDialog from "../Column/CreateColumnDialog";

const KanbanBoardHeader = () => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const setSelectedBoardId = useSelectBoardStore((state) => state.setSelectedBoardId);

    const setCreateOpen = useBoardDialogStore((state) => state.setCreateOpen);
    const setEditBoardId = useBoardDialogStore((state) => state.setEditBoardId);
    const setDeleteBoardId = useBoardDialogStore((state) => state.setDeleteBoardId);

    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    
    const { data: boards, isLoading: isLoadingBoards } = useGetBoards(projectId!);
    const { data: board, isLoading: isLoadingBoard } = useGetBoardById(selectedBoardId || boards?.[0]?._id || "");
    const { data: columns } = useGetColumnByBoardId(selectedBoardId || "");
    const setCreateColumnId = useTaskDialogStore((state) => state.setCreateColumnId);

    useBoardSocket(projectId);

    useEffect(() => {
        if (boards && boards.length > 0 && !selectedBoardId) {
            setSelectedBoardId(boards[0]._id);
        }

        const isBoardExists = boards?.some(board => board._id === selectedBoardId);
        if((!isBoardExists && !isLoadingBoard)) {
            setSelectedBoardId(boards?.[0]?._id);
        }
    }, [selectedBoardId, projectId, boards])

    if (isLoadingBoards || isLoadingBoard) return (
        <div role="status" aria-busy="true" className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <span className="sr-only">Loading board</span>
            <div aria-hidden="true" className="space-y-2"><Skeleton className="h-7 w-48" /><Skeleton className="h-4 w-60" /></div>
            <Skeleton aria-hidden="true" className="h-9 w-24" />
        </div>
    );

    if (!boards?.length) return (
        <div className="mb-5 flex flex-col items-start gap-3 rounded-xl border border-dashed bg-card px-6 py-8">
            <h2 className="text-lg font-semibold text-foreground">This project has no boards yet</h2>
            <p className="max-w-md text-sm text-muted-foreground">A board holds your columns and tasks. Create one for a sprint, a module, or the whole project.</p>
            <Button onClick={() => setCreateOpen(true)}><Plus /> Create a board</Button>
        </div>
    );

    const firstColumnId = columns?.[0]?._id;

    return (
        <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
            <div className="flex min-w-0 flex-1 items-center gap-1">
                <div className="-ml-2 min-w-0">
                    <SwitchBoard boards={boards} currentName={board?.name} onCreate={() => setCreateOpen(true)} />
                </div>
                {board && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-8 shrink-0 text-muted-foreground" aria-label="Board options" title="Board options">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => setEditBoardId(board._id)}>
                                <Edit className="h-4 w-4" />
                                Edit board
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setDeleteBoardId(board._id)}
                            className="text-red-600 focus:text-red-600">
                                <Trash2 className="h-4 w-4 text-red-600" />
                                Delete board
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
                {board?.description && <p className="ml-2 hidden min-w-0 truncate text-sm text-muted-foreground md:block" title={board.description}>{board.description}</p>}
            </div>

            <CreateColumnDialog />

            <Button
                onClick={() => firstColumnId && setCreateColumnId(firstColumnId)}
                disabled={!firstColumnId}
                title={firstColumnId ? "Add a task to the first column" : "Add a column first"}
            >
                <Plus />
                New task
            </Button>

            {/* Dialogs */}
            {board && <EditBoardDialog board={board} />}

            {board && <DeleteBoardDialog />}
        </div>
    )
}

export default KanbanBoardHeader
