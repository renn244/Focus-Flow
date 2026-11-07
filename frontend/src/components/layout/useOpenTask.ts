import { useNavigate } from "@tanstack/react-router";
import useSelectBoardStore from "@/features/projectWorkSpace/store/useSelectBoard";
import useTaskDialogStore from "@/features/projectWorkSpace/store/useTaskDialog";
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type";

/** Opens a task's board and its task dialog from anywhere in the shell. */
export const useOpenTask = () => {
    const navigate = useNavigate();
    const setSelectedBoardId = useSelectBoardStore((state) => state.setSelectedBoardId);
    const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);

    return (task: Pick<TaskWithBoardAndColumn, "_id" | "board">) => {
        setSelectedBoardId(task.board._id);
        setViewTaskId(task._id);
        navigate({ to: "/projects/$projectId", params: { projectId: task.board.projectId } });
    };
};
