import Sortable from "@/components/common/DndKit/Sortable";
import { arrayMove, horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import { useReorderColumnMutation } from "../../hooks/Column/useReorderColumnMutation";
import { useSortableColumnViewSocket } from "../../hooks/Column/useSortableColumnViewSocket";
import { useTaskMovedMutation } from "../../hooks/Task/useTaskMovedMutation";
import { useTaskSocket } from "../../hooks/Task/useTaskSocket";
import type { ColumnWithTasks, TaskWithBoardAndColumn } from "../../type";
import transformReorderColumn from "../../utils/transformReorderColumn";
import ColumnCard from "./ColumnCard";
import ColumnSkeleton from "./ColumnSkeleton";
import { Button } from "@/components/ui/button";

type SortableColumnViewProps = {
    boardId: string | null | undefined;
}

const SortableColumnView = ({
    boardId
}: SortableColumnViewProps) => {
    const { data: columns, isLoading, isError, refetch, isFetching } = useGetColumnByBoardId(boardId || "");
    const { mutateAsync: reorderColumn } = useReorderColumnMutation(boardId || "");
    const { mutateAsync: moveTask } = useTaskMovedMutation();

    useSortableColumnViewSocket(boardId);
    useTaskSocket(boardId);

    if (isLoading) return <ColumnSkeleton />;
    if (isError) return (
        <div role="alert" className="col-span-full flex items-center gap-3 py-8">
            <p className="text-sm text-destructive">Board columns could not be loaded.</p>
            <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>Retry</Button>
        </div>
    );

    return (
        <Sortable<ColumnWithTasks>
        items={columns || []} dataKey="_id" 
        onChange={async (fnType, data) => {
            if(fnType === "movedTask") {
                await moveTask(data as Parameters<typeof moveTask>[0]);
            } else if(fnType === "reorderedColumns") {
                await reorderColumn(transformReorderColumn(data as { _id: string }[]));
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
                setActiveItem(column ?? null);
            }
        }}
        strategy={horizontalListSortingStrategy}    
        renderItem={(item, _, isOverlay) => <ColumnCard key={item._id} column={item} isOverlay={isOverlay} /> }
        />
    )
}

export default SortableColumnView
