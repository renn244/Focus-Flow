import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useProjectDialogStore from "../../store/useProjectDialog";
import ProjectForm from "../form/ProjectForm";
import { useEditProjectMutation } from "../../hooks/useEditProjectMutation";
import { useGetProjectById } from "../../store/useGetProjectById";
import LoadingSpinner from "@/components/ui/loadingSpinner";

const EditProjectDialog = () => {
    const isEditOpen = useProjectDialogStore((state) => state.isEditOpen);
    const editProjectId = useProjectDialogStore((state) => state.editProjectId);
    const setEditOpen = useProjectDialogStore((state) => state.setEditOpen);

    const { data, isLoading, error } = useGetProjectById(editProjectId || "");
    const { mutate, isPending } = useEditProjectMutation(editProjectId || "");

    if(isEditOpen === false || !editProjectId) {
        return null
    }
    
    return (
        <Dialog open={isEditOpen} onOpenChange={setEditOpen}>
            <DialogContent className="sm:max-w-[525px] md:max-w-[650px] lg:max-w-[750px]">
                <DialogHeader>
                   <DialogTitle>Edit Project</DialogTitle> 
                </DialogHeader>
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <>Something went wrong</>
                )}
                {(!data && !isLoading && !error ) && (
                    <>Not Found</>
                )}
                {data && (
                    <ProjectForm
                    initialData={{
                        name: data.name,
                        description: data.description,
                        priority: data.priority,
                        color: data.color,
                        dueDate: data.dueDate,
                    }}
                    onsubmit={mutate as any}
                    isLoading={isPending}
                    isUpdate
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EditProjectDialog