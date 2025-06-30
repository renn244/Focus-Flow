import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import { toast } from "sonner";
import { useEffect, useState } from "react";

const resendForgotPassword = async (email: string) => {
    const response = await axiosInstance.post('/forget-password-token/resend-reset-link', { email });

    if(response.status >= 400) {
        throw new Error(response.data.message || "An error occurred while resending the reset link.");
    }

    response.data;
}

export const useResendForgotPasswordMutation = () => {
    const [timeLeft, setTimeLeft] = useState<number | undefined>(undefined);
    
    useEffect(() => {
        if(timeLeft === undefined) {
            return;
        }
        
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === undefined || prev <= 0) {
                    clearInterval(timer);
                    return undefined;
                }

                return prev - 1;
            })
        }, 1000)

        return () => {
            clearInterval(timer);
        }
    }, [timeLeft])

    const mutation = useMutation({
        mutationFn: resendForgotPassword,
        onSuccess: () => {
            setTimeLeft(60);
            toast.success("Reset link resent successfully. Please check your email.");
        },
        onError: (error) => {
            toast.error(error.message);
        }
    })

    return { mutation, timeLeft, setTimeLeft };
}