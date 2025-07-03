import { useQuery } from "@tanstack/react-query";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import axiosInstance from "@/lib/httpService";

type AllProjectsSuccessResponse = any[];
type AllProjectsResponse = AxiosResponse<AllProjectsSuccessResponse, ExceptionResponse>;

const allProjects = async (): Promise<AllProjectsResponse['data']> => {
    const response = await axiosInstance.get('/projects');

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching projects');
    }

    return response.data;
}

// should add pagination and sorting as well as filtering in the future
export const useAllProjects = () => {
    return useQuery({
        queryKey: ['allProjects'],
        queryFn: allProjects,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}