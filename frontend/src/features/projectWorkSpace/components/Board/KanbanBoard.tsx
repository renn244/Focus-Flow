import useSelectBoardStore from "../../store/useSelectBoard";
import CreateBoardDialog from "./CreateBoardDialog";
import EditBoardDialog from "./EditBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader"

type KanbanBoardProps = {
}

const KanbanBoard = ({
}: KanbanBoardProps) => {
    const selectBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    return (
        <div className="p-6">

            {/* Board Header here!! */}
            <KanbanBoardHeader />

            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((column) => (
                    <BoardCard column={column} />
                ))}
            </div> */}

            <CreateBoardDialog />

        </div>
    )
}

export default KanbanBoard