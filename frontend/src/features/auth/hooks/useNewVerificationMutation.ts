import axiosInstance from "@/lib/httpService";
import { useMutation } from "@tanstack/react-query";
import { useState, type Dispatch, type SetStateAction } from "react";
import { toast } from "sonner";

type useNewVerificationMutationParams = {
    setStatus: Dispatch<SetStateAction<"verifying" | "success" | "error" | "expired">>;
}

export const useNewVerificationMutation = ({ setStatus }: useNewVerificationMutationParams) => {
    const [newVerificationSuccess, setNewVerificationSuccess] = useState<boolean | undefined>(undefined);

    const mutation = useMutation({
        mutationKey: ["newVerification"],
        mutationFn: async (email: string) => {
            const response = await axiosInstance.post("/verify-email-token/newVerification", { email });

            if(response.status === 400) {
                toast.error(response.data.message, { position: "top-center" });
                setStatus("error");
                throw new Error(response.data.message);
            }

            if(response.status === 404) {
                toast.error(response.data.message, { position: "top-center" });
                setStatus("error");
                throw new Error("No user exist found for this email");
            }

            return response.data;
        },
        onSuccess: () => {
            setNewVerificationSuccess(true);
            toast.success("New verification email sent successfully", { position: "top-center" });
        },
        onError: (error: unknown) => {
            setNewVerificationSuccess(false);
            toast.error((error instanceof Error && error.message) || "Failed to send new verification email", { position: "top-center" });
        }
    })

    return { mutation, newVerificationSuccess, setNewVerificationSuccess }
}