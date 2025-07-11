import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { useState } from "react"

// Supposed to be named column
const BoardCardOptions = () => {
    const [open, setOpen] = useState<boolean>(false)
    
    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem>Add task</DropdownMenuItem>
                <DropdownMenuItem>Edit column</DropdownMenuItem>
                <DropdownMenuItem>Clear completed</DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default BoardCardOptions