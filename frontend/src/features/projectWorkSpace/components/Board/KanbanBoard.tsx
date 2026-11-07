import useSelectBoardStore from "../../store/useSelectBoard";
import EditColumnDialog from "../Column/EditColumnDialog";
import RemoveColumnDialog from "../Column/RemoveColumnDialog";
import SortableColumnView from "../Column/SortableColumnView";
import CreateTaskDialog from "../Task/CreateTaskDialog";
import EditTaskDialog from "../Task/EditTaskDialog";
import RemoveTaskDialog from "../Task/RemoveTaskDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader";
import { useGetBoards } from "../../hooks/Board/useGetBoards";
import { useProjectIdStore } from "../../store/useProjectId";
import ColumnSkeleton from "../Column/ColumnSkeleton";
import useColumnDialogStore from "../../store/useColumnDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const KanbanBoard = () => {
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const projectId = useProjectIdStore((state) => state.projectId);
    const setCreateColumnOpen = useColumnDialogStore((state) => state.setCreateOpen);
    const { isLoading } = useGetBoards(projectId || "");

    return (
        <div className="app-content">

            <KanbanBoardHeader />

            <div className="grid grid-cols-1 items-start gap-4 pb-3 sm:grid-cols-2 lg:auto-cols-[minmax(15rem,1fr)] lg:grid-flow-col lg:grid-cols-none lg:overflow-x-auto">

                {isLoading ? <ColumnSkeleton /> : <SortableColumnView boardId={selectedBoardId} />}

                {/* Phones: the board-row button is hidden, so add columns after the last lane. */}
                {!isLoading && selectedBoardId && (
                    <Button variant="outline" onClick={() => setCreateColumnOpen(true)} className="h-12 w-full justify-start border-dashed bg-transparent text-muted-foreground shadow-none hover:bg-card hover:text-foreground sm:hidden">
                        <Plus />
                        Add column
                    </Button>
                )}

                <EditColumnDialog />

                <RemoveColumnDialog />
            </div>

            {/* Board Dialog */}
            <CreateBoardDialog />

            {/* Task Dialog */}
            <CreateTaskDialog />

            <EditTaskDialog />

            <RemoveTaskDialog />

        </div>
    )
}

export default KanbanBoard
