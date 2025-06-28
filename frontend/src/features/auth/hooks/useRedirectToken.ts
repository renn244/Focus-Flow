import { useAuthContext } from "@/context/authContext";
import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";;

type useRedirectTokenParams = {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

export const useRedirectToken = ({
    accessToken,
    refreshToken,
    error
}: useRedirectTokenParams) => {
    const [errorMessage, setErrorMessage] = useState<string | undefined>(error);
    const { isLoading, checkAuth } = useAuthContext();
    const navigate = useNavigate();
    
    useEffect(() => {
        if(accessToken) {
            // Save tokens to localStorage
            localStorage.setItem('access_token', accessToken);
            // localStorage.setItem('refresh_token', refreshToken);

            checkAuth();
            navigate({ to: '/' });
        } else {
            if(!errorMessage) {
                setErrorMessage("No access token provided");
            }
        }
    }, [accessToken, refreshToken, error])

    return { isLoading, errorMessage, };
}