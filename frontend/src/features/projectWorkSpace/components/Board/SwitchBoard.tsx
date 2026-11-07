import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, Plus } from "lucide-react";
import useSelectBoardStore from "../../store/useSelectBoard";
import type { BoardWithColumns } from "../../type";

type SwitchBoardProps = {
    boards: BoardWithColumns[];
    currentName?: string;
    onCreate: () => void;
}

/** Board picker: names the open board and switches to another or creates one. */
const SwitchBoard = ({
    boards = [], currentName, onCreate,
}: SwitchBoardProps) => {
    const { selectedBoardId, setSelectedBoardId } = useSelectBoardStore();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 min-w-0 max-w-full items-center gap-2 rounded-lg px-2 text-left text-lg font-semibold text-foreground hover:bg-accent focus-visible:outline-2 data-[state=open]:bg-accent">
                <span className="truncate">{currentName ?? "Choose a board"}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                <span className="sr-only">Switch board</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-72">
                <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">Boards in this project</DropdownMenuLabel>
                {boards.map((board) => {
                    const active = selectedBoardId === board._id;
                    return (
                        <DropdownMenuItem key={board._id} onClick={() => setSelectedBoardId(board._id)} className="items-start gap-2 py-2">
                            <Check className={cn("mt-0.5 size-4 shrink-0", active ? "text-primary" : "invisible")} />
                            <span className="min-w-0">
                                <span className={cn("block truncate", active && "font-semibold")}>{board.name}</span>
                                {board.description && <span className="line-clamp-2 text-xs text-muted-foreground">{board.description}</span>}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onCreate}>
                    <Plus className="size-4" />
                    New board
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SwitchBoard
