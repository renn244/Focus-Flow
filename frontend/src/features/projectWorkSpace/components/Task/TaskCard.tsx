import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { format } from "date-fns"
import { Clock, Flag, GripVertical } from "lucide-react"
import type { TaskWithBoardAndColumn } from "../../type"
import TaskOptions from "./TaskOptions"

const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
}

type TaskCardProps = {
    task: TaskWithBoardAndColumn,
    columnId: TaskWithBoardAndColumn["_id"];
}

const TaskCard = ({
    task, columnId
}: TaskCardProps) => {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({ 
        id: task._id,
        data: { id: task._id, columnId: columnId, type: "task" }
    })

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return (
        <Card 
        ref={setNodeRef} 
        style={style}
        className="mb-1.5 p-3 hover:shadow-md transition-shadow cursor-pointer group gap-0">
            <CardHeader className="pb-0 mb-0 px-0">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                            <Flag className="w-3 h-3 mr-1"   />   
                            {task.priority}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button className="group-hover:opacity-100 opacity-0 transition-opacity"
                        size="sm" variant="ghost" {...listeners} {...attributes}>
                            <GripVertical className="h-4 w-4" />
                        </Button>
                        <TaskOptions taskId={task._id} />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-0 px-0">
                <h3 className="font-semibold mb-0.5 line-clamp-2">{task.title}</h3>
                {task.description && <p className="text-xs text-muted-foreground mb-2 line-clamp-1">{task.description}</p>}

                <div className="flex flex-wrap gap-1 mb-1.5">
                    {task.tags?.map((tag, index) => (
                        <Badge key={index} className="text-xs p-0.75 px-1.5">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {/* <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                        </Avatar> */}
                        {task.dueDate && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                            </div>
                        )}
                    </div>

                    {/* <div className="flex items-center gap-2">
                        {task.comments > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="w-3 h-3" />
                                {task.comments}
                            </div>
                        )}
                        {task.attachments > 0 && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Paperclip className="w-3 h-3" />
                                {task.attachments}
                            </div>
                        )}
                    </div> */}
                </div>
            </CardContent>
        </Card>
    )
}

export default TaskCard