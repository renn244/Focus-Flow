import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { UserCog } from "lucide-react"
import { useState } from "react"
import { useChangeRoleMutation } from "../hooks/useChangeRoleMutation"
import { useGetMember } from "../hooks/useGetMember"
import { useChangeRoleDialog } from "../store/changeRoleStore"
import type { TeamMemberWithUser } from "../type"
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog"
import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog"

const ChangeRoleDialog = () => {
    const isOpen = useChangeRoleDialog((state) => state.isOpen);
    const setIsOpen = useChangeRoleDialog((state) => state.setIsOpen);
    const memberId = useChangeRoleDialog((state) => state.memberId);
    const projectId = useProjectIdStore((state) => state.projectId);

    const { data: member, isLoading, error, refetch, isRefetching } = useGetMember(projectId, memberId);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog 
                    onBack={() => setIsOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    />
                )}
                {(!member && !isLoading && !error) && (
                    <NotFoundDialog 
                    onBack={() => setIsOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Team Member Not Found"
                    />
                )}
                {member && (
                    <ChangeRole member={member} />
                )}
            </DialogContent>
        </Dialog>
    )
}

type ChangeRoleProps = {
    member: TeamMemberWithUser
}

const ChangeRole = ({ member }: ChangeRoleProps) => {
    const setIsOpen = useChangeRoleDialog((state) => state.setIsOpen);
    const memberId = useChangeRoleDialog((state) => state.memberId);
    const [newRole, setNewRole] = useState<"admin" | "member">(member.role);
    const [reason, setReason] = useState(""); // this will be used later for logging or sending emails or notifs

    const { mutateAsync, isPending } = useChangeRoleMutation(memberId || "");

    const handleConfirm = async () => {
        if(newRole) await mutateAsync({ newRole: newRole as 'admin' | 'member' });
    }

    return (
        <>
            <DialogHeader className="pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserCog className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold">Change Role & Permissions</DialogTitle>
                        <p className="text-sm text-gray-600">Update {member.user.displayName}'s role and access level</p>
                    </div>
                </div>
            </DialogHeader>

            <div className="space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">

                <Card className="py-0">
                    <CardContent className="p-3 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                                    <AvatarFallback className="text-lg">{member.user.displayName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">{member.user.displayName}</h3>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Select Role</Label>
                                <Select value={newRole} onValueChange={(value) => setNewRole(value as "admin" | "member")}>
                                    <SelectTrigger >
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Reason For Change (optional)</Label>
                            <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Provide a reason for this role change..."
                            className="min-h-[80px]"
                            />
                        </div>
                    </CardContent>
                </Card>


                {/* {hasChanges && (
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                            <Info className="w-5 h-5 text-blue-600" />
                            Change Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {newRole !== member.role && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span className="text-sm font-medium">Role</span>
                                <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{member.role}</span>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <span className="text-sm font-medium text-blue-600">{newRole}</span>
                                </div>
                            </div>
                            )}
                            {newPermissions !== member.permissions && (
                            <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                                <span className="text-sm font-medium">Permissions</span>
                                <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                    {currentPermission?.label}
                                </Badge>
                                <ArrowRight className="w-4 h-4 text-gray-400" />
                                <Badge
                                    variant="outline"
                                    className={`text-xs ${selectedPermission?.bgColor} ${selectedPermission?.color}`}
                                >
                                    {selectedPermission?.label}
                                </Badge>
                                </div>
                            </div>
                            )}
                        </CardContent>
                    </Card>
                )} */}
            </div>

            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                </Button>
                <Button
                onClick={handleConfirm}
                disabled={isPending}
                // className={isDowngrade || isChangingToOwner ? "bg-orange-600 hover:bg-orange-700" : ""}
                >
                    {isPending ? (
                        <LoadingSpinner />
                    ) : (
                        <>
                            <UserCog className="w-4 h-4 mr-2" />
                            {isPending ? <LoadingSpinner /> : "Update Role"}
                        </>
                    )}
                </Button>
            </div>
        </>
    )
}

export default ChangeRoleDialog