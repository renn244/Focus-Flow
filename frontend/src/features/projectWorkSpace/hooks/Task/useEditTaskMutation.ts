import type { AxiosResponse } from "axios";
import type { Task } from "../../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTaskDialogStore from "../../store/useTaskDialog";

type TaskUpdate = Omit<Partial<Task>, 'assignee'> & { assignee?: string | null };
type editTaskSuccessResponse = Task;
type editTaskResponse = AxiosResponse<editTaskSuccessResponse, ExceptionResponse>;

const editTask = async (taskId: string, data: TaskUpdate): Promise<editTaskResponse['data']> => {
    const response = await axiosInstance.patch(`/task/${taskId}`, data);

    if (response.status === 400) {
        throw new ValidationError(response.data);
    }

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while updating the task');
    }

    return response.data;
}

export const useEditTaskMutation = (taskId: string) => {
    const queryClient = useQueryClient();
    const setEditOpen = useTaskDialogStore((state) => state.setEditOpen);

    return useMutation<Task, Error, TaskUpdate>({
        mutationFn: (data) => editTask(taskId, data),
        onSuccess: (data, variable) => {
            if (variable.boardId) {
                queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', variable.boardId] });
            }
            queryClient.invalidateQueries({ queryKey: ['task', data._id] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'by-project'] });
            setEditOpen(false);
        }
    })
}
