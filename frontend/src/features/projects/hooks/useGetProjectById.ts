import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProjectWithOwner } from "../type";

type getProjectByIdSuccessResponse = ProjectWithOwner; // project schema
type getProjectByIdResponse = AxiosResponse<getProjectByIdSuccessResponse, ExceptionResponse>;

const getProjectById = async (id: string): Promise<getProjectByIdResponse['data'] | null> => {
    const response = await axiosInstance.get(`/projects/${id}`);

    if(response.status === 404 || response.status === 400) {
        return null;
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching the project');
    }

    return response.data;
}

export const getProjectByIdQueryOptions = (id: string, type: 'query' | 'suspense'='query') => {
    return {
        queryKey: ['project', id],
        queryFn: () => getProjectById(id),
        ...(type === 'suspense' ? { enabled: !!id } : {}),
        gcTime: 0, // Disable garbage collection
        refetchOnWindowFocus: false, // Disable refetching on window focus
        retry: false, // Disable automatic retries
    };
}

export const useGetProjectById = (id: string) => {
    return useQuery(getProjectByIdQueryOptions(id));
}