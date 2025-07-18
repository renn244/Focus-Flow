import { Button } from "@/components/ui/button"
import { GripVertical, Plus } from "lucide-react"
import BoardCardOptions from "./ColumnCardOptions"
import TaskCard from "../Task/TaskCard"
import { Badge } from "@/components/ui/badge"
import { CSS } from "@dnd-kit/utilities"
import { useSortable } from "@dnd-kit/sortable"
import useTaskDialogStore from "../../store/useTaskDialog"
import type { Column } from "../../type"

type ColumnCardProps = {
    column: Column
}

const ColumnCard = ({
    column
}: ColumnCardProps) => {
    const setCreateColumnId = useTaskDialogStore((state) => state.setCreateColumnId);

    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: column._id })
    const style = { transform: CSS.Translate.toString(transform), transition, duration: "0.5s" }

    return (
        <div ref={setNodeRef} key={column._id} className="flex flex-col" style={style}>
            <div 
            // can't use this it looks ugly tbh so find a way to lighten the color
            // style={{ backgroundColor: column.color }}
            className={`bg-gray-300/50 bg-opacity-50 rounded-lg p-4 mb-4`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-slate-800">{column.title}</h2>
                        <Badge variant="secondary" className="text-xs">
                            {column.tasks.length}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" {...listeners} {...attributes}>
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <BoardCardOptions columnId={column._id} />
                    </div>
                </div>

                <Button onClick={() => setCreateColumnId(column._id)}
                variant="ghost"
                className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-white/50"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add task
                </Button>
            </div>

            {/* <div className="flex-1 space-y-3">
                {column.tasks.map((task: any) => (
                    <TaskCard key={task.id} task={task} />
                ))}
            </div> */}
        </div>
    )
}

export default ColumnCard