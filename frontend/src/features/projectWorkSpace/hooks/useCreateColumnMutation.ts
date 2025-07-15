import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import type { ColumnSchema } from "../type";
import axiosInstance from "@/lib/httpService";
import { ValidationError } from "@/lib/handleNestError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useSelectBoardStore from "../store/useSelectBoard";
import useColumnDialogStore from "../store/useColumnDialog";

type createColumnSuccessResponse = any;
type createColumnResponse = AxiosResponse<createColumnSuccessResponse, ExceptionResponse>;

const createColumn = async (data: ColumnSchema): Promise<createColumnResponse['data']> => {
    const response = await axiosInstance.post(`/column`, data);

    if(response.status === 400) {
        throw new ValidationError(response.data);   
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || "An error occurred while creating the column");
    }

    return response.data;
}

const useCreateColumnMutation = () => {
    const queryClient = useQueryClient();
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const setCreateOpen = useColumnDialogStore((state) => state.setCreateOpen);

    return useMutation({
        mutationFn: createColumn,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['columns', 'byboard', selectedBoardId] });
            setCreateOpen(false);
        }
    })
}

export default useCreateColumnMutation;