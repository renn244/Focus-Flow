import { useGetColumnByBoardId } from "../../hooks/useGetColumnByBoardId";
import useSelectBoardStore from "../../store/useSelectBoard";
import ColumnCard from "../Column/ColumnCard";
import CreateColumnDialog from "../Column/CreateColumnDialog";
import EditColumnDialog from "../Column/EditColumnDialog";
import RemoveColumnDialog from "../Column/RemoveColumnDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader";

type KanbanBoardProps = {
}

const KanbanBoard = ({
}: KanbanBoardProps) => {
    const selectBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    const { data: columns } = useGetColumnByBoardId(selectBoardId || "");

    return (
        <div className="p-6">

            <KanbanBoardHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns?.map((column: any) => (
                    <ColumnCard column={column} />
                ))}
                <CreateColumnDialog />

                <EditColumnDialog />

                <RemoveColumnDialog />
            </div>

            <CreateBoardDialog />

        </div>
    )
}

export default KanbanBoard