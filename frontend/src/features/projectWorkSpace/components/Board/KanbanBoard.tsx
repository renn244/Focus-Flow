import Sortable from "@/components/common/DndKit/Sortable";
import { horizontalListSortingStrategy } from "@dnd-kit/sortable";
import { useGetColumnByBoardId } from "../../hooks/useGetColumnByBoardId";
import { useReorderColumnMutation } from "../../hooks/useReorderColumnMutation";
import useSelectBoardStore from "../../store/useSelectBoard";
import ColumnCard from "../Column/ColumnCard";
import CreateColumnDialog from "../Column/CreateColumnDialog";
import EditColumnDialog from "../Column/EditColumnDialog";
import RemoveColumnDialog from "../Column/RemoveColumnDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader";
import transformReorderColumn from "../../utils/transformReorderColumn";

type KanbanBoardProps = {
}

const KanbanBoard = ({
}: KanbanBoardProps) => {
    const selectBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const { data: columns } = useGetColumnByBoardId(selectBoardId || "");
    const { mutateAsync: reorderColumn } = useReorderColumnMutation(selectBoardId || "");

    return (
        <div className="p-6">

            <KanbanBoardHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen">

                <Sortable
                items={columns || []} dataKey="_id" 
                onChange={async (data) => {
                    const columnOrders = transformReorderColumn(data);
                    await reorderColumn(columnOrders);
                }}
                strategy={horizontalListSortingStrategy}    
                renderItem={(item) => <ColumnCard key={item._id} column={item} /> }
                />

                <CreateColumnDialog />

                <EditColumnDialog />

                <RemoveColumnDialog />
            </div>

            <CreateBoardDialog />

        </div>
    )
}

export default KanbanBoard