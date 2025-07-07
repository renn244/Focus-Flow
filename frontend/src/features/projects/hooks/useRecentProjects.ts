import axiosInstance from "@/lib/httpService";
import type { ProjectList } from "../type";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";

type RecentProjectSuccessResponse = ProjectList;
type RecentProjectResponse = AxiosResponse<RecentProjectSuccessResponse, ExceptionResponse>;

const recentProjects = async (): Promise<RecentProjectResponse['data']> => {
    const response = await axiosInstance.get('/projects/recent');

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching recent projects');
    }    

    return response.data;
}

export const useRecentProjects = () => {
    return useQuery({
        queryKey: ['recentProjects'],
        queryFn: recentProjects,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}