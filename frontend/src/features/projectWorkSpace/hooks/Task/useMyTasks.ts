import type { AxiosResponse } from "axios";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import type { TaskWithBoardAndColumn } from "../../type";

type MyTasksResponse = AxiosResponse<TaskWithBoardAndColumn[], ExceptionResponse>;

const getMyTasks = async (): Promise<MyTasksResponse["data"]> => {
  const response = await axiosInstance.get("/task/mine");

  if (response.status >= 400) {
    throw new Error(response.data.message || "Unable to fetch your tasks");
  }

  return response.data;
};

export const useMyTasks = () =>
  useQuery({
    queryKey: ["tasks", "mine"],
    queryFn: getMyTasks,
    refetchOnWindowFocus: false,
  });
