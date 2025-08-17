import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

type getUserInfoSuccessResponse = any;
type getUserInfoResponse = AxiosResponse<getUserInfoSuccessResponse, ExceptionResponse>;

const getUserInfo = async (userId: string, projectId: string): Promise<getUserInfoResponse['data']> => {
    const response = await axiosInstance.get('/team/user-info', { params: { userId, projectId } })

    if(response.status === 404) {
        return null;
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching the user info');
    }

    return response.data;
}

const getUserInfoQueryOptions = (
    userId: string,
    projectId: string,
    options?: Omit<UseQueryOptions<Awaited<ReturnType<typeof getUserInfo>>>, 'queryKey' | 'queryFn' | 'gcTime'>
): UseQueryOptions<Awaited<ReturnType<typeof getUserInfo>>> => {
    return {
        queryKey: ['userInfo', userId, projectId],
        queryFn: () => getUserInfo(userId, projectId),
        enabled: !!userId && !!projectId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        retry: 1,
        ...options
    }
}

export const useGetUserInfo = (userId: string, projectId: string) => {
    return useQuery(getUserInfoQueryOptions(userId, projectId));
}