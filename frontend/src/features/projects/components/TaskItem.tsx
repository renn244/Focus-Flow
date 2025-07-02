import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Target } from "lucide-react"

const TaskItem = ({ task }: { task: any }) => {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded bg-blue-100 flex items-center justify-center">
                    <Target className="w-3 h-3 text-blue-600" />
                </div>
                <div>
                    <h4 className="font-medium text-sm text-gray-900">{task.title}</h4>
                    <p className="text-xs text-gray-500">
                        {task.id} • {task.projectName}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500">To do</span>
                <Avatar className="w-6 h-6">
                    <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                    <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                </Avatar>
            </div>
        </div>
    )
}

export default TaskItem