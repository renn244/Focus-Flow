import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { BoardWithColumns } from "../../type"; 

type getBoardsSuccessResponse = BoardWithColumns[];
type getBoardResponse = AxiosResponse<getBoardsSuccessResponse, ExceptionResponse>;

const getBoards = async (projectId: string): Promise<getBoardResponse['data']> => {
    const response = await axiosInstance.get(`/board/byProject/${projectId}`);

    return response.data;
}

export const useGetBoards = (projectId: string) => {
    return useQuery({
        queryKey: ['boards', projectId],
        queryFn: () => getBoards(projectId),
        enabled: !!projectId,
        refetchOnWindowFocus: false,
        retry: 1,
    })
}