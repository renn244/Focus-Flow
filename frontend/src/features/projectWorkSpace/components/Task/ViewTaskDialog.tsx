import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog";
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ListLoading from "@/components/common/ListLoading";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Calendar, Settings } from "lucide-react";
import { lazy, Suspense } from "react";
import { priorityBadgeVariant } from "../../constant/priorityColors";
import { useGetMembers } from "@/features/teamMember/hooks/useGetMembers";
import { useProjectIdStore } from "../../store/useProjectId";
import { useEditTaskMutation } from "../../hooks/Task/useEditTaskMutation";
import { useGetTaskById } from "../../hooks/Task/useGetTaskById";
import useTaskDialogStore from "../../store/useTaskDialog";
import type { TaskWithBoardAndColumn } from "../../type";
import TaskAssigneeCombobox from "./TaskAssigneeCombobox";
import TaskChecklist from "./TaskChecklist";

const TaskComments = lazy(() => import("./comments/TaskComments"));
const TaskAttachments = lazy(() => import("./attachments/TaskAttachments"));
const TaskMentionedInNotes = lazy(() => import("../Notes/TaskMentionedInNotes"));


const ViewTaskDialog = () => {
    const isViewOpen = useTaskDialogStore((state) => state.isViewOpen);
    const setViewOpen = useTaskDialogStore((state) => state.setViewOpen);
    const viewTaskId = useTaskDialogStore((state) => state.viewTaskId);

    const { data: task, isLoading, error, refetch, isRefetching } = useGetTaskById(viewTaskId);

    return (
        <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
            <DialogContent
                className="h-[90vh] grid-rows-[minmax(0,1fr)] md:max-w-6xl overflow-hidden p-0"
                // Esc while typing a checklist item closes that box, not the whole task.
                onEscapeKeyDown={(event) => {
                    if ((document.activeElement as HTMLElement | null)?.closest("[data-checklist-input]")) event.preventDefault();
                }}
            >
                {isLoading && (
                    <div role="status" aria-busy="true" className="space-y-6 p-6">
                        <DialogTitle className="sr-only">Loading task details</DialogTitle>
                        <div aria-hidden="true" className="space-y-3">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-7 w-2/3 max-w-96" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>
                        <ListLoading label="Loading task details" rows={4} />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog 
                    onBack={() => setViewOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    />
                )}
                {(!task && !isLoading && !error) && (
                    <NotFoundDialog 
                    onBack={() => setViewOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Task Not Found"
                    />
                )}
                {task && (
                    <ViewTask task={task} />
                )}
            </DialogContent>
        </Dialog>
    )
}

type ViewTaskProps = {
    task: TaskWithBoardAndColumn;
}

const ViewTask = ({ task }: ViewTaskProps) => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const { data: members = [] } = useGetMembers(projectId || "");
    const { mutate: updateTask, isPending: isUpdatingAssignee } = useEditTaskMutation(task._id);
    const changeAssignee = (value?: string) => {
        updateTask({ assignee: value ?? null });
    };

    return (
        <div className="flex h-full min-h-0">

            <div className="flex-1 flex flex-col">

                <DialogHeader className="px-6 py-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">#{task._id}</span>
                            </div>
                            <Badge variant={priorityBadgeVariant[task.priority]} className="capitalize">
                                {task.priority}
                            </Badge>
                            {/* <Badge className={getStatusColor(task.status)}>
                                {task.status === "in-progress" ? "In Progress" : task.status === "todo" ? "To Do" : "Done"}
                            </Badge> */}
                        </div>
                    </div>
                    <DialogTitle className="text-xl font-semibold text-left">{task.title}</DialogTitle>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-auto px-6 py-4">
                    <Suspense fallback={<ListLoading label="Loading attachments" rows={2} />}>
                        <TaskAttachments taskId={task._id} standalone />
                    </Suspense>

                    <section className="mt-6 border-t pt-5">
                        <h3 className="font-medium">Description</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {task.description || "No description provided."}
                        </p>

                        {(task.tags && task.tags.length > 0) && (
                            <div className="mt-4">
                                <h3 className="font-medium">Tags</h3>
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {task.tags.map((tag, index) => (
                                        <Badge key={index} variant="outline" className="text-xs">
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <Suspense fallback={<ListLoading className="mt-6" label="Loading task activity" avatar />}>
                        <TaskComments taskId={task._id} />
                    </Suspense>
                </div>
            </div>

            <div className="w-80 border-l bg-muted/20">
                <div className="p-4 py-6">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">Details</h3>
                        <Button variant="ghost" size="sm">
                            <Settings className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="space-y-2">

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Assignee</Label>
                            <TaskAssigneeCombobox
                                members={members}
                                value={task.assignee}
                                onValueChange={changeAssignee}
                                disabled={isUpdatingAssignee}
                                className="mt-1 h-10 bg-background text-left"
                            />
                        </div>
                        {/* 
                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Reporter</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">{task.reporter.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{task.reporter.name}</span>
                            </div>
                        </div> */}

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Priority</Label>
                            <div className="mt-1">
                                <Badge variant={priorityBadgeVariant[task.priority]} className="capitalize">
                                    {task.priority}
                                </Badge>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Column</Label>
                            <div className="mt-1">
                                <Badge variant="outline">{task.column.title}</Badge>
                            </div>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Board</Label>
                            <p className="text-sm mt-1">{task.board.name}</p>
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Due Date</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No due date"}
                                </span>
                            </div>
                        </div>

                        <div className="border-t pt-3">
                            <TaskChecklist task={task} />
                        </div>

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Order</Label>
                            <p className="text-sm mt-1">#{task.order}</p>
                        </div>

                        <Suspense fallback={null}>
                            <TaskMentionedInNotes taskId={task._id} projectId={task.board.projectId} />
                        </Suspense>

                        <Separator />

                        <div className="space-y-2 text-xs text-muted-foreground">
                            <div>
                                <span className="font-medium">Created:</span> {new Date(task.createdAt).toLocaleDateString()} at{" "}
                                {new Date(task.createdAt).toLocaleTimeString()}
                            </div>
                            <div>
                                <span className="font-medium">Last Updated:</span> {new Date(task.updatedAt).toLocaleDateString()} at{" "}
                                {new Date(task.updatedAt).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ViewTaskDialog
