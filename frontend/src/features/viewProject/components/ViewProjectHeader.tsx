import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { priorityColors, statusColors } from "@/features/projects/constants/ProjectBadge";
import type { ProjectWithOwner } from "@/features/projects/type";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { Archive, ArrowLeft, Bell, Calendar, CheckCircle2, Circle, Download, Edit, Flag, MoreHorizontal, Settings2, Share2, Star, Target, Trash2, UserPlus } from "lucide-react";

type ViewProjectHeaderProps = {
    project: ProjectWithOwner;
}

const ViewProjectHeader = ({ project }: ViewProjectHeaderProps) => {

    const daysUntilDue = project.dueDate ? Math.ceil((new Date(project.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : undefined;

    return (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-6 py-4 sticky top-0 z-50">

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" asChild>
                        <Link to={'/projects/all'}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Projects
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${project?.color}`}>
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                                <button onClick={undefined}>
                                    <Star className={`w-5 h-5 ${project?.starred ? "text-yellow-500 fill-current" : "text-gray-400"}`} />
                                </button>
                            </div>
                            <p className="text-sm text-gray-500">
                                Created {format(new Date(project.createdAt), "MMM dd, yyyy")} 
                                {" "}
                                • Last updated
                                {" "}
                                {format(new Date(project.updatedAt), "MMM dd, yyyy")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" size="sm">
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                    </Button>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Export
                    </Button>
                    <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit    
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                                <Settings2 className="w-4 h-4 mr-2" />
                                Project Settings
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Invite Members
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Project
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className={statusColors[project.status]}>
                        <Target className="w-3 h-3 mr-1" />
                        {project.status}
                    </Badge>
                    <Badge variant="outline" className={priorityColors[project.priority]}>
                        <Flag className="w-3 h-3 mr-1" />
                        {project.priority} priority
                    </Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        {project.completedTasks} completed
                    </div>
                    <div className="flex items-center gap-1">
                        <Circle className="w-4 h-4 text-blue-600" />
                        {project.openTasks} open
                    </div>
                    {/* {project.overdueTasks > 0 && (
                        <div className="flex items-center gap-1">
                            <AlertCircle className="w-4 h-4 text-red-600" />
                            {project.overdueTasks} overdue
                        </div>
                    )} */}
                    {/* <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {project.teamMembers.length} members
                    </div> */}
                    {daysUntilDue && (
                        <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {daysUntilDue > 0 ? `${daysUntilDue} days left` : `${Math.abs(daysUntilDue)} days overdue`}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )        
}

export default ViewProjectHeader