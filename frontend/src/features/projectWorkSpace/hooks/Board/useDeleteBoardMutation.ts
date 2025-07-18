import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useProjectIdStore } from "../../store/useProjectId"; 
import useSelectBoardStore from "../../store/useSelectBoard"; 
import useBoardDialogStore from "../../store/useBoardDialog"; 

type deleteBoardSuccessResponse = { message: string };
type deleteBoardResponse = AxiosResponse<deleteBoardSuccessResponse, ExceptionResponse>;

const deleteBoard = async (boardId: string): Promise<deleteBoardResponse['data']> => {
    const response = await axiosInstance.delete(`/board/${boardId}`);

    if(response.status >= 400) {
        throw new Error(response.data.message || "An error occurred while deleting the board");
    }

    return response.data;
}

export const useDeleteBoardMutation = (boardId: string) => {
    const queryClient = useQueryClient();
    const projectId = useProjectIdStore((state) => state.projectId);
    const setSelectedBoardId = useSelectBoardStore((state) => state.setSelectedBoardId);
    const setDeleteOpen = useBoardDialogStore((state) => state.setDeleteOpen);

    return useMutation({
        mutationFn: () => deleteBoard(boardId),
        onSuccess: () => {
            setDeleteOpen(false);
            setSelectedBoardId(null);
            queryClient.invalidateQueries({ queryKey: ['boards', projectId] })
        }
    })
}