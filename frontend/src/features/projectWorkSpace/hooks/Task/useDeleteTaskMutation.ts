import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useTaskDialogStore from "../../store/useTaskDialog";


type deleteTaskSuccessResponse = { message: string };
type deleteTaskResponse = AxiosResponse<deleteTaskSuccessResponse, ExceptionResponse>;

const deleteTask = async (taskId: string): Promise<deleteTaskResponse['data']> => {
    const response = await axiosInstance.delete(`/task/${taskId}`);

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while deleting the task');
    }

    return response.data;
}

export const useDeleteTaskMutation = (taskId: string, columnId: string) => {
    const queryClient = useQueryClient();
    const setRemoveOpen = useTaskDialogStore((state) => state.setRemoveOpen);

    return useMutation({
        mutationFn: () => deleteTask(taskId),
        onSuccess: () => {
            setRemoveOpen(false);

            queryClient.invalidateQueries({ queryKey: ['tasks', 'bycolumn', columnId] });
        },
    })
}