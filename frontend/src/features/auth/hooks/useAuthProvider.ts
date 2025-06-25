import axiosInstance from "@/lib/httpService";
import type { User } from "@/types/User";
import { useQuery } from "@tanstack/react-query";

export const fetchUser = async (): Promise<User | undefined> => {
    if (!localStorage.getItem('access_token')) return undefined;
    const response = await axiosInstance.get('/auth/check').catch(() => null);

    if (!response) return undefined;

    return response.data;
}

export const useAuthProvider = () => {
    return useQuery({
        queryKey: ['user'],
        queryFn: fetchUser,
        refetchOnWindowFocus: false,
    })
}