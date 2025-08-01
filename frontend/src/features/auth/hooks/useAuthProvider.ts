import axiosInstance from "@/lib/httpService";
import type { User } from "@/types/User";
import { useSuspenseQuery } from "@tanstack/react-query";

export const fetchUser = async (): Promise<User | null> => {
    if (!localStorage.getItem('access_token')) return null;
    const response = await axiosInstance.get('/auth/check').catch(() => null);

    if (!response) return null;

    return response.data;
}

export const useAuthProvider = () => {
    return useSuspenseQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        refetchOnWindowFocus: false,
    })
}