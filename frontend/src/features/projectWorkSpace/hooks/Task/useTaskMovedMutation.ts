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
            queryClient.setQueryData(
                ["columns", "byboard", selectedBoardId],
                (oldData: ColumnWithTasks[]): ColumnWithTasks[] => {
                    const task = oldData.find((item) => item._id === movedData.taskCurrentColumnId)
                        ?.tasks.find((task) => task._id === movedData.taskId);

                    if(!task) return oldData;

                    const updatedData = oldData.map((column) => {
                        if(column._id === movedData.taskCurrentColumnId) {
                            return {
                                ...column, tasks: column.tasks.filter((task) => task._id !== movedData.taskId)
                            }
                        }

                        if(column._id === movedData.taskFutureColumnId) {
                            return {
                                ...column, tasks: [...column.tasks, task]
                            }
                        }

                        return column;
                    })

                    return updatedData;
                }
            )

            queryClient.cancelQueries({ queryKey: ['columns', 'byboard', selectedBoardId] });
            const previousColumns = queryClient.getQueryData(['columns', 'byboard', selectedBoardId]);

            return { previousColumns, movedData }
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(['columns', 'byboard', selectedBoardId], () => (context?.previousColumns || []))
            toast.error("An error occured while moving the task", { position: "top-center" })
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', selectedBoardId] })
            queryClient.invalidateQueries({ queryKey: ['tasks', 'by-project'] });
        }
    })
}
