import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { handleNestError, ValidationError } from "@/lib/handleNestError";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useAuthContext } from "@/context/authContext";

type loginSuccessResponse = { access_token: string; refresh_token: string; };
type loginResponse = AxiosResponse<loginSuccessResponse, ExceptionResponse>;

const login = async (credentials: any): Promise<loginResponse['data']> => {
    const response = await axiosInstance.post('/auth/local/login', credentials);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 401) {
        throw new Error(response.data.message || "unexpected error occurred");
    }

    return response.data;
}

export const useLoginMutation = <T extends FieldValues>(setError: UseFormSetError<T>) => {
    const navigate = useNavigate();
    const { checkAuth } = useAuthContext();
    
    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            // save to localStorage to acccess_token as well as refresh_token
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            // redirect to home page or dashboard or next
            checkAuth();
            navigate({ to: '/' });
        }, 
        onError: (error: any | ValidationError) => {
            // handle error, e.g., show a toast notification
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError);
            } else {
                toast.error(error.message || "An error occurred during login");
            }
        }
    })
}