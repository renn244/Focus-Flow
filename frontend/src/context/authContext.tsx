import { createContext, useContext } from "react";
import type { User } from "@/types/User";
import { useAuthProvider } from "@/features/auth/hooks/useAuthProvider";

export type AuthContextType = {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null; // handle later
    checkAuth: () => Promise<void>;
}

const initialContextState: AuthContextType = {
    isAuthenticated: false,
    isLoading: true,
    user: null,
    checkAuth: async () => undefined
}

export const AuthContext = createContext<AuthContextType>(initialContextState);

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    return context;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: user, isLoading, refetch } = useAuthProvider();

    const value = {
        isAuthenticated: !!user,
        isLoading, user,
        checkAuth: async () => {
            await refetch();
        }
    }

    return (
        <AuthContext.Provider value={value}>
            {children} 
        </AuthContext.Provider>
    )
}

export default AuthProvider;
