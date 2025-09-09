import AddMemberDialog from "@/features/teamMember/components/AddMemberDialog";
import ChangeRoleDialog from "@/features/teamMember/components/ChangeRoleDialog";
import RemoveMemberDialog from "@/features/teamMember/components/RemoveMemberDialog";
import TeamManagement from "@/features/teamMember/components/TeamManagement";
import useSelectBoardStore from "../../store/useSelectBoard";
import CreateColumnDialog from "../Column/CreateColumnDialog";
import EditColumnDialog from "../Column/EditColumnDialog";
import RemoveColumnDialog from "../Column/RemoveColumnDialog";
import SortableColumnView from "../Column/SortableColumnView";
import CreateTaskDialog from "../Task/CreateTaskDialog";
import EditTaskDialog from "../Task/EditTaskDialog";
import RemoveTaskDialog from "../Task/RemoveTaskDialog";
import ViewTaskDialog from "../Task/ViewTaskDialog";
import CreateBoardDialog from "./CreateBoardDialog";
import KanbanBoardHeader from "./KanbanBoardHeader";

const KanbanBoard = () => {
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    return (
        <div className="p-6">

            <KanbanBoardHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen">

                <SortableColumnView boardId={selectedBoardId} />

                <CreateColumnDialog />

                <EditColumnDialog />

                <RemoveColumnDialog />
            </div>

            {/* Board Dialog */}
            <CreateBoardDialog />

            {/* Task Dialog */}
            <ViewTaskDialog />

            <CreateTaskDialog />

            <EditTaskDialog />

            <RemoveTaskDialog />

            {/* Team Member */}
            <TeamManagement />

            <AddMemberDialog />

            <RemoveMemberDialog />

            <ChangeRoleDialog />
        </div>
    )
}

export default KanbanBoard