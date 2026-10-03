import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useInfiniteQuery } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { ProjectActivityPage } from "../../types/audit";

type ProjectActivityResponse = AxiosResponse<ProjectActivityPage, ExceptionResponse>;

const getProjectActivity = async (projectId: string, cursor?: string): Promise<ProjectActivityResponse["data"]> => {
  const response = await axiosInstance.get(`/projects/${projectId}/activity`, {
    params: { limit: 20, ...(cursor ? { cursor } : {}) },
  });

  if (response.status >= 400) {
    throw new Error(response.data.message || "Unable to load project activity");
  }

  return response.data;
};

const getTaskActivity = async (taskId: string, cursor?: string): Promise<ProjectActivityResponse["data"]> => {
  const response = await axiosInstance.get(`/task/${taskId}/activity`, {
    params: { limit: 20, ...(cursor ? { cursor } : {}) },
  });

  if (response.status >= 400) {
    throw new Error(response.data.message || "Unable to load task activity");
  }

  return response.data;
};

export const useProjectActivity = (projectId: string | null) =>
  useInfiniteQuery({
    queryKey: ["project-activity", projectId],
    queryFn: ({ pageParam }) => getProjectActivity(projectId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  });

export const useTaskActivity = (taskId: string | null) =>
  useInfiniteQuery({
    queryKey: ["task-activity", taskId],
    queryFn: ({ pageParam }) => getTaskActivity(taskId!, pageParam),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(taskId),
    refetchOnWindowFocus: false,
  });
