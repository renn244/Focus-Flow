import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuLabel, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu"
import type { TeamMemberUser } from "../type"

type ViewAllActiveMembersProps = {
    members: TeamMemberUser[];
}

const ViewAllActiveMembers = ({ members }: ViewAllActiveMembersProps) => {

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full data-[state=open]:outline-1 data-[state=open]:outline-ring data-[state=open]:z-30">
                <Avatar className="cursor-pointer">
                    <AvatarFallback className="text-sm font-semibold text-muted-foreground select-none">
                        +{members.length - 3}
                    </AvatarFallback>
                </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-58">
                {members.slice(3).map((member, idx) => (
                    <DropdownMenuLabel className="flex gap-2" key={idx}>
                        <Avatar>
                            <AvatarImage src={member.avatarUrl} alt={member.displayName} />
                            <AvatarFallback className="select-none">{member.displayName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {member.displayName}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {member.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ViewAllActiveMembers