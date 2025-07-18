import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { Column } from "../../type"; 

type getColumnByBoardIdSuccessResponse = Column[];
type getColumnByBoardIdResponse = AxiosResponse<getColumnByBoardIdSuccessResponse, ExceptionResponse>;

const getColumnByBoardId = async (boardId: string): Promise<getColumnByBoardIdResponse['data']> => {
    const response = await axiosInstance.get(`/column/byBoard/${boardId}`);

    if(response.status >= 400) {
        throw new Error(response.data.message || "Failed to fetch columns");
    }

    return response.data;
}

export const useGetColumnByBoardId = (boardId: string) => {
    return useQuery({
        queryKey: ["columns", "byboard", boardId],
        queryFn: () => getColumnByBoardId(boardId),
        enabled: !!boardId, // Only run the query if boardId is provided
        refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
        staleTime: 5 * 60 * 1000, // Optional: Cache the result for 5 minutes
        gcTime: 10 * 60 * 1000, // Optional: Garbage collect after 10 minutes
    });
}