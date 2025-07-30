import ColumnCard from "@/features/projectWorkSpace/components/Column/ColumnCard";
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type";
import { DndContext, DragOverlay, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

type SortableProps<T extends Record<string, any>> = {
    dataKey: keyof T;
    items: T[];
    onChange: (data: T[]) => void;
    renderItem: (item: T, index: number, isOverlay?: boolean) => ReactNode;
} & Omit<ComponentProps<typeof SortableContext>, 'children' | 'items'> 

const Sortable = <T extends Record<string, any>>({
    dataKey, items, 
    onChange, renderItem,
    ...props
}: SortableProps<T>) => {
    const [activeColumn, setActiveColumn] = useState<any>(null);
    const [expectedData, setExpectedData] = useState<T[] | null>(null);
    const [currentData, setCurrentData] = useState<T[]>(items || []);

    useEffect(() => {
        setCurrentData(items || [])
    }, [items])

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        
        if(active.id !== over?.id) {
            setCurrentData(expectedData || []);
            onChange(expectedData || []);
        }
    }

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        // for dragging task over columns
        if(active.data.current?.type === 'task' && over) {
            const taskId = active.id; // task Id also
            const taskCurrentColumnId = active.data.current.columnId; // current column Id
            const columnId = over.id; // future columnId

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
                        tasks: [...item.tasks, task]
                    }
                }
                return item;
            })

            setExpectedData(addedTask);

            return
        }

        // for dragging columns over each other
        if(active.id !== over?.id) {
            const ids = currentData?.map((item: any) => item[dataKey]) as string[] || [];
            const oldIndex = ids.indexOf(active.id as string);
            const newIndex = ids.indexOf(over?.id as string);
            
            const newColumns = arrayMove(currentData || [], oldIndex, newIndex);
            const orderedData = newColumns.sort((a, b) => a[dataKey] - b[dataKey]);

            setExpectedData(orderedData);
        }
    }

    const onDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const column = currentData.find((item) => item._id === active.id);

        setActiveColumn(column);
    }

    return (
        <DndContext
        // Won't be able to reach this
        onDragStart={onDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        >
            <SortableContext 
            items={currentData.map(i => i[dataKey])} {...props}>
                {currentData.map((item, idx) => {
                    return renderItem(item, idx)
                })}
            </SortableContext>

            <DragOverlay>
                {activeColumn ? <ColumnCard column={activeColumn} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    )
}

export default Sortable