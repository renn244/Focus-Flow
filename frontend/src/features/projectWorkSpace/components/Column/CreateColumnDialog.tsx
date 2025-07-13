import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import  ColumnForm from "../forms/ColumnForm"
import useSelectBoardStore from "../../store/useSelectBoard";
import useCreateColumnMutation from "../../hooks/useCreateColumnMutation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";


const CreateColumnDialog = () => {
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const { mutateAsync, isPending } = useCreateColumnMutation();

    if(!selectedBoardId) return null;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="icon" className="btn btn-primary">
                    <Plus />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create Column</DialogTitle>
                </DialogHeader>
                <ColumnForm boardId={selectedBoardId || ""} 
                isLoading={isPending} onsubmit={mutateAsync as any} />
            </DialogContent>
        </Dialog>
    )
}

export default CreateColumnDialog