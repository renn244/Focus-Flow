import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns/format';
import { motion } from 'framer-motion';
import { Calendar, Mail, MoreHorizontal, Settings, Trash2, User } from 'lucide-react';
import { permissionColors, permissionIcons } from '../constants/permission';
import { useRemoveMemberDialog } from '../store/removeMemberStore';
import { useChangeRoleDialog } from '../store/changeRoleStore';
import { useViewMemberProfileDialog } from '../store/viewMemberProfileStore';
import type { TeamMemberWithUser } from '../type';

const TeamMemberCard = ({ member, index }: { member: TeamMemberWithUser, index: number }) => {
    const PermissionIcon = permissionIcons[member.role as keyof typeof permissionIcons];

    return (
        <motion.div
        key={member._id}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.06, duration: 0.18 }}
        >
            <div className="grid gap-3 border-b border-slate-200 px-3 py-4 transition-colors hover:bg-slate-50 md:grid-cols-[minmax(15rem,1.25fr)_minmax(16rem,1fr)_10rem_2.5rem] md:items-center md:gap-6">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-10 border border-slate-200">
                        <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                        <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h3 className="truncate font-semibold text-slate-900">{member.user.displayName}</h3>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={permissionColors[member.role]}>
                                <PermissionIcon className="mr-1 size-3" />
                                {member.role}
                            </Badge>
                            <span className="text-sm text-slate-500">{member.user.username}</span>
                        </div>
                    </div>
                </div>

                <span className="flex min-w-0 items-center gap-2 truncate text-sm text-slate-500"><Mail className="size-4 shrink-0" />{member.user.email}</span>
                <span className="flex items-center gap-2 text-sm text-slate-500"><Calendar className="size-4 shrink-0" />{format(member.joinedAt, "MMM dd, yyyy")}</span>

                <TeamMemberActions member={member} />
            </div>
        </motion.div>
    )
}

export const TeamMemberActions = ({ member }: { member: TeamMemberWithUser }) => {
    const setRemoveMemberId = useRemoveMemberDialog(state => state.setMemberId);
    const setChangeRoleMemberId = useChangeRoleDialog(state => state.setMemberId);
    const setProfileMember = useViewMemberProfileDialog(state => state.setMember);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={`Manage ${member.user.displayName}`}>
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setProfileMember(member)}>
                    <User />
                    View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setChangeRoleMemberId(member._id)}>
                    <Settings />
                    Change Role
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRemoveMemberId(member._id)} className="text-destructive focus:text-destructive">
                    <Trash2 />
                    Remove Member
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default TeamMemberCard
