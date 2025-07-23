import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react"
import type { Task } from "../../type";
import useTaskDialogStore from "../../store/useTaskDialog";

type TaskOptionsProps = {
    taskId: Task['_id'];
}

const TaskOptions = ({
    taskId
}: TaskOptionsProps) => {
    const [open, setOpen] = useState<boolean>(false);

    const setEditTaskId = useTaskDialogStore((state) => state.setEditTaskId);
    const setRemoveTaskId = useTaskDialogStore((state) => state.setRemoveTaskId);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>
                    <Eye className="h-4 w-4" />
                    View task
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setEditTaskId(taskId)}>
                    <Edit className="h-4 w-4" />
                    Edit task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRemoveTaskId(taskId)}
                className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 text-red-600" />
                    Remove task
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default TaskOptions