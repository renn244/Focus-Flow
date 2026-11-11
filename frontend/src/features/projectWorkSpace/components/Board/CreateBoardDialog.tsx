import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCreateBoardMutation } from "../../hooks/Board/useCreateBoardMutation" 
import useBoardDialogStore from "../../store/useBoardDialog"
import { useProjectIdStore } from "../../store/useProjectId"
import BoardForm from "../forms/BoardForm"

const CreateBoardDialog = () => {
    const isCreateOpen = useBoardDialogStore((state) => state.isCreateOpen);
    const setCreateOpen = useBoardDialogStore((state) => state.setCreateOpen);
    const projectId = useProjectIdStore((state) => state.projectId) as string;

    const { mutateAsync, isPending } = useCreateBoardMutation();

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new board</DialogTitle>
                </DialogHeader>

                <BoardForm isLoading={isPending} projectId={projectId} 
                onsubmit={mutateAsync} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateBoardDialog