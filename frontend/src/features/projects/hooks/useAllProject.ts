import { useQuery } from "@tanstack/react-query";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { AxiosResponse } from "axios";
import axiosInstance from "@/lib/httpService";
import useProjectFilterStore from "../store/useProjectFilter";

type AllProjectsSuccessResponse = any[];
type AllProjectsResponse = AxiosResponse<AllProjectsSuccessResponse, ExceptionResponse>;

const allProjects = async (query: any): Promise<AllProjectsResponse['data']> => {
    const response = await axiosInstance.get('/projects', {
        params: query,
    });

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching projects');
    }

    return response.data;
}

// should add pagination and sorting as well as filtering in the future
export const useAllProjects = () => {
    const filterStatus = useProjectFilterStore((state) => state.filterStatus);
    const filterPriority = useProjectFilterStore((state) => state.filterPriority);

    return useQuery({
        queryKey: ['allProjects', filterStatus, filterPriority],
        queryFn: () => allProjects({ status: filterStatus, priority: filterPriority }),
        refetchOnWindowFocus: false,
        retry: 1,
    });
}