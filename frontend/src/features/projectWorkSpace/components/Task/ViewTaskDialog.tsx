import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog";
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Settings } from "lucide-react";
import { useState } from "react";
import { priorityBadgeVariant } from "../../constant/priorityColors";
import { useGetTaskById } from "../../hooks/Task/useGetTaskById";
import useTaskDialogStore from "../../store/useTaskDialog";
import type { TaskWithBoardAndColumn } from "../../type";

const mockComments = [
    {
        id: "comment-1",
        author: {
        name: "Sarah Johnson",
        initials: "SJ",
        },
        content: "I've started working on the login functionality. The basic structure is in place.",
        createdAt: new Date("2025-01-22T09:15:00"),
    },
    {
        id: "comment-2",
        author: {
        name: "Mike Chen",
        initials: "MC",
        },
        content: "Great! Make sure to implement proper password hashing and validation.",
        createdAt: new Date("2025-01-22T11:30:00"),
    },
]

const mockActivityLog = [
    {
        id: "activity-1",
        type: "created",
        author: { name: "Mike Chen", initials: "MC" },
        description: "created this task",
        timestamp: new Date("2025-01-20T10:30:00"),
    },
    {
        id: "activity-2",
        type: "assigned",
        author: { name: "Mike Chen", initials: "MC" },
        description: "assigned to Sarah Johnson",
        timestamp: new Date("2025-01-20T10:32:00"),
    },
    {
        id: "activity-3",
        type: "moved",
        author: { name: "Sarah Johnson", initials: "SJ" },
        description: "moved from To Do to In Progress",
        timestamp: new Date("2025-01-22T09:00:00"),
    },
    {
        id: "activity-4",
        type: "commented",
        author: { name: "Sarah Johnson", initials: "SJ" },
        description: "added a comment",
        timestamp: new Date("2025-01-22T09:15:00"),
    },
]


const getStatusColor = (status: string) => {
    switch (status) {
        case "done":
            return "bg-green-100 text-green-800"
        case "in-progress":
            return "bg-blue-100 text-blue-800"
        case "todo":
            return "bg-gray-100 text-gray-800"
        default:
            return "bg-gray-100 text-gray-800"
    }
}

const ViewTaskDialog = () => {
    const isViewOpen = useTaskDialogStore((state) => state.isViewOpen);
    const setViewOpen = useTaskDialogStore((state) => state.setViewOpen);
    const viewTaskId = useTaskDialogStore((state) => state.viewTaskId);

    const { data: task, isLoading, error, refetch, isRefetching } = useGetTaskById(viewTaskId);

    return (
        <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="md:max-w-6xl max-h-[90vh] overflow-hidden p-0">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
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
    const [activeTab, setActiveTab] = useState("all");

    return (
        <div className="flex h-full">

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

                <div className="flex-1 overflow-auto px-6 py-4">

                    <div className="mb-3">
                        <h3 className="font-medium">Description</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            {task.description || "No description provided."}
                        </p>
                    </div>

                    {(task.tags && task.tags.length > 0) && (
                        <div className="mb-3">
                            <h3 className="font-medium">Tags</h3>
                            <div className="flex flex-wrap gap-2">
                                {task.tags.map((tag, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                        {tag}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All Mock Data for now */}
                    <div className="mt-2">
                        <h3 className="font-medium mb-1">Activity</h3>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="all">All</TabsTrigger>
                                <TabsTrigger value="comments">Comments</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="work-log">Work Log</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="mt-4 space-y-4 min-h-[344px]">
                                {[
                                    ...mockActivityLog,
                                    ...mockComments.map((comment) => ({
                                        id: comment.id,
                                        type: "commented" as const,
                                        author: comment.author,
                                        description: comment.content,
                                        timestamp: comment.createdAt,
                                    })),
                                ]
                                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                                .map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{item.author.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{item.author.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {item.timestamp.toLocaleDateString()} at {item.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{item.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="comments" className="mt-4 space-y-4 min-h-[344px]">
                                {mockComments.map((comment) => (
                                    <div key={comment.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{comment.author.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{comment.author.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {comment.createdAt.toLocaleDateString()} at {comment.createdAt.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm">{comment.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="history" className="mt-4 space-y-4 min-h-[344px]">
                                {mockActivityLog.map((activity) => (
                                    <div key={activity.id} className="flex gap-3">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback className="text-xs">{activity.author.initials}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-sm">{activity.author.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {activity.timestamp.toLocaleDateString()} at {activity.timestamp.toLocaleTimeString()}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="work-log" className="mt-4 min-h-[344px]">
                                <p className="text-sm text-muted-foreground">No work logged yet.</p>
                            </TabsContent>
                        </Tabs>
                    </div>
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

                        {/* <div>
                            <Label className="text-sm font-medium text-muted-foreground">Assignee</Label>
                            <div className="flex items-center gap-2 mt-1">
                                <Avatar className="h-6 w-6">
                                    <AvatarFallback className="text-xs">{task.assignee?.initials}</AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                        </div> */}
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

                        <div>
                            <Label className="text-sm font-medium text-muted-foreground">Order</Label>
                            <p className="text-sm mt-1">#{task.order}</p>
                        </div>

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