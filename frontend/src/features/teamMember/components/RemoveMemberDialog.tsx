import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useRemoveMemberDialog } from "../store/removeMemberStore"
import { AlertTriangle, Crown, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useGetMember } from "../hooks/useGetMember";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { permissionColors, permissionIcons } from "../constants/permission";
import { useAuthContext } from "@/context/authContext";
import { useRemoveMemberMutation } from "../hooks/useRemoveMemberMutation";

const RemoveMemberDialog = () => {
    const { user } = useAuthContext();

    const isOpen = useRemoveMemberDialog((state) => state.isOpen);
    const setIsOpen = useRemoveMemberDialog((state) => state.setIsOpen);
    const memberId = useRemoveMemberDialog((state) => state.memberId);
    const projectId = useProjectIdStore((state) => state.projectId);

    const { data: member } = useGetMember(projectId, memberId);
    const { mutateAsync, isPending } = useRemoveMemberMutation()

    if(!member) return

    const PermissionIcon = permissionIcons[member.role];
    const isOwner = member.user._id.toString() === user?._id.toString();

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                            <Trash2 className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">Remove Team Member</DialogTitle>
                            <p className="text-sm text-gray-600">This action cannot be undone</p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-2">

                    <Card className="py-0">
                        <CardContent className="p-3">
                            <div className="flex items-center gap-3">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                                    <AvatarFallback>{member.user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold text-gray-900">{member.user.displayName}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant="outline" className={permissionColors[member.role]}>
                                                <PermissionIcon className="w-3 h-3 mr-1" />
                                                {member.role}
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">{member.user.email}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {isOwner && (
                        <Alert className="border-purple-200 bg-purple-50">
                            <Crown className="h-4 w-4 text-purple-600" />
                            <AlertDescription className="text-purple-800">
                                <strong>Cannot remove project owner.</strong> You must transfer ownership to another member before
                                removing this user from the project.
                            </AlertDescription>
                        </Alert>
                    )}

                    {!isOwner && (
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                <strong>This action is permanent.</strong> {member.user.displayName} will lose access to this project and all
                                associated data immediately.
                            </AlertDescription>
                        </Alert>
                    )}
                </div>

                <DialogFooter className="flex gap-3">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isPending}>
                        Cancel
                    </Button>
                    {!isOwner && (
                        <Button 
                        variant="destructive" 
                        onClick={() => mutateAsync({ userId: member.user._id || "", projectId: projectId || "" })} 
                        disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <LoadingSpinner />
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Member
                                </>
                            )}
                        </Button>
                    )}
                    {isOwner && (
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            <Crown className="w-4 h-4 mr-2" />
                            Transfer Ownership First
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default RemoveMemberDialog