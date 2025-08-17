import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

type changeRoleSuccessResponse = any;
type changeRoleResponse = AxiosResponse<changeRoleSuccessResponse, ExceptionResponse>;

const changeRole = async (memberId: string, newRole: 'admin' | 'member'): Promise<changeRoleResponse['data']> => {
    const response = await axiosInstance.patch(`/team/update-role/${memberId}`, { newRole })

    if(response.status === 400) {
        throw new ValidationError(response.data.message)
    }

    if(response.status >= 400) {
        throw new Error(response.data.message);
    }

    return response.data;
}

export const useChangeRoleMutation = (memberId: string) => {
    const queryClient = useQueryClient();
    const projectId = useProjectIdStore(state => state.projectId);

    return useMutation({
        mutationKey: ['teamMembers', 'changeRole', memberId],
        mutationFn: (args: { newRole: 'admin' | 'member' }) => changeRole(memberId, args.newRole),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ['teamMembers', projectId] })
        },
    })
}