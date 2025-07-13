import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

type getColumnByIdSuccessResponse = any;
type getColumnByIdResponse = AxiosResponse<getColumnByIdSuccessResponse, ExceptionResponse>;

const getColumnById = async (columnId: string): Promise<getColumnByIdResponse['data']> => {
    const response = await axiosInstance.get(`/column/${columnId}`);

    if (response.status === 400) {
        return null;
    }

    if(response.status >= 400) {
        throw new Error(response.data.message || "An error occurred while fetching the column");
    }

    return response.data;
}

export const useGetColumnById = (columnId: string | undefined) => {
    return useQuery({
        queryKey: ['column', columnId],
        enabled: !!columnId,
        queryFn: () => getColumnById(columnId || ""), // just cause of type safety
        refetchOnWindowFocus: false,
        retry: 1, 
    })
}