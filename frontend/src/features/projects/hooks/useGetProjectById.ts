import axiosInstance from "@/lib/httpService";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";

type getProjectByIdSuccessResponse = any; // project schema
type getProjectByIdResponse = AxiosResponse<getProjectByIdSuccessResponse, ExceptionResponse>;

const getProjectById = async (id: string): Promise<getProjectByIdResponse['data'] | null> => {
    const response = await axiosInstance.get(`/projects/${id}`);

    if(response.status === 404) {
        return null;
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching the project');
    }

    return response.data;
}

export const useGetProjectById = (id: string) => {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => getProjectById(id),
        enabled: !!id, // Only run the query if id is provided
        gcTime: 0, // Disable garbage collection
        refetchOnWindowFocus: false, // Disable refetching on window focus
        retry: false, // Disable automatic retries
    })
}