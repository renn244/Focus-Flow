import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import type { BoardSchema } from "../type";
import axiosInstance from "@/lib/httpService";
import { ValidationError } from "@/lib/handleNestError";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useBoardDialogStore from "../store/useBoardDialog"
import { useProjectIdStore } from "../store/useProjectIdDialog";

type createBoardSuccessResponse = any;
type createBoardResponse = AxiosResponse<createBoardSuccessResponse, ExceptionResponse>;

const createBoard = async (data: BoardSchema): Promise<createBoardResponse['data']> => {
    const response = await axiosInstance.post('/board', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occured while creating the board')
    }

    return response.data;
}

export const useCreateBoardMutation = () => {
    const queryClient = useQueryClient();
    const setCreateOpen = useBoardDialogStore((state) => state.setCreateOpen);
    const projectId = useProjectIdStore((state) => state.projectId);
    
    return useMutation({
        mutationFn: createBoard,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['boards', projectId] });
            setCreateOpen(false);
        }
    })
}