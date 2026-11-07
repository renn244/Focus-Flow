import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Calendar, CheckCircle, Circle, Folder, Star } from "lucide-react"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import ProjectCardOptions from "./ProjectCardOptions"
import type { ProjectWithOwner } from "../../type"
import { Link } from "@tanstack/react-router"

const ProjectGridCard = ({ project }: { project: ProjectWithOwner } ) => {
    
    return (
        <Card className="group h-full bg-card py-0 transition-colors hover:border-blue-400">
            <CardContent className="p-5">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-3">
                            <div className="flex flex-col items-center-safe gap-1">
                                <div className={`size-9 shrink-0 rounded-md ${project.color || "bg-blue-600"} flex items-center justify-center`}>
                                    <Folder className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div className="min-w-0">
                                <div className="flex items-start gap-2">
                                    <h3 className="font-semibold text-foreground"><Link to="/projects/$projectId" params={{ projectId: project._id }} className="rounded-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">{project.name}</Link></h3>
                                    {project.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                </div>
                                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
                            </div>
                        </div>
                        <ProjectCardOptions projectId={project._id} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge className={statusColors[project.status as "active"]}>
                            {project.status}
                        </Badge>
                        <Badge className={priorityColors[project.priority as "low"]}>
                            {project.priority}
                        </Badge>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">Progress</span>
                            <span className="font-medium">{project.progress}%</span>
                        </div>
                        <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {project.completedTasks}
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle className="w-4 h-4" />
                                {project.openTasks}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(new Date(project.dueDate), 'MMM dd, yyyy')}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            {/* {project.team.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                </Avatar>
                            ))} */}
                            {/* {project.team.length > 3 && (
                                <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                    +{project.team.length - 3}
                                </div>
                            )} */}
                        </div>
                        <span className="text-xs text-gray-500">last Updated: {format(new Date(project.updatedAt), "MMM dd, yyyy")}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectGridCard
