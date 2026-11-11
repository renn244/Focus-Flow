import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";

type reorderColumnSuccessResponse = { message: string, updatedCount: number };
type reorderColumnResponse = AxiosResponse<reorderColumnSuccessResponse, ExceptionResponse>;

const reorderColumn = async (boardId: string, reorderColumn: { _id: string, order: number }[]): Promise<reorderColumnResponse['data']> => {
    const response = await axiosInstance.patch(
        `/column/reorder/${boardId}`, 
        { columns: reorderColumn }
    );
    
    if(response.status >= 400) {
        throw new Error(response.data.message || "An error occurred while reordering columns");
    }

    return response.data;
}

export const useReorderColumnMutation = (boardId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (reorderColumnData: { _id: string, order: number }[]) => reorderColumn(boardId, reorderColumnData),
        onMutate: (reorderColumnData) => {
            queryClient.setQueryData(
                ['columns', 'byboard', boardId],
                (oldData: { _id: string; order: number }[] | undefined) => {
                    // Build that becomes O(N) instead of O(N^2)(double looping)
                    const orderMap = new Map(reorderColumnData.map((col) => [col._id, col.order]));

                    if (!oldData) return oldData;
                    return oldData
                        .map((column) => ({
                            ...column, order: orderMap.get(column._id) ?? column.order,
                        }))
                        .sort((a, b) => a.order - b.order);
                }
            );

            queryClient.cancelQueries({ queryKey: ['columns', 'byboard', boardId] });
            const previousColumns = queryClient.getQueryData(['columns', 'byboard', boardId])

            return { previousColumns, reorderColumnData }
        },
        onError: (_, __, context) => {
            // rollback to previous column orders
            queryClient.setQueryData(['columns', 'byboard', boardId], () => (context?.previousColumns || []));
            toast.error("An error occurred while reordering columns", { position: "top-center" });
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', boardId] });
        }
    })
}