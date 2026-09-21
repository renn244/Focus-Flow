import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Calendar, CheckCircle2, Clock, FileText, Flag, Target, TrendingUp, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { priorityColors, statusColors } from "@/features/projects/constants/ProjectBadge"
import type { ProjectWithOwner } from "@/features/projects/type"

type OverviewProps = {
    project: ProjectWithOwner;
}

const Overview = ({ project }: OverviewProps) => {

    const daysUntilDue = project.dueDate && Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))


    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Progress</p>
                                <p className="text-3xl font-bold text-gray-900">{project.progress}%</p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <Progress value={project.progress} className="mt-4" />
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Tasks</p>
                                <p className="text-3xl font-bold text-gray-900">{project.totalTasks}</p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{project.completedTasks} completed</p>
                    </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Team Size</p>
                                <p className="text-3xl font-bold text-gray-900">6</p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {daysUntilDue && (
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Days Left</p>
                                    <p className={`text-3xl font-bold ${daysUntilDue < 0 ? "text-red-600" : "text-gray-900"}`}>
                                        {Math.abs(daysUntilDue)}
                                    </p>
                                </div>
                                <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                    daysUntilDue < 0 ? "bg-red-100" : "bg-orange-100"
                                }`}
                                >
                                    <Clock className={`w-6 h-6 ${daysUntilDue < 0 ? "text-red-600" : "text-orange-600"}`} />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">{daysUntilDue < 0 ? "Overdue" : "Until deadline"}</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="w-5 h-5 text-blue-600" />
                                Project Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <p className="mt-1 text-gray-900 leading-relaxed">{project.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <div className="mt-1">
                                        <Badge className={statusColors[project.status]}>
                                            <Target className="w-3 h-3 mr-1" />
                                            {project.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Priority</label>
                                    <div className="mt-1">
                                        <Badge className={priorityColors[project.priority]}>
                                            <Flag className="w-3 h-3 mr-1" />
                                            {project.priority}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-700">Project Owner</label>
                                <div className="mt-2 flex items-center gap-3">
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={project.owner.avatarUrl || "/placeholder.svg"} alt={project.owner.name} />
                                        <AvatarFallback>{project.owner.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-medium text-gray-900">{project.owner.displayName}</div>
                                        <div className="text-sm text-gray-500">{project.owner.email}</div>
                                    </div>
                                </div>
                            </div>

                            {/* {project.repository && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Repository</label>
                                    <div className="mt-1">
                                        <a
                                        href={project.repository}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                            View Repository
                                        </a>
                                    </div>
                                </div>
                            )} */}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                Timeline & Budget
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-700">Start Date</label>
                                <p className="mt-1 text-gray-900">{format(project.createdAt, "MMMM dd, yyyy")}</p>
                            </div>

                            {(project.dueDate && daysUntilDue) && (
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Due Date</label>
                                    <p className={`mt-1 ${daysUntilDue < 0 ? "text-red-600" : "text-gray-900"}`}>
                                        {project.dueDate ? format(project.dueDate, "MMMM dd, yyyy") : "No due date set"}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-700">Last Updated</label>
                                <p className="mt-1 text-gray-900">{format(project.updatedAt, "MMMM dd, yyyy")}</p>
                            </div>

                            {/* {project.budget && (
                                <>
                                    <Separator />
                                    <div>
                                        <label className="text-sm font-medium text-gray-700">Budget</label>
                                        <div className="mt-2 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>Allocated</span>
                                                <span className="font-medium">
                                                    ${project.budget.allocated.toLocaleString()} {project.budget.currency}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>Spent</span>
                                                <span className="font-medium">
                                                    ${project.budget.spent.toLocaleString()} {project.budget.currency}
                                                </span>
                                            </div>
                                            <Progress value={(project.budget.spent / project.budget.allocated) * 100} className="h-2" />
                                            <div className="text-xs text-gray-500">
                                                {Math.round((project.budget.spent / project.budget.allocated) * 100)}% of budget used
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )} */}

                            {daysUntilDue && (
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-600">
                                            {daysUntilDue > 0
                                            ? `${daysUntilDue} days remaining`
                                            : `${Math.abs(daysUntilDue)} days overdue`}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                {/* <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="w-5 h-5 text-blue-600" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {project.activityLogs.slice(0, 5).map((log, index) => (
                                    <CardRecentActivity key={log.id} log={log} index={index} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div> */}
            </div>
        </>
    )
}

export default Overview
