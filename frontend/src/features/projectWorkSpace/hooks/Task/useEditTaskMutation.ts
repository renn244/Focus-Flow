import type { AxiosResponse } from "axios";
import type { Task } from "../../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useTaskDialogStore from "../../store/useTaskDialog";

type editTaskSuccessResponse = Task;
type editTaskResponse = AxiosResponse<editTaskSuccessResponse, ExceptionResponse>;

const editTask = async (taskId: string, data: any): Promise<editTaskResponse['data']> => {
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

    return useMutation<Task, Error, Task>({
        mutationFn: (data) => editTask(taskId, data),
        onSuccess: (data, variable) => {
            queryClient.invalidateQueries({ queryKey: ['tasks', 'bycolumn', variable.columnId] });
            queryClient.invalidateQueries({ queryKey: ['task', data._id] });
            setEditOpen(false);
        }
    })
}