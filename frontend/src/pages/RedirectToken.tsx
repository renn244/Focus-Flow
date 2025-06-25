import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuthContext } from "@/context/authContext";
 
type RedirectTokenProps = {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
}

const RedirectToken = ({
    accessToken, refreshToken, error
}: RedirectTokenProps) => {
    const { checkAuth } = useAuthContext();
    const navigate = useNavigate();

    useEffect(() => {
        if(error) {
            return;
        }

        if(accessToken) {
            // Save tokens to localStorage
            localStorage.setItem('access_token', accessToken);
            // localStorage.setItem('refresh_token', refreshToken);

            checkAuth();
            navigate({ to: '/' });
        } else {
            // Handle case where tokens are not available
        }
    }, [accessToken, refreshToken, error])
 
    return (
        <div className="w-full h-screen">
            {/* Design here signing in just like in mongoDB */}
            {/* Handle error and loading as well as if successful */}
        </div>
    )
}

export default RedirectToken