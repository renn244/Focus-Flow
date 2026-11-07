import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useSelectBoardStore from "../../store/useSelectBoard";
import type { ColumnWithTasks } from "../../type";
import { toast } from "sonner";


type taskMovedSuccessResponse = { message: string };
type taskMovedResponse = AxiosResponse<taskMovedSuccessResponse, ExceptionResponse>;

type taskMovedParams = { taskId: string; taskCurrentColumnId: string; taskFutureColumnId: string; }
const taskMoved = async ({ taskId, taskCurrentColumnId, taskFutureColumnId }: taskMovedParams): Promise<taskMovedResponse['data']> => {
    const response = await axiosInstance.patch(`/task/moved/${taskId}`, { taskCurrentColumnId, taskFutureColumnId });

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while moving the task');
    }

    return response.data;
}

export const useTaskMovedMutation = () => {
    const queryClient = useQueryClient();
    const selectedBoardId  = useSelectBoardStore((state) => state.selectedBoardId);

    return useMutation({
        mutationFn: taskMoved,
        // optimistically update the cache
        onMutate: async (movedData) => {
            const queryKey = ["columns", "byboard", selectedBoardId] as const;
            await queryClient.cancelQueries({ queryKey });
            const previousColumns = queryClient.getQueryData<ColumnWithTasks[]>(queryKey);

            queryClient.setQueryData<ColumnWithTasks[]>(
                queryKey,
                (oldData) => {
                    if (!oldData) return oldData;
                    const task = oldData.find((item) => item._id === movedData.taskCurrentColumnId)
                        ?.tasks.find((task) => task._id === movedData.taskId);
                    const destination = oldData.find((item) => item._id === movedData.taskFutureColumnId);

                    if(!task || !destination || movedData.taskCurrentColumnId === movedData.taskFutureColumnId) return oldData;

                    const updatedData = oldData.map((column) => {
                        if(column._id === movedData.taskCurrentColumnId) {
                            return {
                                ...column, tasks: column.tasks.filter((task) => task._id !== movedData.taskId)
                            }
                        }

                        if(column._id === movedData.taskFutureColumnId) {
                            return {
                                ...column, tasks: [...column.tasks.filter((item) => item._id !== task._id), {
                                    ...task,
                                    column: { ...task.column, _id: destination._id, title: destination.title, color: destination.color }
                                }]
                            }
                        }

                        return column;
                    })

                    return updatedData;
                }
            )

            return { previousColumns, queryKey }
        },
        onError: (error, __, context) => {
            if (context?.previousColumns) {
                queryClient.setQueryData(context.queryKey, context.previousColumns);
            }
            toast.error(error.message || "An error occurred while moving the task", { position: "top-center" })
        },
        onSettled: (_, __, movedData, context) => {
            queryClient.invalidateQueries({ queryKey: context?.queryKey ?? ['columns', 'byboard', selectedBoardId] })
            queryClient.invalidateQueries({ queryKey: ['tasks', 'by-project'] });
            queryClient.invalidateQueries({ queryKey: ['tasks', 'mine'] });
            queryClient.invalidateQueries({ queryKey: ['task', movedData.taskId] });
        }
    })
}
