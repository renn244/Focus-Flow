import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import useTaskDialogStore from "../../store/useTaskDialog"
import { useGetTaskById } from "../../hooks/Task/useGetTaskById";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog";
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog";
import TaskForm from "../forms/TaskForm";
import { useEditTaskMutation } from "../../hooks/Task/useEditTaskMutation";
import { DialogTitle } from "@radix-ui/react-dialog";

const EditTaskDialog = () => {
    const isEditOpen = useTaskDialogStore((state) => state.isEditOpen);
    const setEditOpen = useTaskDialogStore((state) => state.setEditOpen);
    const editTaskId = useTaskDialogStore((state) => state.editTaskId);

    const { data, isLoading, error, refetch, isRefetching } = useGetTaskById(editTaskId);
    const { mutateAsync, isPending } = useEditTaskMutation(editTaskId || "");

    if (!isEditOpen || !editTaskId) {
        return null;
    }

    return (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Task</DialogTitle>
                </DialogHeader>
                {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog 
                    onBack={() => setEditOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Error Fetching Task"
                    message="There was an error fetching the task details. Please try again later."
                    />
                )}
                {(!data && !isLoading && !error) && (
                    <NotFoundDialog
                        title="Task Not Found"
                        message="The task you are trying to edit does not exist or has been deleted."
                        onBack={() => setEditOpen(false)}
                        onRetry={refetch}
                        retryLoading={isRefetching}
                    />
                )}
                {data && (
                    <TaskForm 
                    isUpdate
                    initialData={{
                        title: data.title,
                        description: data.description,
                        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
                        priority: data.priority,
                        tags: data.tags,
                        assignee: data.assignee,
                    }}
                    onsubmit={mutateAsync as any}
                    isLoading={isPending}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EditTaskDialog
