import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import useColumnDialogStore from "../../store/useColumnDialog"; 
import type { Column } from "../../type"; 

type editColumnSuccessResponse = Column;
type editColumnResponse = AxiosResponse<editColumnSuccessResponse, ExceptionResponse>;

const editColumn = async (id: string, data: any): Promise<editColumnResponse['data']> => {
    const response = await axiosInstance.patch(`/column/${id}`, data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) { 
        throw new Error(response.data.message || 'An error occurred while updating the column');
    }

    return response.data;
}

export const useEditColumnMutation = (columnId: string) => {
    const queryClient = useQueryClient();
    const setEditOpen = useColumnDialogStore((state) => state.setEditOpen);

    return useMutation({
        mutationFn: (data) => editColumn(columnId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['columns'] });
            queryClient.invalidateQueries({ queryKey: ['column', columnId] });
            setEditOpen(false);
        }
    })
}