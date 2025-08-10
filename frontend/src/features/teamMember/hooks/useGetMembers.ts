import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TeamMemberWithUser } from "../type";

type GetMembersSuccessResponse = TeamMemberWithUser[];
type GetMembersResponse = AxiosResponse<GetMembersSuccessResponse, ExceptionResponse>;

const getMembers = async (projectId: string): Promise<GetMembersResponse['data']> => {
    const response = await axiosInstance.get(`/team/${projectId}`);

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching team members');
    }

    return response.data;
}

export const getMembersQueryOptions = (
    projectId: string, 
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getMembers>>, Error>, 'queryKey' | 'queryFn' | 'gcTime'>
): UseQueryOptions<Awaited<ReturnType<typeof getMembers>>, Error> => {
    return {
        queryKey: ['teamMembers', projectId],
        queryFn: () => getMembers(projectId),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        ...options
    }
}

export const useGetMembers = (projectId: string) => {
    return useQuery(getMembersQueryOptions(projectId));
}