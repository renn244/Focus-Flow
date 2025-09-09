import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TeamMemberWithUser } from "../type";

type getMemberSuccessResponse = TeamMemberWithUser;
type getMemberResponse = AxiosResponse<getMemberSuccessResponse, ExceptionResponse>;

const getMember = async (projectId: string | null, memberId: string | null): Promise<getMemberResponse['data'] | null> => {
    const response = await axiosInstance.get('/team', {
        params: { projectId, memberId }
    })

    if(response.status === 404) {
        return null;
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching the team member')
    }

    return response.data;
}

const getMemberQueryOptions = (
    projectId: string | null, 
    memberId: string | null,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getMember>>>, 'queryKey' | 'queryFn' | 'gcTime'>
): UseQueryOptions<Awaited<ReturnType<typeof getMember>>> => {
    return {
        queryKey: ['teamMember', projectId, memberId],
        queryFn: () => getMember(projectId, memberId),
        enabled: !!projectId && !!memberId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 5, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
        ...options
    }
}

export const useGetMember = (projectId: string | null, memberId: string | null) => {
    return useQuery(getMemberQueryOptions(projectId, memberId));
}