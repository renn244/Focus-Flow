import Sortable from "@/components/common/DndKit/Sortable";
import { arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import { useReorderColumnMutation } from "../../hooks/Column/useReorderColumnMutation";
import { useTaskMovedMutation } from "../../hooks/Task/useTaskMovedMutation";
import useSelectBoardStore from "../../store/useSelectBoard";
import type { ColumnWithTasks, TaskWithBoardAndColumn } from "../../type";
import transformReorderColumn from "../../utils/transformReorderColumn";
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
import TeamManagement from "@/features/teamMember/components/TeamManagement";
import AddMemberDialog from "@/features/teamMember/components/AddMemberDialog";

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
                onDragEnd={(event, { onChange, setCurrentData, expectedData }) => {
                    const { active, over } = event;

                    if(active.data.current?.type === 'task' && over) {
                        const taskId = active.id; // task Id also
                        const taskCurrentColumnId = active.data.current.columnId; // current column Id
                        const taskFutureColumnId = over.id; // future columnId

                        if(taskCurrentColumnId === taskFutureColumnId) return;

                        onChange('movedTask', { taskId, taskCurrentColumnId, taskFutureColumnId })
                        setCurrentData(expectedData || []);
                    } else if(active.id !== over?.id) {
                        onChange('reorderedColumns', expectedData || []);
                        setCurrentData(expectedData || []);
                    }
                }}
                onDragOver={(event, { currentData, setExpectedData, dataKey }) => {
                    const { active, over } = event;
                    
                    // for dragging task over columns
                    if(active.data.current?.type === 'task' && over) {
                        const taskId = active.id; // task Id also
                        const taskCurrentColumnId = active.data.current.columnId; // current column Id
                        const columnId = over.id; // future columnId
            
                        if(taskCurrentColumnId === columnId) return;
            
                        // get the task data
                        const columns = currentData.find((item) => item._id === taskCurrentColumnId);
                        const task = columns?.tasks.find((task: TaskWithBoardAndColumn) => task._id === taskId);
            
                        // and then remove the task from the column
                        const removedTask = currentData.map((item) => {
                            if(item._id === taskCurrentColumnId) {
                                return {
                                    ...item,
                                    tasks: item.tasks.filter((task: TaskWithBoardAndColumn) => task._id !== taskId)
                                }
                            }
                            return item;
                        })
            
                        // then add the task to the column where its being dragged into
                        const addedTask = removedTask.map((item) => {
                            if(item._id === columnId) {
                                return {
                                    ...item,
                                    tasks: task ? [...item.tasks, task] : [...item.tasks]
                                }
                            }
                            return item;
                        })
            
                        setExpectedData(addedTask);
            
                        return
                    }
            
                    // if we are sorting from column to column, both active and over have sortable
                    // for dragging columns over each other
                    if(active.id !== over?.id) {
                        const ids = currentData?.map((item) => item[dataKey]) as string[] || [];
                        const oldIndex = ids.indexOf(active.id as string);
                        const newIndex = ids.indexOf(over?.id as string);
                        
                        const newColumns = arrayMove(currentData || [], oldIndex, newIndex);

                        setExpectedData(newColumns);
                    }
                }}
                onDragStart={(event, { currentData, setActiveItem }) => {
                    const { active } = event;

                    if(active.data.current?.type === 'column') {
                        const column = currentData.find((item) => item._id === active.id);
                        setActiveItem(column);
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

            {/* Team Member */}
            <TeamManagement />

            <AddMemberDialog />
        </div>
    )
}

export default KanbanBoard