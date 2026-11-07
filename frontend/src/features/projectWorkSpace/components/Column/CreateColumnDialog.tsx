import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import  ColumnForm from "../forms/ColumnForm"
import useSelectBoardStore from "../../store/useSelectBoard";
import useCreateColumnMutation from "../../hooks/Column/useCreateColumnMutation"; 
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import useColumnDialogStore from "../../store/useColumnDialog";


const CreateColumnDialog = () => {
    const setCreateOpen = useColumnDialogStore((state) => state.setCreateOpen);
    const isCreateOpen = useColumnDialogStore((state) => state.isCreateOpen);
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    
    const { mutateAsync, isPending } = useCreateColumnMutation();

    if(!selectedBoardId) return null;

    return (
        <Dialog open={isCreateOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="hidden bg-card sm:inline-flex">
                    <Plus />
                    Add column
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add column</DialogTitle>
                </DialogHeader>
                <ColumnForm boardId={selectedBoardId || ""} 
                isLoading={isPending} onsubmit={mutateAsync as any} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateColumnDialog
