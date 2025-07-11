import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProjectForm from "../form/ProjectForm";
import useProjectDialogStore from "../../store/useProjectDialog";
import { useCreateProjectMutation } from "../../hooks/useCreateProjectMutation";

const CreateProjectDialog = () => {
    const isCreateOpen = useProjectDialogStore((state) => state.isCreateOpen);
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const { mutateAsync, isPending } = useCreateProjectMutation();

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="sm:max-w-[525px] md:max-w-[650px] lg:max-w-[750px]">
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <ProjectForm isLoading={isPending} onsubmit={mutateAsync as any} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateProjectDialog