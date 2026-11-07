import { Button } from "@/components/ui/button"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus } from "lucide-react"
import useTaskDialogStore from "../../store/useTaskDialog"
import type { ColumnWithTasks } from "../../type"
import TaskList from "../Task/TaskList"
import BoardCardOptions from "./ColumnCardOptions"

type ColumnCardProps = {
    column: ColumnWithTasks,
    isOverlay?: boolean;
}

const ColumnCard = ({
    column, isOverlay = false
}: ColumnCardProps) => {
    const setCreateColumnId = useTaskDialogStore((state) => state.setCreateColumnId);

    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: column._id, data: { type: 'column', columnId: column._id } })
    const style = { transform: CSS.Translate.toString(transform), transition, duration: "0.5s" }

    return (
        <div 
        ref={setNodeRef}
         key={column._id} className={`flex min-w-0 flex-col rounded-xl bg-lane p-3
        ${isOverlay ? 'shadow-[0_12px_32px_rgb(15_23_42/0.18)] ring-1 ring-blue-400' : ''} 
        ${isDragging ? 'z-50 opacity-40' : ''}`} 
        style={style}>
            <div className="mb-2.5">
                <div className="mb-1.5 flex items-center justify-between gap-2 pl-1">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color }} aria-hidden="true" />
                        <h2 className="truncate text-sm font-semibold text-foreground" title={column.title}>{column.title}</h2>
                        <span className="text-xs font-medium text-muted-foreground tabular-nums">{column.tasks.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="icon" className="size-7" variant="ghost" {...listeners} {...attributes} aria-label={`Reorder ${column.title}`} title="Reorder column">
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <BoardCardOptions columnId={column._id} />
                    </div>
                </div>

                <Button onClick={() => setCreateColumnId(column._id)}
                variant="ghost"
                className="h-8 w-full justify-start text-muted-foreground hover:bg-card/70 hover:text-foreground"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                </Button>
            </div>

            <TaskList column={column} />
        </div>
    )
}

export default ColumnCard
