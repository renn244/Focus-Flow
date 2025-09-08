import type { AxiosResponse } from "axios";
import type { TeamMemberUser } from "../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import axiosInstance from "@/lib/httpService";
import { useQuery } from "@tanstack/react-query";


type getActiveMembersSuccessResponse = TeamMemberUser[];
type getActiveMembersResponse = AxiosResponse<getActiveMembersSuccessResponse, ExceptionResponse>;

const getActiveMembers = async (projectId: string): Promise<getActiveMembersResponse['data']> => {
    const response = await axiosInstance.get(`/team/active-members/${projectId}`);

    if(response.status >= 400) {
        throw new Error(response.data.message);
    }

    return response.data;
}

export const useGetActiveMembers = (projectId: string | null) => {
    return useQuery({
        enabled: !!projectId,
        queryKey: ['teamMembers', 'activeMembers', projectId],
        queryFn: () => getActiveMembers(projectId || ""),
    })
}