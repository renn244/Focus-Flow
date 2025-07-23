import { Alert, AlertDescription } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Calendar, Clock, Flag, Tag, Trash2, User } from "lucide-react"
import useTaskDialogStore from "../../store/useTaskDialog"
import { useGetTaskById } from "../../hooks/Task/useGetTaskById"
import type { Task } from "../../type"
import { useState } from "react"
import { priorityColors } from "../../constant/priorityColors"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog"
import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { useDeleteTaskMutation } from "../../hooks/Task/useDeleteTaskMutation"

const RemoveTaskDialog = () => {
    const isRemoveOpen = useTaskDialogStore((state) => state.isRemoveOpen);
    const setRemoveOpen = useTaskDialogStore((state) => state.setRemoveOpen);
    const removeTaskId = useTaskDialogStore((state) => state.removeTaskId);

    const { data: task, isLoading, error, refetch, isRefetching } = useGetTaskById(removeTaskId);

    if(isRemoveOpen === false || !removeTaskId) {
        return null;
    }

    return (
        <Dialog open={isRemoveOpen} onOpenChange={setRemoveOpen}>
            <DialogContent className="max-w-2xl min-w-xl gap-0">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog 
                    onBack={() => setRemoveOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    />
                )}
                {(!task || isLoading || error) && (
                    <NotFoundDialog 
                    onBack={() => setRemoveOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Task Not Found"
                    />
                )}
                {task && (
                    <RemoveTask task={task} />
                )}
            </DialogContent>
        </Dialog>
    )
}

type RemoveTaskProps = {
    task: Task;
}

const RemoveTask = ({
    task,
}: RemoveTaskProps) => {
    const [reason, setReason] = useState("");
    const [confirmationText, setConfirmationText] = useState("");

    const setRemoveOpen = useTaskDialogStore((state) => state.setRemoveOpen);

    const isConfirmationValid = confirmationText === task.title;
    const isOverdue = task.dueDate ? new Date(task.dueDate) < new Date() : false;
    const hasHighImpact = task.priority === "high"; // add other things that make it high impact later on

    const { mutateAsync: removeTask, isPending: isRemoving } = useDeleteTaskMutation(task._id, task.columnId);

    return (
        <>
            <DialogHeader className="pb-4">
                <DialogTitle className="flex items-center gap-2 text-red-700">
                    Remove Task
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">

                <div className="bg-gray-100 p-2 rounded-lg space-y-2">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                <Badge variant="outline" className="text-xs font-mono">
                                    {task._id}
                                </Badge>
                            </div>
                            {task.description && <p className="text-sm text-gray-600 mb-1 line-clamp-2">{task.description}</p>}
                        </div>
                        <div className="flex flex-col gap-2">
                            {hasHighImpact && (
                                <Badge variant="destructive" className="text-xs">
                                    High Impact
                                </Badge>
                            )}
                            {isOverdue && (
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                                    Overdue
                                </Badge>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <Flag className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Priority:</span>
                                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                                    {task.priority}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Assignee:</span>
                                {/* <div className="flex items-center gap-1">
                                    <Avatar className="w-5 h-5">
                                        <AvatarImage src={task.assignee.avatar || "/placeholder.svg"} alt={task.assignee.name} />
                                        <AvatarFallback className="text-xs">{task.assignee.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium text-gray-900">{task.assignee.name}</span>
                                </div> */}
                            </div>
                        </div>
                        <div className="space-y-2">
                            {task.dueDate && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <span className="text-gray-600">Due Date:</span>
                                    <span className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900"}`}>
                                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Updated:</span>
                                <span className="font-medium text-gray-900">{format(new Date(task.updatedAt), 'MMM dd, yyyy')}</span>
                            </div>
                        </div>
                    </div>

                    {(task.tags && task.tags.length > 0) && (
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-500" />
                            <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center gap-4 pt-2 border-t border-gray-200">
                        {/* <div className="text-center">
                            <div className="text-lg font-bold text-blue-600">{task.comments}</div>
                            <div className="text-xs text-gray-600">Comments</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600">{task.attachments}</div>
                            <div className="text-xs text-gray-600">Attachments</div>
                        </div> */}
                        <div className="text-center">
                            <div className="text-lg font-bold text-purple-600">
                                {Math.floor((new Date().getTime() - new Date(task.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                            </div>
                            <div className="text-xs text-gray-600">Days Active</div>
                        </div>
                    </div>
                </div>

                {hasHighImpact && (
                    <Alert className="border-amber-200 bg-amber-50">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                            <strong>High Impact Task:</strong> This task has significant activity or high priority. Consider
                            archiving instead of permanent deletion.
                        </AlertDescription>
                    </Alert>
                )}


                <div className="space-y-2">
                    <Label htmlFor="reason" className="text-sm font-medium">
                        Reason for deletion (optional)
                    </Label>
                    <Textarea
                    id="reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Why is this task being deleted?"
                    className="focus:ring-2 focus:ring-blue-500 max-h-[300px]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="confirmation" className="text-sm font-medium">
                        Type <span className="font-mono bg-gray-100 px-1 rounded">{task.title}</span> to confirm
                    </Label>
                    <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Type "${task.title}" here`}
                    className={`focus:ring-2 ${
                        confirmationText && !isConfirmationValid ? "border-red-300 focus:ring-red-500" : "focus:ring-blue-500"
                    }`}
                    />
                    {confirmationText && !isConfirmationValid && (
                        <p className="text-sm text-red-600">Please type the exact task title to confirm</p>
                    )}
                </div>

                {isConfirmationValid && (
                    <Alert className="border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <strong>Final Warning:</strong> This task and all its data will be permanently removed. This action
                            cannot be undone.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-3 pt-2">
                    <Button 
                    variant="outline" 
                    onClick={() => setRemoveOpen(false)} 
                    disabled={isRemoving}
                    className="flex-1"
                    >
                        Cancel 
                    </Button>
                    <Button
                    onClick={() => removeTask()}
                    disabled={isRemoving}
                    variant="destructive"
                    className="flex-1"
                    >
                        {isRemoving ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Task
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default RemoveTaskDialog