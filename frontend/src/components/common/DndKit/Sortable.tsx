import { DndContext, DragOverlay, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragOverEvent, type DragStartEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";

type onHandleParams<T = unknown> = {
    dataKey: keyof T;
    expectedData: T[] | null;
    currentData: T[];
    setExpectedData: (data: T[] | null) => void;
    setCurrentData: (data: T[]) => void;

    activeItem: T | null;
    setActiveItem: (item: T | null) => void;

    onChange: (functionType: string, data: unknown) => void;
}

type SortableProps<T extends object> = {
    dataKey: keyof T;
    items: T[];

    onChange: (functionType: string, data: unknown) => void;
    onDragEnd: (event: DragEndEvent, params: onHandleParams<T>) => void;
    onDragOver: (event: DragOverEvent, params: onHandleParams<T>) => void;
    onDragStart: (event: DragStartEvent, params: onHandleParams<T>) => void;

    renderItem: (item: T, index: number, isOverlay?: boolean) => ReactNode;
} & Omit<ComponentProps<typeof SortableContext>, 'children' | 'items'> 

const Sortable = <T extends object>({
    dataKey, items, 
    onChange, renderItem,
    onDragEnd, onDragOver, onDragStart,
    ...props
}: SortableProps<T>) => {
    const [activeItem, setActiveItem] = useState<T | null>(null);

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
            items={currentData.map((i) => i[dataKey] as UniqueIdentifier)} {...props}>
                {currentData.map((item, idx) => {
                    return renderItem(item, idx)
                })}
            </SortableContext>

            <DragOverlay>
                {/* The dragged item is drawn by the same renderItem, flagged as the overlay. */}
                {activeItem ? renderItem(activeItem, -1, true) : null}
            </DragOverlay>
        </DndContext>
    )
}

export default Sortable