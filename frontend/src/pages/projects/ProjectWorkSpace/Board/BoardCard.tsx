import { Button } from "@/components/ui/button"
import { Ellipsis, Plus } from "lucide-react"
import BoardCardOptions from "./BoardCardOptions"

const BoardCard = () => {
    return (
        <div className="flex flex-col bg-muted rounded-sm p-1.5 min-w-[325px] min-h-[500px]">
            <header className="flex items-center justify-between group px-3">
                <span className="text-muted-foreground uppercase text-sm font-semibold">
                    To do
                </span>

                <BoardCardOptions />
            </header>

            <main className="flex-1">
                {/* Tasks */}
            </main>

            <footer>
                <Button className="w-full gap-1 justify-baseline rounded-sm bg-muted hover:bg-muted-foreground/40">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                    <span className="text-muted-foreground">Create</span>
                </Button>
            </footer>
        </div>
    )
}

export default BoardCard