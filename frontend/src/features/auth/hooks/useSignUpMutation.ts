import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import { handleNestError, ValidationError } from "@/lib/handleNestError";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { toast } from "sonner";

type signUpSuccessResponse = { success: boolean; message: string; }
type signUpResponse = AxiosResponse<signUpSuccessResponse, ExceptionResponse>;

const signUp = async (data: any): Promise<signUpResponse['data']> => {
    const response = await axiosInstance.post('/auth/signup', data);

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if(response.status >= 401) {
        throw new Error(response.data.message);
    }

    return response.data;
}

export const useSignUpMutation = <T extends FieldValues>(setError: UseFormSetError<T>) => {
    return useMutation({
        mutationFn: signUp,
        onSuccess: async (data) => {
            // handle successful sign up, e.g., redirect to login page or show a success message
        },
        onError: (error: any | ValidationError) => {
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError)
            } else {
                toast.error(error.message || "An error occurred during sign up");
            }
        }
    })
}