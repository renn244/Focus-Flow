import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TeamMembersPage, TeamMemberTableSortField, TeamMemberTableSortOrder } from "../type";

export type TeamMembersTableParams = {
    page: number;
    limit: number;
    search: string;
    sortBy: TeamMemberTableSortField;
    sortOrder: TeamMemberTableSortOrder;
}

type GetTeamMembersTableResponse = AxiosResponse<TeamMembersPage, ExceptionResponse>;

const getTeamMembersTable = async (
    projectId: string,
    params: TeamMembersTableParams,
): Promise<GetTeamMembersTableResponse['data']> => {
    const response = await axiosInstance.get(`/team/members/${projectId}`, { params });

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while fetching team members');
    }

    return response.data;
}

export const useGetTeamMembersTable = (projectId: string, params: TeamMembersTableParams) => {
    return useQuery({
        queryKey: ['teamMembersTable', projectId, params],
        queryFn: () => getTeamMembersTable(projectId, params),
        enabled: !!projectId,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 5,
        placeholderData: keepPreviousData,
        refetchOnWindowFocus: false,
        retry: 1,
    });
}
