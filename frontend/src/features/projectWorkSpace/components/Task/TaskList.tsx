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
    className={`flex-1 space-y-3 min-h-[200px] ${isOver ? 'ring-2 ring-blue-500 rounded-lg' : ''}`}>
      {column.tasks?.map((task) => (
        <TaskCard key={task._id} columnId={column._id} task={task} />
      ))}
    </div>
  )
}

export default memo(TaskList)