import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Calendar, CheckCircle, Circle, Folder, Star } from "lucide-react"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import useSelectedProjectStore from "../../store/useSelectedProject.store"
import ProjectCardOptions from "./ProjectCardOptions"

const ProjectGridCard = ({ project }: { project: any } ) => {
    const selectedProjects = useSelectedProjectStore((state) => state.selectedProjects);
    const handleSelectProject = useSelectedProjectStore((state) => state.handleSelectProject);
    
    return (
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-0">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-center-safe gap-1">
                                <Checkbox
                                checked={selectedProjects.includes(project._id)}
                                onCheckedChange={() => handleSelectProject(project._id)}
                                onClick={(e) => e.stopPropagation()}
                                />
                                <div className={`w-8 h-8 p-2 rounded ${project.color} flex items-center justify-center`}>
                                    <Folder className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{project.name}</h3>
                                    {project.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                                </div>
                                <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
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

                    <div className="flex items-center justify-between text-sm text-gray-600">
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
                        <div className="flex -space-x-2">
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