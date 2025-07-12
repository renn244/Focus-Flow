import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import useSelectBoardStore from "../../store/useSelectBoard";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import type { BoardWithColumns } from "../../type";

type SwitchBoardProps = {
    boards: BoardWithColumns[];
}

const SwitchBoard = ({
    boards = [],
}: SwitchBoardProps) => {
    const { selectedBoardId, setSelectedBoardId } = useSelectBoardStore();
    
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-transparent">
                    <Calendar className="w-4 h-4" />
                    Switch Board
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
                {boards?.map((board) => (
                    <DropdownMenuItem
                    key={board._id}
                    onClick={() => setSelectedBoardId(board._id)}
                    className={`flex flex-col items-start gap-1 p-3 ${selectedBoardId === board._id ? "bg-blue-50" : ""}`}
                    >
                        <div className="flex items-center gap-2 w-full">
                    
                            <div className={`w-2 h-2 rounded-full ${selectedBoardId === board._id ? "bg-blue-500" : "bg-slate-300"}`} />
                            <span className="font-medium">{board.name}</span>
                        </div>
                        <span className="text-xs text-slate-500 line-clamp-2 ml-4">{board.description}</span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default SwitchBoard