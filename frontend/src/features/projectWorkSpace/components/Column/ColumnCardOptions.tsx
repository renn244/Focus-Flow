import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
import { useState } from "react"
import useColumnDialogStore from "../../store/useColumnDialog"
import type { Column } from "../../type"

type ColumnCardOptionsProps = {
    columnId: Column['_id'];
}

const ColumnCardOptions = ({
    columnId
}: ColumnCardOptionsProps) => {
    const setEditColumnId = useColumnDialogStore((state) => state.setEditColumnId);
    const setRemoveColumnId = useColumnDialogStore((state) => state.setRemoveColumnId);
    const [open, setOpen] = useState<boolean>(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-7" aria-label="Column options" title="Column options">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setEditColumnId(columnId)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit column
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRemoveColumnId(columnId)}
                className="text-red-600 focus:text-red-600">
                    <Trash2 className="h-4 w-4 mr-2 text-red-600" />
                    Remove Column
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default ColumnCardOptions;
