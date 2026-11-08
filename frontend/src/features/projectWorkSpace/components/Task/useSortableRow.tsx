import type { CSSProperties } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";

/** Wires one row into the list. Spread `handleProps` on the grip, `rowProps` on the row. */
export const useSortableRow = (id: string, label: string) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    position: "relative",
    zIndex: isDragging ? 10 : undefined,
  };

  return {
    isDragging,
    rowProps: { ref: setNodeRef, style },
    handle: (
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Move ${label}`}
        title="Drag to reorder"
        className={cn(
          "-ml-1 flex h-5 w-4 shrink-0 cursor-grab touch-none items-center justify-center rounded text-muted-foreground opacity-0 focus-visible:opacity-100 focus-visible:outline-2 group-hover:opacity-100 active:cursor-grabbing [@media(pointer:coarse)]:opacity-60",
          isDragging && "opacity-100"
        )}
      >
        <GripVertical className="size-3.5" />
      </button>
    ),
  };
};
