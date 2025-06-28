import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import { toast } from "sonner";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";

type resendEmailSuccessResponse = { message: "string" };
type resendEmailResponse = AxiosResponse<resendEmailSuccessResponse, ExceptionResponse>;

const resendEmail = async (email: string): Promise<resendEmailResponse['data']> => {
    const response = await axiosInstance.post('/verify-email-token/resend', { email });

    if(response.status >= 400) {
        throw new Error(response.data.message || "Failed to resend verification email");
    }

    return response.data;
}

export const useResendVerificationEmailMutation = () => {
    return useMutation({
        mutationFn: resendEmail,
        onSuccess: () => {
            toast.success("Verification email resent successfully", { position: "top-center" });
        }
    })
}