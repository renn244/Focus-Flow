import type { Column } from "../../type"
import BoardCard from "./BoardCard"

type KanbanBoardProps = {
    columns: Column[]
}

const KanbanBoard = ({
    columns
}: KanbanBoardProps) => {
    console.log(columns)
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {columns.map((column) => (
                <BoardCard column={column} />
            ))}
        </div>
    )
}

export default KanbanBoard