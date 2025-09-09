import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { UserPlus, Users } from "lucide-react"
import { useGetMembers } from "../hooks/useGetMembers"
import { useTeamMemberSocket } from "../hooks/useTeamMemberSocket"
import { useTeamManagementStore } from "../store/TeamManagementStore"
import { useAddMemberDialog } from "../store/addMemberStore"
import TeamMemberCard from "./TeamMemberCard"

const TeamManagement = () => { 
    const isOpen = useTeamManagementStore((state) => state.isOpen);
    const setIsOpen = useTeamManagementStore((state) => state.setIsOpen);
    const setIsOpenAddMember = useAddMemberDialog((state) => state.setIsOpen);

    const projectId = useProjectIdStore((state) => state.projectId); 
    const { data: teamMembers } = useGetMembers(projectId || "");

    useTeamMemberSocket(projectId);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] gap-0">
                <DialogHeader className="pb-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold">Team Management</DialogTitle> 
                                <p className="text-sm text-gray-600">{teamMembers?.length}</p>
                            </div>
                        </div>
                        <Button 
                        onClick={() => {
                            setIsOpen(false);
                            setIsOpenAddMember(true);
                        }}
                        size="sm">
                            <UserPlus className="w-4 h-4" />
                            Add Member
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden">
                    <div className="overflow-y-auto w-full max-h-[calc(90vh-200px)]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {teamMembers?.map((member, idx) => (
                                <TeamMemberCard key={member._id} member={member} index={idx} />
                            ))}
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default TeamManagement