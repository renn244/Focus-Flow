import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TeamMemberWithUser } from "../type";

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
    return useMutation({
        mutationFn: addMember,
    })
}