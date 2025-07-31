import Sortable from "@/components/common/DndKit/Sortable";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import { useReorderColumnMutation } from "../../hooks/Column/useReorderColumnMutation";
import { useTaskMovedMutation } from "../../hooks/Task/useTaskMovedMutation";
import useSelectBoardStore from "../../store/useSelectBoard";
import type { ColumnWithTasks } from "../../type";
import ColumnCard from "../Column/ColumnCard";
import CreateColumnDialog from "../Column/CreateColumnDialog";
import EditColumnDialog from "../Column/EditColumnDialog";
import RemoveColumnDialog from "../Column/RemoveColumnDialog";
import CreateTaskDialog from "../Task/CreateTaskDialog";
import EditTaskDialog from "../Task/EditTaskDialog";
import RemoveTaskDialog from "../Task/RemoveTaskDialog";
import ViewTaskDialog from "../Task/ViewTaskDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader";
import transformReorderColumn from "../../utils/transformReorderColumn";

type KanbanBoardProps = {
}

const KanbanBoard = ({
}: KanbanBoardProps) => {
    const selectBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const { data: columns } = useGetColumnByBoardId(selectBoardId || "");
    const { mutateAsync: reorderColumn } = useReorderColumnMutation(selectBoardId || "");
    const { mutateAsync: moveTask } = useTaskMovedMutation();

    return (
        <div className="p-6">

            <KanbanBoardHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen">

                <Sortable<ColumnWithTasks>
                items={columns || []} dataKey="_id" 
                onChange={async (fnType, data) => {
                    if(fnType === "movedTask") {
                        await moveTask(data);
                    } else if(fnType === "reorderedColumns") {
                        await reorderColumn(transformReorderColumn(data));
                    }
                }}
                strategy={horizontalListSortingStrategy}    
                renderItem={(item, _, isOverlay) => <ColumnCard key={item._id} column={item as any} isOverlay={isOverlay} /> }
                />

                <CreateColumnDialog />

                <EditColumnDialog />

                <RemoveColumnDialog />
            </div>

            {/* Board Dialog */}
            <CreateBoardDialog />

            {/* Task Dialog */}
            <ViewTaskDialog />

            <CreateTaskDialog />

            <EditTaskDialog />

            <RemoveTaskDialog />
        </div>
    )
}

export default KanbanBoard