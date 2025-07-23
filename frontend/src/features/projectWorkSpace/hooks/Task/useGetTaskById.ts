import type { AxiosResponse } from "axios";
import type { Task } from "../../type";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import axiosInstance from "@/lib/httpService";
import { useQuery } from "@tanstack/react-query";

type getTaskByIdSuccessResponse = Task;
type getTaskByIdResponse = AxiosResponse<getTaskByIdSuccessResponse, ExceptionResponse>;

const getTaskById = async (taskId: string): Promise<getTaskByIdResponse['data']> => {
  const response = await axiosInstance.get(`/task/${taskId}`);

  if (response.status >= 400) {
    throw new Error(response.data.message || 'An error occurred while fetching the task by ID');
  }

  return response.data;
}

export const useGetTaskById = (taskId: string | null) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: () => getTaskById(taskId || ""),
    enabled: !!taskId, // Only run the query if taskId is truthy
    refetchOnWindowFocus: false, // Optional: Prevent refetching on window focus
    staleTime: 5 * 60 * 1000, // Optional: Cache the result for 5 minutes
    gcTime: 10 * 60 * 1000, // Optional: Garbage collect after 10 minutes
  })
}