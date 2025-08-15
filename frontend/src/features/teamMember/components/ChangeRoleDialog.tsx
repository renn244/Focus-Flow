import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { format } from "date-fns"
import { Calendar, UserCog } from "lucide-react"
import { permissionColors, permissionIcons } from "../constants/permission"
import { useGetMember } from "../hooks/useGetMember"
import { useChangeRoleStore } from "../store/changeRoleStore"
import { useState } from "react"

const ChangeRoleDialog = () => {
    const [newRole, setNewRole] = useState("");
    const [reason, setReason] = useState("");

    const isOpen = useChangeRoleStore((state) => state.isOpen);
    const setIsOpen = useChangeRoleStore((state) => state.setIsOpen);
    const memberId = useChangeRoleStore((state) => state.memberId);
    const projectId = useProjectIdStore((state) => state.projectId);

    const { data: member } = useGetMember(projectId, memberId);
    // const { mutateAsync, isPending } = use

    if(!member) return

    const PermissionIcon = permissionIcons[member.role];

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
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
                    {/* Member Info */}
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={member.user.avatarUrl || "/placeholder.svg"} alt={member.user.displayName} />
                                        <AvatarFallback className="text-lg">{member.user.displayName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg text-gray-900">{member.user.displayName}</h3>
                                    <p className="text-gray-600">{member.user.email}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            Joined {format(member.joinedAt, "MMM yyyy")}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className={permissionColors[member.role]}>
                                        <PermissionIcon />
                                        {member.role}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Role Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Role</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="role">Select Role</Label>
                                <Select value={newRole} onValueChange={setNewRole}>
                                    <SelectTrigger className="w-32">
                                        <SelectValue placeholder="Select a role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Admin</SelectItem>
                                        <SelectItem value="member">Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Change Summary */}
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

                    {/* Reason for Change */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Reason for Change (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Provide a reason for this role change..."
                            className="min-h-[80px]"
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                    </Button>
                    <Button
                    // onClick={handleConfirm}
                    // disabled={!hasChanges || isSubmitting}
                    // className={isDowngrade || isChangingToOwner ? "bg-orange-600 hover:bg-orange-700" : ""}
                    >
                        <UserCog className="w-4 h-4 mr-2" />
                        {isSubmitting ? "Updating..." : "Update Role"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default ChangeRoleDialog