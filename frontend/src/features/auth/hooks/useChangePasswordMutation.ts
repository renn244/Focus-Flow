import { handleNestError, ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosResponse } from "axios";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

type changePasswordSuccessResponse = { message: string; };
type changePasswordResponse = AxiosResponse<changePasswordSuccessResponse, ExceptionResponse>;

const changePassword = async (data: any): Promise<changePasswordResponse['data']> => {
    const response = await axiosInstance.post('/forget-password-token/change-password', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while changing the password');
    }

    return response.data;
}

export const useChangePasswordMutation = <T extends FieldValues>(setError: UseFormSetError<T>) => {
    const navigate = useNavigate();
    
    return useMutation({
        mutationFn: changePassword,
        onSuccess: (data) => {
            toast.success(data.message || 'Password changed successfully');
            navigate({ to: '/login', replace: true });
        },
        onError: (error: any | ValidationError) => {
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError);
            } else {
                toast.error(error.message || 'An error occurred while changing the password');
            }
        }
    })
}