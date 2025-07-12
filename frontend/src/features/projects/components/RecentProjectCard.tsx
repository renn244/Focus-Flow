import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Folder, Star } from "lucide-react"
import type { Project } from "../type"

const RecentProjectCard = ({ project }: { project: Project }) => {
    return (
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-1">
            <CardContent className="p-4">
                <div className="space-y-2">

                    <div className="flex items-start justify-between ">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 p-2 rounded ${project.color} flex items-center justify-center`}>
                                <Folder className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">{project.name}</h3>
                                <p className="text-sm text-gray-500 line-clamp-2 min-h-10">{project.description}</p>
                            </div>
                        </div>
                        {project.starred && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
                    </div>


                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-gray-700 uppercase tracking-wide text-xs">Quick Links</span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between py-1 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                                <span className="text-sm text-gray-700">My open work items</span>
                                <span className="text-sm font-medium text-gray-900">{project.openTasks}</span>
                            </div>
                            <div className="flex items-center justify-between py-1 hover:bg-gray-50 rounded px-2 -mx-2 cursor-pointer">
                                <span className="text-sm text-gray-700">Done work items</span>
                                <span className="text-sm font-medium text-gray-900">{project.completedTasks}</span>
                            </div>
                        </div>
                    </div>


                    {/* <div className="pt-2 border-t border-gray-100">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="w-full justify-between text-sm h-8 px-2">
                                    <span>
                                        {project.boardCount} board{project.boardCount !== 1 ? "s" : ""}
                                    </span>
                                    <ChevronDown className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-48">
                                <DropdownMenuItem>
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 bg-blue-500 rounded-sm" />
                                        <span>Main Board</span>
                                    </div>
                                </DropdownMenuItem>
                                {project.boardCount > 1 && (
                                    <DropdownMenuItem>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 bg-purple-500 rounded-sm" />
                                            <span>Sprint Board</span>
                                        </div>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div> */}
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentProjectCard