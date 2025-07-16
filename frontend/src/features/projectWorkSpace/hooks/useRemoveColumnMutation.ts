import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useSelectBoardStore from "../store/useSelectBoard";
import useColumnDialogStore from "../store/useColumnDialog";

type removeColumnSuccessResponse = any;
type removeColumnResponse = AxiosResponse<removeColumnSuccessResponse, ExceptionResponse>;

const removeColumn = async (columnId: string): Promise<removeColumnResponse['data']> => {
    const response = await axiosInstance.delete(`/column/${columnId}`);

    if(response.status >= 400) {
        throw new Error(response.data.messag || "An error occured while removing the column");
    }

    return response.data;
}

export const useRemoveColumnMutation = (columnId: string) => {
    const queryClient = useQueryClient();
    const setRemoveOpen = useColumnDialogStore((state) => state.setRemoveOpen)
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    return useMutation({
        mutationFn: () => removeColumn(columnId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', selectedBoardId] });
            setRemoveOpen(false);
        },
    })
}