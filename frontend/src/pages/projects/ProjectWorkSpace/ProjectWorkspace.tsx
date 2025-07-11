import { Button } from "@/components/ui/button";
import { Bell, Calendar, Filter, Search, Settings, User, Users } from "lucide-react";
import KanbanBoard from "../../../features/projectWorkSpace/components/Board/KanbanBoard";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

type ProjectWorkspaceProps = {
}

const ProjectWorkspace = ({
}: ProjectWorkspaceProps) => {
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-slate-900">Project Dashboard</h1>
                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" className="text-slate-600">
                                <Calendar className="w-4 h-4 mr-2" />
                                Board
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-600">
                                <Users className="w-4 h-4 mr-2" />
                                Team
                            </Button>
                            <Button variant="ghost" size="sm" className="text-slate-600">
                                Calendar
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                            <Input
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-64"
                            />
                        </div>
                        <Button variant="ghost" size="sm">
                            <Filter className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Bell className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                            <Settings className="w-4 h-4" />
                        </Button>
                        <Avatar className="w-8 h-8">
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                            <AvatarFallback>
                                <User className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                    </div>
                </div>
            </div>

            {/* Board */}
            <KanbanBoard />
        </div>
    )
}

export default ProjectWorkspace