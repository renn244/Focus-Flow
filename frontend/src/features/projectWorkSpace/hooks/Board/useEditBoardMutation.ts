import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import axiosInstance from "@/lib/httpService";
import { ValidationError } from "@/lib/handleNestError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useBoardDialogStore from "../../store/useBoardDialog";
import type { BoardWithColumns } from "../../type"; 

type editBoardSuccessResponse = BoardWithColumns;
type editBoardResponse = AxiosResponse<editBoardSuccessResponse, ExceptionResponse>;

const editBoard = async (id: string, data: unknown): Promise<editBoardResponse['data']> => {
    const response = await axiosInstance.patch(`/board/${id}`, data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occured while updating the board');
    }

    return response.data;
}

export const useEditBoardMutation = (boardId: string) => {
    const queryClient = useQueryClient();
    const editBoardId = useBoardDialogStore((state) => state.editBoardId);
    const setEditOpen = useBoardDialogStore((state) => state.setEditOpen);

    return useMutation({
        mutationFn: (data: unknown) => editBoard(boardId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards'] })
            queryClient.invalidateQueries({ queryKey: ['board', editBoardId] });
            setEditOpen(false);
        }
    })
}