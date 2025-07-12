import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { BoardWithColumns } from "../type";

type getBoardByIdSuccessResponse = BoardWithColumns;
type getBoardByIdResponse = AxiosResponse<getBoardByIdSuccessResponse, ExceptionResponse>;

const getBoardById = async (boardId: string): Promise<getBoardByIdResponse['data'] | null> => {
    const project = await axiosInstance.get(`/board/${boardId}`);

    if(project.status === 404) {
        return null;
    }

    if(project.status >= 400) {
        throw new Error(project.data.message || "An error occurred while fetching the project.");
    }

    return project.data;
}

export const useGetBoardById = (boardId: string) => {
    return useQuery({
        queryKey: ['board', boardId],
        queryFn: () => getBoardById(boardId),
        enabled: !!boardId,
        refetchOnWindowFocus: false,
        retry: 1,
    })
}