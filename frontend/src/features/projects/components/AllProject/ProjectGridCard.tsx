import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Archive, Calendar, CheckCircle, Circle, Edit, Eye, Folder, MoreHorizontal, Star, Trash2 } from "lucide-react"
import useSelectedProjectStore from "../../store/useSelectedProject.store"
import { Checkbox } from "@/components/ui/checkbox"
import { priorityColors, statusColors } from "../../constants/ProjectBadge"
import { Progress } from "@/components/ui/progress"
import useProjectDialogStore from "../../store/useProjectDialog"

const ProjectGridCard = ({ project }: { project: any } ) => {
    const selectedProjects = useSelectedProjectStore((state) => state.selectedProjects);
    const handleSelectProject = useSelectedProjectStore((state) => state.handleSelectProject);
    const setEditProjectId = useProjectDialogStore((state) => state.setEditProjectId);
    
    return (
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-1">
            <CardContent className="p-6">
                <div className="space-y-4">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            {/* <Checkbox
                            checked={selectedProjects.includes(project._id)}
                            onCheckedChange={() => handleSelectProject(project._id)}
                            onClick={(e) => e.stopPropagation()}
                            /> */}
                            <div className={`w-8 h-8 p-2 rounded ${project.color} flex items-center justify-center`}>
                                <Folder className="w-4 h-4 text-white" />
                            </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{project.name}</h3>
                                {project.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2">{project.description}</p>
                        </div>
                        </div>
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
                                <DropdownMenuItem onClick={() => setEditProjectId(project._id)}>
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

                    <div className="flex items-center gap-2">
                        <Badge className={statusColors[project.status as "active"]}>{project.status}</Badge>
                        <Badge className={priorityColors[project.priority as "low"]}>{project.priority}</Badge>
                        <Badge variant="outline">{project.type}</Badge>
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
                            {project.dueDate}
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
                        <span className="text-xs text-gray-500">{project.lastActivity}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectGridCard