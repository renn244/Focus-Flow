import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import { handleNestError, ValidationError } from "@/lib/handleNestError";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useNavigate } from "@tanstack/react-router";
import { authErrorMessage } from "../authErrorMessage";

type signUpSuccessResponse = { message: string, email: string, displayName: string }
type signUpResponse = AxiosResponse<signUpSuccessResponse, ExceptionResponse>;

const signUp = async (data: unknown): Promise<signUpResponse['data']> => {
    const response = await axiosInstance.post('/auth/local/signup', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 401) {
        throw new Error(response.data.message);
    }

    return response.data;
}

export const useSignUpMutation = <T extends FieldValues>(setError: UseFormSetError<T>) => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: signUp,
        onSuccess: async (data) => {
            navigate({ to: '/verify-email', search: { email: data.email } });
        },
        onError: (error: unknown) => {
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError)
            } else {
                setError('root.server', { message: authErrorMessage(error, "Your account couldn't be created. Try again in a moment.") });
            }
        }
    })
}