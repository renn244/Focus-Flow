import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Calendar, CheckCircle, Circle, Clock, Edit, ExternalLink, Star, Target, User } from "lucide-react"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import { useGetProjectById } from "../../hooks/useGetProjectById"
import useProjectDialogStore from "../../store/useProjectDialog"

const ViewProjectDialog = () => {
    const isViewOpen = useProjectDialogStore((state) => state.isViewOpen);
    const viewProjectId = useProjectDialogStore((state) => state.viewProjectId);
    const setViewOpen = useProjectDialogStore((state) => state.setViewOpen);

    const { data:project, isLoading, error } = useGetProjectById(viewProjectId || "");

    return (
        <Dialog open={isViewOpen} onOpenChange={setViewOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <>Something went wrong</>
                )}
                {(!project && !isLoading && !error) && (
                    <>Not Found</>
                )}
                {project && (
                    <ViewProject project={project} />
                )}
            </DialogContent>
        </Dialog>
    )
}

const ViewProject = ({ project } : { project: any }) => {
    const daysUntilDue = Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

    const onEdit = () => {
        console.log("Edit project")
    }
    
    const onViewFull = () => {
        console.log("View full project")
    }

    return (
        <>
            <DialogHeader>
                <DialogTitle>Project Overview</DialogTitle>
            </DialogHeader>
            <div className="w-full max-w-3xl mx-auto">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 p-3 mt-1.5 rounded-lg ${project.color} flex items-start justify-center`}>
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl font-bold text-gray-900">{project.name}</h2>
                                {project.starred && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-start gap-2">
                        {onEdit && (
                            <Button variant="outline" size="sm" onClick={onEdit}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                            </Button>
                        )}
                        {onViewFull && (
                            <Button variant="outline" size="sm" onClick={onViewFull}>
                                <ExternalLink className="w-4 h-4 mr-2" />
                                View Full
                            </Button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 mb-4">
                    <Badge variant="outline" className={statusColors[project.status as keyof typeof statusColors]}>
                        {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[project.priority as keyof typeof priorityColors]}>
                        {project.priority.charAt(0).toUpperCase() + project.priority.slice(1)} Priority
                    </Badge>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-gray-900">Project Progress</h3>
                        <span className="text-1xl font-bold text-blue-600">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-3 mb-4" />
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                                <CheckCircle className="w-4 h-4" />
                                <span className="font-semibold">{project.completedTasks}</span>
                            </div>
                            <p className="text-xs text-gray-600">Completed</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                                <Circle className="w-4 h-4" />
                                <span className="font-semibold">{project.openTasks}</span>
                            </div>
                            <p className="text-xs text-gray-600">Open</p>
                        </div>
                        <div>
                            <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                                <Target className="w-4 h-4" />
                                <span className="font-semibold">{project.totalTasks}</span>
                            </div>
                            <p className="text-xs text-gray-600">Total</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6 mb-4">

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Created:</span>
                                <span className="font-medium">{format(new Date(project.createdAt), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Clock className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Due:</span>
                                <span className="font-medium">{format(new Date(project.dueDate), "MMM dd, yyyy")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                                <Target className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Days left:</span>
                                <span
                                    className={`font-medium ${daysUntilDue < 7 ? "text-red-600" : daysUntilDue < 14 ? "text-yellow-600" : "text-green-600"}`}
                                >
                                    {daysUntilDue > 0 ? `${daysUntilDue} days` : "Overdue"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-900 mb-3">Team</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Owner:</span>
                                <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5">
                                        <AvatarImage src={project.ownerId.avatar || "/placeholder.svg"} alt={project.ownerId.name} />
                                        <AvatarFallback className="text-xs">{project.ownerId.initials}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{project.ownerId.name}</span>
                                </div>
                            </div>
                            {/* <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600">Members:</span>
                                <span className="font-medium">{project.team.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                {project.team.slice(0, 5).map((member, index) => (
                                    <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                        <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {project.team.length > 5 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                        +{project.team.length - 5}
                                    </div>
                                )}
                            </div> */}
                        </div>
                    </div>
                </div>

                {/* <Separator className="my-4" />

                <div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
                            View All
                        </Button>
                    </div>
                    <div className="space-y-3">
                        {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-3">
                                <Avatar className="w-8 h-8 flex-shrink-0">
                                    <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                                    <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-gray-900">
                                        <span className="font-medium">{activity.user.name}</span>{" "}
                                        <span className="text-gray-600">{activity.description}</span>
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">{activity.timestamp}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
        </>
    )
}

export default ViewProjectDialog