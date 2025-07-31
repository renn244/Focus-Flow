import ColumnCard from "@/features/projectWorkSpace/components/Column/ColumnCard";
import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

type onHandleParams<T = any> = {
    dataKey: keyof T;
    expectedData: T[] | null;
    currentData: T[];
    setExpectedData: (data: T[] | null) => void;
    setCurrentData: (data: T[]) => void;

    activeItem: any;
    setActiveItem: (column: any) => void;

    onChange: (functionType: string, data: any) => void;
}

type SortableProps<T extends Record<string, any>> = {
    dataKey: keyof T;
    items: T[];

    onChange: (functionType: string, data: any) => void;
    onDragEnd: (event: DragEndEvent, params: onHandleParams<T>) => void;
    onDragOver: (event: DragOverEvent, params: onHandleParams<T>) => void;
    onDragStart: (event: DragStartEvent, params: onHandleParams<T>) => void;

    renderItem: (item: T, index: number, isOverlay?: boolean) => ReactNode;
} & Omit<ComponentProps<typeof SortableContext>, 'children' | 'items'> 

const Sortable = <T extends Record<string, any>>({
    dataKey, items, 
    onChange, renderItem,
    onDragEnd, onDragOver, onDragStart,
    ...props
}: SortableProps<T>) => {
    const [activeItem, setActiveItem] = useState<any>(null);

    const [expectedData, setExpectedData] = useState<T[] | null>(null);
    const [currentData, setCurrentData] = useState<T[]>(items || []);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    useEffect(() => {
        setCurrentData(items || [])
    }, [items])

    const handleDragEnd = (event: DragEndEvent) => {
        onDragEnd(event, {
            expectedData, currentData, dataKey,
            setExpectedData, setCurrentData,
            onChange, activeItem, setActiveItem,
        })

        setActiveItem(null);
    }

    const handleDragOver = (event: DragOverEvent) => {
        onDragOver(event, {
            expectedData, currentData, dataKey,
            setExpectedData, setCurrentData,
            onChange, activeItem, setActiveItem,
        })
    }

    const handleDragStart = (event: DragStartEvent) => {
        onDragStart(event, {
            expectedData, currentData, dataKey,
            setExpectedData, setCurrentData,
            onChange, activeItem, setActiveItem,
        })
    }

    return (
        <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
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
                {activeItem ? <ColumnCard column={activeItem} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    )
}

export default Sortable