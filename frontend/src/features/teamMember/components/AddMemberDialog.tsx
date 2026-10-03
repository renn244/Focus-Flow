import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId"
import { Dialog } from "@radix-ui/react-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { UserPlus } from "lucide-react"
import { useAddMemberMutation } from "../hooks/useAddMemberMutation"
import { useAddMemberDialog } from "../store/addMemberStore"
import AddMemberForm from "./forms/AddMemberForm"

const AddMemberDialog = () => {
  const { isOpen, setIsOpen } = useAddMemberDialog();

  const handleOnOpenChange = (value: boolean) => {
    setIsOpen(value);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOnOpenChange}>
      <DialogContent
        className="max-h-[90vh] max-w-4xl overflow-hidden"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <AddMember handleOnOpenChange={handleOnOpenChange} />
      </DialogContent>
    </Dialog>
  )
}

type AddMemberProps = {
  handleOnOpenChange: (value: boolean) => void;
}

const AddMember = ({ handleOnOpenChange }: AddMemberProps) => {

  const projectId = useProjectIdStore((state) => state.projectId);

  const  { mutateAsync, isPending } = useAddMemberMutation();
  const queryClient = useQueryClient();

  const handleSubmit = async (userId: string, role: "admin" | "member") => { 
    await mutateAsync({ 
      userId: userId, 
      projectId: projectId || "",
      role: role as "admin" | "member", 
    }, {
      onSuccess: () => {
        handleOnOpenChange(false);
        
        queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] });
        queryClient.invalidateQueries({ queryKey: ['teamMembersTable', projectId] });
        queryClient.invalidateQueries({ queryKey: ['searchUser'] });
      }
    })
  }

  return (
    <>
      <DialogHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <DialogTitle className="text-xl font-bold">Add Team Member</DialogTitle>
            <p className="text-sm text-gray-600">Invite new members or add existing users to your project</p>
          </div>
        </div>
      </DialogHeader>

      <AddMemberForm 
      onsubmit={({ selectedUserId, role }) => handleSubmit(selectedUserId, role)}
      isLoading={isPending}
      />
    </>
  )
}

export default AddMemberDialog
