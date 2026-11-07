import { useDroppable } from "@dnd-kit/core"
import { memo } from "react"
import type { ColumnWithTasks } from "../../type"
import TaskCard from "./TaskCard"

type TaskListProps = {
  column: ColumnWithTasks
}

const TaskList = ({ column }: TaskListProps) => {
  const { setNodeRef: droppableNode, isOver } = useDroppable({
    id: column._id,
    data: { type: "taskContainer" }
  })

  return (
    <div 
    ref={droppableNode} 
    className={`min-h-32 flex-1 space-y-2.5 rounded-lg transition-colors ${isOver ? 'bg-blue-500/[0.08] outline-2 outline-dashed outline-blue-400' : ''}`}>
      {column.tasks?.length === 0 && !isOver && (
        <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-muted-foreground">Drop a task here or add one above.</p>
      )}
      {column.tasks?.map((task) => (
        <TaskCard key={task._id} columnId={column._id} task={task} />
      ))}
    </div>
  )
}

export default memo(TaskList)