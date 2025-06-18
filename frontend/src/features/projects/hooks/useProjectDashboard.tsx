import { queryOptions } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";

type recentProjectsSuccessResponse = any;
type recentProjectResponse = AxiosResponse<recentProjectsSuccessResponse, ExceptionResponse>;

const recentProjects = async (): Promise<recentProjectResponse['data']> => {
    const response = await axiosInstance.get('/projects/recent');

    return response.data;
}

export const useRecentQueryOptions = () => {
    return queryOptions({
        queryKey: ['recentProjects'],
        queryFn: recentProjects,
        staleTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
    })
}

// do later for the Worked on, Assigned to me, Sprint overview in thw WorkSummaryPanel

