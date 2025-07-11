import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import BoardForm from "../forms/BoardForm"
import { useEditBoardMutation } from "../../hooks/useEditBoardMutation";
import useBoardDialogStore from "../../store/useBoardDialog";

type EditBoardDialogProps = {
    board: any;
}

const EditBoardDialog = ({
    board
}: EditBoardDialogProps) => {
    const isEditOpen = useBoardDialogStore((state) => state.isEditOpen);
    const setEditOpen = useBoardDialogStore((state) => state.setEditOpen);

    // rn we are assuming that the active board is the one we want to edit
    // this is because we are not using a boardId in the store, but rather the
    // editBoardId which is set when the user clicks on the edit button
    const { mutate, isPending } = useEditBoardMutation(board?._id);

    return (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Board</DialogTitle>
                </DialogHeader>

                <BoardForm 
                isLoading={isPending} onsubmit={mutate as any} 
                initialData={{
                    name: board.name,
                    description: board.description,
                    projectId: board.projectId
                }} isUpdate />
            </DialogContent>
        </Dialog>
    )
}

export default EditBoardDialog