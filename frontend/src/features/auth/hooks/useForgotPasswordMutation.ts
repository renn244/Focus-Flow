import { handleNestError, ValidationError } from "@/lib/handleNestError";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useState } from "react";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { toast } from "sonner";

type forgotPasswordSuccessResponse = { message: string; };
type forgotPasswordResponse = AxiosResponse<forgotPasswordSuccessResponse, ExceptionResponse>; 

const forgotPassword = async (email: string): Promise<forgotPasswordResponse['data']> => {
    const response = await axiosInstance.post('/forget-password-token/send-reset-link', { email });

    if(response.status === 400) {
        throw new ValidationError(response.data);
    }

    if (response.status >= 400) {
        throw new Error(response.data.message || 'An error occurred while processing the forgot password request');
    }

    return response.data;
}

export const useForgotPasswordMutation = <T extends FieldValues>(setError: UseFormSetError<T>) => {
    const [emailSent, setEmailSent] = useState(false);
    
    const mutation = useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            setEmailSent(true);
            toast.success(data.message || "Password reset link sent successfully");
        },
        onError: (error) => {
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError);
            } else {
                toast.error(error.message || "An error occured while processing the forgot password request");
            }
        }
    })

    return { mutation, emailSent }
}