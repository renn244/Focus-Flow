import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useGetMembers } from "@/features/teamMember/hooks/useGetMembers"
import type { TeamMemberWithUser } from "@/features/teamMember/type"
import { motion } from "framer-motion"
import { Edit, MessageSquare, MoreHorizontal, Settings, Trash2 } from "lucide-react"
import TeamMemberCardSkeleton from "../Skeleton/TeamMemberCardSkeleton"

type TeamProps = {
    projectId: string
}

const Team = ({ projectId }: TeamProps) => {
    const { data: members, isLoading } = useGetMembers(projectId);

    if(isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 8 }).map((_, idx) => <TeamMemberCardSkeleton key={idx} />)}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {members?.map((member, idx) => (
                <TeamMemberCard key={member._id} member={member} index={idx} />
            ))}
        </div>
    )
}

type TeamMemberCardProps = {
    member: TeamMemberWithUser
    index: number
}

const TeamMemberCard = ({ member, index }: TeamMemberCardProps) => {
    return (
        <motion.div
        key={member._id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        >
            <Card className="py-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md transition-shadow">
                <CardContent className="py-0 px-2">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={member.user.avatarUrl} alt={member.user.displayName} />
                                    <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {/* <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    memberStatusColors[member.status]
                                }`}
                                /> */}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{member.user.displayName}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <p className="text-xs text-gray-500">{member.user.email}</p>
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
                                    <Edit className="w-4 h-4" />
                                    Edit Member
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <MessageSquare className="w-4 h-4" />
                                    Send Message
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4" />
                                    Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                    <Trash2 className="w-4 h-4 text-red-600" />
                                    Remove Member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    
                </CardContent>
            </Card>
        </motion.div>
    )
}

export default Team