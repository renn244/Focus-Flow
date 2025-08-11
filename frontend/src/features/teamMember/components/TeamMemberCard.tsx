import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns/format';
import { motion } from 'framer-motion';
import { Calendar, Mail, MoreHorizontal, Settings, Trash2, User } from 'lucide-react';
import { permissionColors, permissionIcons } from '../constants/permission';
import type { TeamMemberWithUser } from '../type';

const TeamMemberCard = ({ member, index }: { member: TeamMemberWithUser, index: number }) => {
    const PermissionIcon = permissionIcons[member.role as keyof typeof permissionIcons];

    return (
        <motion.div
        key={member._id}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: index * 0.1 }}
        >
            <Card className='hover:shadow-md transition-shadow'>
                <CardContent>
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                                    <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                {/* The Active color will be handled once we got the socket */}
                                {/* <div
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                                    statusColors[member.status as keyof typeof statusColors]
                                }`}
                                /> */}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">{member.user.displayName}</h3>
                                <p className="text-sm text-gray-600">{member.role}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className={permissionColors[member.role]}>
                                        <PermissionIcon className="w-3 h-3 mr-1" />
                                        {member.role}
                                    </Badge>
                                    {/* <Badge variant="outline" className="text-xs">
                                        {statusLabels[member.status as keyof typeof statusLabels]}
                                    </Badge> */}
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <MoreHorizontal className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                // onClick={() => handleMemberAction("view-profile", member)}
                                >
                                    <User className="w-4 h-4 mr-2" />
                                    View Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                    <Settings className="w-4 h-4 mr-2" />
                                    Change Role
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                // onClick={() => handleMemberAction("remove", member)}
                                className="text-red-600"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="w-4 h-4" />
                            {member.user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            Joined {format(member.joinedAt, "MMM dd, yyyy")}
                        </div>
                        {/* <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            {member.hoursLogged}h logged • {member.timezone}
                        </div> */}
                    </div>

                    {/* <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Task Progress</span>
                            <span className="font-medium">
                                {member.tasksCompleted}/{member.tasksAssigned}
                            </span>
                        </div>
                        <Progress value={(member.tasksCompleted / member.tasksAssigned) * 100} className="h-2" />
                    </div> */}

                </CardContent>
            </Card>
        </motion.div>
    )
}

export default TeamMemberCard