import { ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

type changeRoleSuccessResponse = any;
type changeRoleResponse = AxiosResponse<changeRoleSuccessResponse, ExceptionResponse>;

const changeRole = async (memberId: string, newRole: 'owner' | 'admin' | 'member'): Promise<changeRoleResponse['data']> => {
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
    return useMutation({
        mutationKey: ['teamMembers', 'changeRole', memberId],
        mutationFn: (args: { newRole: 'owner' | 'admin' | 'member' }) => changeRole(memberId, args.newRole),
    })
}
