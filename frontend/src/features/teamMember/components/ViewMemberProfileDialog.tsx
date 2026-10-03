import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { CalendarDays, Mail } from "lucide-react";
import { permissionColors } from "../constants/permission";
import { useViewMemberProfileDialog } from "../store/viewMemberProfileStore";

const ViewMemberProfileDialog = () => {
    const isOpen = useViewMemberProfileDialog((state) => state.isOpen);
    const member = useViewMemberProfileDialog((state) => state.member);
    const setIsOpen = useViewMemberProfileDialog((state) => state.setIsOpen);

    if (!member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Member profile</DialogTitle>
                    <DialogDescription>Team membership details for this project.</DialogDescription>
                </DialogHeader>

                <div className="flex items-center gap-3">
                    <Avatar className="size-12 border border-border">
                        <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                        <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="truncate font-semibold text-foreground">{member.user.displayName}</p>
                        <p className="truncate text-sm text-muted-foreground">@{member.user.username}</p>
                    </div>
                </div>

                <Separator />

                <dl className="flex flex-col gap-4 text-sm">
                    <div className="flex items-center justify-between gap-4">
                        <dt className="text-muted-foreground">Role</dt>
                        <dd><Badge variant="outline" className={permissionColors[member.role]}>{member.role}</Badge></dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />Email</dt>
                        <dd className="truncate text-right font-medium text-foreground">{member.user.email}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                        <dt className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />Joined</dt>
                        <dd className="font-medium text-foreground">{format(new Date(member.joinedAt), "MMM d, yyyy")}</dd>
                    </div>
                </dl>
            </DialogContent>
        </Dialog>
    );
}

export default ViewMemberProfileDialog;
