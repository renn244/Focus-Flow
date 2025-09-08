import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/context/authContext"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { useGetActiveMembers } from "../hooks/useGetActiveMember"
import { useActiveMemberSocket } from "../hooks/useActiveMemberSocket"

const ActiveMembersDisplay = () => {
    const projectId = useProjectIdStore((state) => state.projectId);

    const { data: activeMembers } = useGetActiveMembers(projectId)
    const { user } = useAuthContext();

    useActiveMemberSocket(projectId);

    const members = activeMembers?.filter(member => member._id !== user?._id);

    return (
        <div className="*:data-[slot=avatar]:ring-background flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:grayscale">
            {members?.slice(0, 3).map((member) => (
                <DropdownMenu key={member._id}>
                    <DropdownMenuTrigger className="rounded-full data-[state=open]:outline-1 data-[state=open]:outline-ring data-[state=open]:z-20">
                        <Avatar className="cursor-pointer">
                            <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                            <AvatarFallback className="select-none">{member.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {member.displayName}
                                </p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {member.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuContent>
                </DropdownMenu>
            ))}

            {/* If there is any extra we should put one empty avatar with + number of extra active user. make this clickable to view all within the list (make it like drop down menu not dialog it's annoying) */}
            {members && members.length > 3 && (
                <Avatar className="cursor-pointer">
                    <AvatarFallback className="text-sm font-semibold text-muted-foreground select-none">
                        +{members.length - 3}
                    </AvatarFallback>
                </Avatar>
            )}
        </div>
    )
}

export default ActiveMembersDisplay