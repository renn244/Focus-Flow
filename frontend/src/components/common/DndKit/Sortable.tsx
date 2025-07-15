import { DndContext, type DragEndEvent, type DragOverEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

type SortableProps<T extends Record<string, any>> = {
    dataKey: keyof T;
    items: T[];
    onChange: (data: T[]) => void;
    renderItem: (item: T, index: number) => ReactNode;
} & Omit<ComponentProps<typeof SortableContext>, 'children'> 

const Sortable = <T extends Record<string, any>>({
    dataKey, items, 
    onChange, renderItem,
    ...props
}: SortableProps<T>) => {
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
        
        if(active.id !== over?.id) {
            const ids = currentData?.map((item: any) => item[dataKey]) as string[] || [];
            const oldIndex = ids.indexOf(active.id as string);
            const newIndex = ids.indexOf(over?.id as string);
            
            const newColumns = arrayMove(currentData || [], oldIndex, newIndex);
            const orderedData = newColumns.sort((a, b) => a[dataKey] - b[dataKey]);

            setExpectedData(orderedData);
        }
    }

    return (
        <DndContext
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        >
            <SortableContext 
            items={currentData.map(i => i[dataKey])} {...props}>
                {currentData.map((item, idx) => {
                    return renderItem(item, idx)
                })}
            </SortableContext>
        </DndContext>
    )
}

export default Sortable