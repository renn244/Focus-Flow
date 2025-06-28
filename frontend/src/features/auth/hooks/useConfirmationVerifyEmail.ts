import axiosInstance from "@/lib/httpService";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

type ConfirmationVerifyEmailParams = {
    token: string;
}

export const useConfirmationVerifyEmail = ({ token }: ConfirmationVerifyEmailParams) => {
    const [status, setStatus] = useState<"verifying" | "success" | "error" | "expired">("verifying");
    const query = useQuery({
        queryKey: ["verify-email"],
        queryFn: async () => {
            const response = await axiosInstance.post("/verify-email-token/verify", { token })

            if(response.status === 404) {
                toast.error("Verification token not found or invalid", { position: "top-center" });
                setStatus("error");
                throw new Error(response.data.message);
            }

            if(response.status === 400) {
                toast.error(response.data.message || "Failed to verify email");
                if(response.data.message === "Verification token has expired") {
                    setStatus("expired");
                } else {
                    setStatus("error");
                }
                throw new Error(response.data.message);
            }

            setStatus("success");
            response.data;
        },
        refetchOnWindowFocus: false,
        retry: false,
    })

    return { query, status, setStatus }; 
}