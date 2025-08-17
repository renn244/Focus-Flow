import type { AxiosResponse } from "axios";
import type { TeamMemberWithUser } from "../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import axiosInstance from "@/lib/httpService";
import { ValidationError } from "@/lib/handleNestError";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type addMemberSuccessResponse = TeamMemberWithUser;
type addMemberResponse = AxiosResponse<addMemberSuccessResponse, ExceptionResponse>;

type addMemberParams = {
    userId: string;
    projectId: string;
    role: "admin" | "member";
}

const addMember = async (data: addMemberParams): Promise<addMemberResponse['data']> => {
    const response = await axiosInstance.post('/team/add-member', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while adding the team member');
    }

    return response.data;
}

export const useAddMemberMutation = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: addMember,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers', data.projectId] });
        }
    })
}