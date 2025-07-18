import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useTaskDialogStore from "../../store/useTaskDialog"; 
import type { TaskSchema } from "../../type";

type createTaskSuccessResponse = any;
type createTaskResponse = AxiosResponse<createTaskSuccessResponse, any>;

const createTask = async (data: TaskSchema): Promise<createTaskResponse['data']> => {
    const response = await axiosInstance.post('/task', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while creating the task');
    }

    return response.data;
}

export const useCreateTaskMutation = () => {
    const queryClient = useQueryClient();
    const setCreateOpen = useTaskDialogStore((state) => state.setCreateOpen);

    return useMutation({
        mutationFn: createTask,
        onSuccess: (_, variable) => {
            // later use instead setQueryData. because it's expensive to invalidate all tasks
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', variable.boardId] });
            setCreateOpen(false);
        }
    })
}