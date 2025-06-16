import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";

type loginSuccessResponse = { access_token: string; refresh_token: string; };
type loginResponse = AxiosResponse<loginSuccessResponse, ExceptionResponse>;

const login = async (credentials: any): Promise<loginResponse['data']> => {
    const response = await axiosInstance.post('/auth/login', credentials);
    return response.data;
}

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            // save to localStorage to acccess_token as well as refresh_token

        }, 
        onError: (error) => {
            // handle error, e.g., show a toast notification
            console.error("Login failed:", error);
        }
    })
}