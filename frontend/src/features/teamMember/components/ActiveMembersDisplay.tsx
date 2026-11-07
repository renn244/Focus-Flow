import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAuthContext } from "@/context/authContext"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { useGetActiveMembers } from "../hooks/useGetActiveMember"
import { useActiveMemberSocket } from "../hooks/useActiveMemberSocket"
import ViewAllActiveMembers from "./ViewAllActiveMembers"

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()

const ActiveMembersDisplay = () => {
    const projectId = useProjectIdStore((state) => state.projectId);

    const { data: activeMembers } = useGetActiveMembers(projectId)
    const { user } = useAuthContext();

    useActiveMemberSocket(projectId);

    const members = activeMembers?.filter(member => member._id !== user?._id);

    return (
        <div className="flex -space-x-1">
            {members?.slice(0, 3).map((member) => (
                <DropdownMenu key={member._id}>
                    <DropdownMenuTrigger className="rounded-full data-[state=open]:outline-1 data-[state=open]:outline-ring data-[state=open]:z-20">
                        <Avatar className="cursor-pointer ring-2 ring-card">
                            <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                            <AvatarFallback className="select-none bg-slate-200 text-xs font-semibold text-slate-700">{initials(member.displayName)}</AvatarFallback>
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

            {members && members.length > 3 && (
                <ViewAllActiveMembers members={members} />
            )}
        </div>
    )
}

export default ActiveMembersDisplay