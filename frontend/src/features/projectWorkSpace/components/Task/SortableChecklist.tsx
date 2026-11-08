import type { ReactNode } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type Modifier,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

const verticalOnly: Modifier = ({ transform }) => ({ ...transform, x: 0 });

type ListProps = {
  ids: string[];
  /** Called with every id in its new order. */
  onReorder: (ids: string[]) => void;
  children: ReactNode;
};

/** Lets checklist rows be dragged up and down by their grip, or moved with the keyboard. */
export const SortableChecklist = ({ ids, onReorder, children }: ListProps) => {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    // On touch screens, press and hold so scrolling still works.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} modifiers={[verticalOnly]} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
};
