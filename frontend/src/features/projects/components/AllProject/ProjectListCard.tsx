import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, CheckCircle, Circle, Edit, Eye, Folder, MoreHorizontal, Star, Trash2 } from "lucide-react"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import useSelectedProjectStore from "../../store/useSelectedProject.store"
import { Progress } from "@/components/ui/progress"

const ProjectListCard = ({ project } : { project: any }) => {
    const selectedProjects = useSelectedProjectStore((state) => state.selectedProjects);
    const handleSelectProject = useSelectedProjectStore((state) => state.handleSelectProject);

    return (
        <Card className="hover:shadow-sm transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-0.5 rounded-sm">
            <CardContent className="p-2">
                <div className="flex items-center gap-4">
                    <Checkbox
                    checked={selectedProjects.includes(project._id)}
                    onCheckedChange={() => handleSelectProject(project._id)}
                    onClick={(e) => e.stopPropagation()}
                    />

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

                        <div className="flex -space-x-2">
                            {/* {project.team.slice(0, 3).map((member, index) => (
                                <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                </Avatar>
                            ))} */}
                        </div>

                        <span className="text-xs text-gray-500 w-20 text-right">{project.lastActivity}</span>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Eye className="w-4 h-4 mr-2" />
                                    View project
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Archive className="w-4 h-4 mr-2" />
                                    Archive
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectListCard