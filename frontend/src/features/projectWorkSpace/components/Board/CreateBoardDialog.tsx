import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BoardForm from "../forms/BoardForm"
import { useCreateBoardMutation } from "../../hooks/useCreateBoardMutation"
import useBoardDialogStore from "../../store/useBoardDialog"
import { useProjectIdStore } from "../../store/useProjectIdDialog"

const CreateBoardDialog = () => {
    const isCreateOpen = useBoardDialogStore((state) => state.isCreateOpen);
    const setCreateOpen = useBoardDialogStore((state) => state.setCreateOpen);
    const projectId = useProjectIdStore((state) => state.projectId) as string;

    const { mutate, isPending } = useCreateBoardMutation();

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new board</DialogTitle>
                </DialogHeader>

                <BoardForm isLoading={isPending} projectId={projectId} 
                onsubmit={mutate as any} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateBoardDialog