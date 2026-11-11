import { useMutation } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { AxiosResponse } from "axios";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { FieldValues, UseFormSetError } from "react-hook-form";
import { handleNestError, ValidationError } from "@/lib/handleNestError";
import { useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "@/context/authContext";
import { authErrorMessage } from "../authErrorMessage";
import { mfaTicket, type MfaChallenge } from "../mfa";

type loginSuccessResponse = { access_token: string; refresh_token: string; };
type loginResponse = AxiosResponse<loginSuccessResponse | MfaChallenge, ExceptionResponse>;

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
        // The button keeps its "Signing in…" state until the session is loaded,
        // so the landing page never flashes before the dashboard.
        onSuccess: async (data) => {
            // Two-step sign-in: the password was right, now ask for the code.
            if ('mfaRequired' in data) {
                mfaTicket.save(data);
                await navigate({ to: '/multi-factor' });
                return;
            }
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            await checkAuth();
            await navigate({ to: '/projects' });
        },
        onError: (error: any | ValidationError) => {
            if(error instanceof ValidationError) {
                handleNestError<T>(error.response, setError);
            } else {
                setError('root.server', { message: authErrorMessage(error, "Signing in didn't work. Try again in a moment.") });
            }
        }
    })
}