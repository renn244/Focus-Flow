import type { AxiosResponse } from "axios";
import type { TeamMemberUser } from "../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import axiosInstance from "@/lib/httpService";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

type SearchUserSuccessResponse = TeamMemberUser[];
type SearchUserResponse = AxiosResponse<SearchUserSuccessResponse, ExceptionResponse>;

const searchUser = async (query: string, projectId: string): Promise<SearchUserResponse['data']> => {
    const response = await axiosInstance.get(`/team/search-user`, {
        params: {
            query,
            projectId
        }
    });

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while searching for users');
    }

    return response.data;
}

export const searchUserQueryOptions = (
    query: string,
    projectId: string,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof searchUser>>, Error>, 'queryKey' | 'queryFn' | 'gcTime'>,
): UseQueryOptions<Awaited<ReturnType<typeof searchUser>>, Error> => {
    return {
        queryKey: ['searchUser', query, projectId],
        queryFn: () => searchUser(query, projectId),
        enabled: !!query && !!projectId,
        staleTime: 1000 * 60 * 5, // 5 minutes
        gcTime: 1000 * 60 * 5, // 5 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        ...options
    }
}

export const useSearchUser = (query: string, projectId: string) => {
    return useQuery(searchUserQueryOptions(query, projectId));
}