import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Edit, MessageSquare, MoreHorizontal, Settings, Trash2 } from "lucide-react"

const mockTeamMembers = [
    {
        id: 1,
        name: "Alice Johnson",
        role: "Project Manager",
        email: "alice@example.com"
    },
    {
        id: 2,
        name: "Bob Smith",
        role: "Developer",
        email: "bob@example.com"
    },
    {
        id: 3,
        name: "Charlie Brown",
        role: "Designer",
        email: "charlie@example.com"
    }
]

const Team = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockTeamMembers.map((member) => (
                <TeamMemberCard key={member.id} member={member} />
            ))}
        </div>
    )
}

type TeamMemberCardProps = {
    member: any
}

const TeamMemberCard = ({ member }: TeamMemberCardProps) => {
    return (
        <div>
            <Card className="py-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="py-0 px-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                    <AvatarFallback>{member.initials}</AvatarFallback>
                                </Avatar>
                                {/* <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    memberStatusColors[member.status]
                                }`}
                                /> */}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    {/* <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tasks Assigned</span>
                            <span className="font-medium">{member.tasksAssigned}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tasks Completed</span>
                            <span className="font-medium text-green-600">{member.tasksCompleted}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Hours Logged</span>
                            <span className="font-medium">{member.hoursLogged}h</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Completion Rate</span>
                            <span className="font-medium">
                                {Math.round((member.tasksCompleted / member.tasksAssigned) * 100)}%
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Active</span>
                            <span className="font-medium">{format(member.lastActive, "MMM dd, HH:mm")}</span>
                        </div>
                    </div> */}

                    {/* <div className="mt-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Task Progress</span>
                            <span>{Math.round((member.tasksCompleted / member.tasksAssigned) * 100)}%</span>
                        </div>
                        <Progress value={(member.tasksCompleted / member.tasksAssigned) * 100} className="h-2" />
                    </div> */}

                    {/* <div className="mt-4 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                            Joined {format(member.joinDate, "MMM yyyy")}
                        </Badge>
                        <Badge
                        variant="outline"
                        className={`text-xs ${
                        member.status === "active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : member.status === "busy"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                        }`}
                        >
                            {member.status}
                        </Badge>
                    </div> */}
                </CardContent>
            </Card>
        </div>
    )
}

export default Team