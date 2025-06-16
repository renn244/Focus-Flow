import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";

type forgotPasswordSuccessResponse = { message: string; };
type forgotPasswordResponse = AxiosResponse<forgotPasswordSuccessResponse, ExceptionResponse>; 

const forgotPassword = async (email: string): Promise<forgotPasswordResponse['data']> => {
    const response = await axiosInstance.post('/auth/forgot-password', { email });
    return response.data;
}

export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: forgotPassword,
        onSuccess: (data) => {
            // Handle success, e.g., show a success message or redirect
        },
        onError: (error) => {
            // Handle error, e.g., show an error message
            console.error("Forgot password failed:", error);
        }
    })
}