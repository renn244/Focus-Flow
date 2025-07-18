import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import TaskForm from "../forms/TaskForm"
import useTaskDialogStore from "../../store/useTaskDialog"
import useSelectBoardStore from "../../store/useSelectBoard";
import { useCreateTaskMutation } from "../../hooks/Task/useCreateTaskMutation";

const CreateTaskDialog = () => {
    const isCreateOpen = useTaskDialogStore((state) => state.isCreateOpen);
    const setCreateOpen = useTaskDialogStore((state) => state.setCreateOpen);
    const createColumnId = useTaskDialogStore((state) => state.createColumnId);
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    const { mutateAsync, isPending } = useCreateTaskMutation();

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create new task</DialogTitle>
                </DialogHeader>

                <TaskForm
                onsubmit={mutateAsync} 
                columnId={createColumnId || ""}
                boardId={selectedBoardId || ""}
                isLoading={isPending} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateTaskDialog