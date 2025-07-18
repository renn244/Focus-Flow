import { Clock, Flag, MessageSquare, Paperclip } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import TaskOptions from "./TaskOptions"
import { Badge } from "@/components/ui/badge"
import type { Task } from "../../type"

const priorityColors = {
    low: "bg-green-100 text-green-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
}

type TaskCardProps = {
    task: Task
}

const TaskCard = ({
    task
}: TaskCardProps) => {
    return (
        <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer group gap-0">
            <CardHeader className="pb-0">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <Badge className="text-xs font-mono">
                            {task._id}
                        </Badge>
                        <Badge className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                            <Flag className="w-3 h-3 mr-1" />
                            {task.priority}
                        </Badge>
                    </div>
                    <TaskOptions />
                </div>
            </CardHeader>
            <CardContent className="pt-0">
                <h3 className="font-semibold text-sm mb-2 line-clamp-2">{task.title}</h3>
                {task.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>}

                <div className="flex flex-wrap gap-1 mb-3">
                    {task.tags.map((tag, index) => (
                        <Badge key={index} className="text-xs">
                            {tag}
                        </Badge>
                    ))}
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                            <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {task.dueDate}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
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
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default TaskCard