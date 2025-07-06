import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Folder, Star } from "lucide-react"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import ProjectCardOptions from "./ProjectCardOptions"
import { format } from "date-fns"
import type { ProjectWithOwner } from "../../type"

const ProjectListCard = ({ project } : { project: ProjectWithOwner }) => {

    return (
        <Card className="hover:shadow-sm transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-0.5 rounded-sm">
            <CardContent className="p-2">
                <div className="flex items-center gap-2">

                    <div className={`w-8 h-8 rounded ${project.color} flex items-center justify-center flex-shrink-0`}>
                        <Folder className="w-4 h-4 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate">
                                {project.name}
                            </h3>
                            {project.starred && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{project.description}</p>
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Badge className={statusColors[project.status as "active"]} variant="secondary">
                                {project.status}
                            </Badge>
                            <Badge className={priorityColors[project.priority as "low"]} variant="secondary">
                                {project.priority}
                            </Badge>
                        </div>

                        <div className="w-24">
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">Progress</span>
                                <span className="font-medium">{project.progress}%</span>
                            </div>
                            <Progress value={project.progress} className="h-1" />
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                {project.completedTasks}
                            </div>
                            <div className="flex items-center gap-1">
                                <Circle className="w-4 h-4" />
                                {project.openTasks}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            {/* {project.team.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                </Avatar>
                            ))} */}
                        </div>

                        <span className="text-xs text-gray-500 w-20 text-right">{format(new Date(project.updatedAt), "MMM dd, yyyy")}</span>

                        <ProjectCardOptions projectId={project._id} />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectListCard