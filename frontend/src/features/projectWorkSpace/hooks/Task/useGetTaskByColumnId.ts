import type { AxiosResponse } from "axios";
import type { Task } from "../../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import axiosInstance from "@/lib/httpService";
import { useQuery } from "@tanstack/react-query";

type getTaskByColumnIdSuccessResponse = Task[];
type getTaskByColumnIdResponse = AxiosResponse<getTaskByColumnIdSuccessResponse, ExceptionResponse>;

const getTaskByColumnId = async (columnId: string): Promise<getTaskByColumnIdResponse['data']> => {
    const response = await axiosInstance.get(`/task/byColumn/${columnId}`);

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching tasks by column ID');
    }

    return response.data;
}

export const useGetTaskByColumnId = (columnId: string) => {
    return useQuery({
        queryKey: ['tasks', 'bycolumn', columnId],
        queryFn: () => getTaskByColumnId(columnId),
        enabled: !!columnId, // Only run the query if columnId is truthy
        refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
        staleTime: 5 * 60 * 1000, // Optional: Cache the result for 5 minutes
        gcTime: 10 * 60 * 1000, // Optional: Garbage collect after 10 minutes
    })
}