import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TeamMember } from "../type";

type removeMemberSuccessResponse = TeamMember;
type removeMemberResponse = AxiosResponse<removeMemberSuccessResponse, ExceptionResponse>;

type removeMemberParams = { projectId: string; userId: string; }

const removeMember = async (params: removeMemberParams): Promise<removeMemberResponse['data']> => {
    const response = await axiosInstance.delete('/team/remove-member', {
        data: params
    })

    if (response.status === 400) {
        throw new ValidationError(response.data);
    }

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while removing the team member');
    }

    return response.data;
}

export const useRemoveMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: removeMember,
        onSuccess: (_, variable) => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers', variable.projectId] });
        }
    })
}