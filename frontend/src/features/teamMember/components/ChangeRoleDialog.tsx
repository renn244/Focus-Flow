import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog"
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { useQueryClient } from "@tanstack/react-query"
import { UserCog } from "lucide-react"
import { useChangeRoleMutation } from "../hooks/useChangeRoleMutation"
import { useGetMember } from "../hooks/useGetMember"
import { useChangeRoleDialog } from "../store/changeRoleStore"
import type { ChangeRoleSchema, TeamMemberWithUser } from "../type"
import ChangeRoleForm from "./forms/ChangeRoleForm"

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
    const queryClient = useQueryClient();

    const projectId = useProjectIdStore(state => state.projectId);
    const setIsOpen = useChangeRoleDialog((state) => state.setIsOpen);
    const memberId = useChangeRoleDialog((state) => state.memberId);

    const { mutateAsync, isPending } = useChangeRoleMutation(memberId || "");

    const handleConfirm = async (data: ChangeRoleSchema) => {
        await mutateAsync({ newRole: data.role }, {
            onSuccess: () => {
                setIsOpen(false);
                queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
            }
        })
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

            <ChangeRoleForm 
            onsubmit={handleConfirm}
            isLoading={isPending}
            initialData={member}
            />
        </>
    )
}

export default ChangeRoleDialog