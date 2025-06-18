import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Ellipsis } from "lucide-react"
import { useState } from "react"

const BoardCardOptions = () => {
    const [open, setOpen] = useState<boolean>(false)
    
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Ellipsis className="h-5 w-5"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-52 p-1">
                <Button variant="ghost" className="w-full justify-start">
                    Move column to the left
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                    Move column to the right
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                    Delete
                </Button>
            </PopoverContent>
        </Popover>
    )
}

export default BoardCardOptions