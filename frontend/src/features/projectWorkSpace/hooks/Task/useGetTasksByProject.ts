import { useProjectSocketContext } from "@/context/ProjectSocketContext";
import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { useEffect } from "react";
import type { TaskWithBoardAndColumn } from "../../type";

type TasksByProjectResponse = AxiosResponse<TaskWithBoardAndColumn[], ExceptionResponse>;

const getTasksByProject = async (projectId: string): Promise<TasksByProjectResponse["data"]> => {
  const response = await axiosInstance.get(`/task/byProject/${projectId}`);
  return response.data;
};

export const useGetTasksByProject = (projectId: string | null) => {
  const { socket } = useProjectSocketContext();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket || !projectId) return;

    const refreshCalendarTasks = () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", "by-project", projectId] });
    };

    socket.on("taskCreated", refreshCalendarTasks);
    socket.on("taskUpdated", refreshCalendarTasks);
    socket.on("taskMoved", refreshCalendarTasks);
    socket.on("taskDeleted", refreshCalendarTasks);

    return () => {
      socket.off("taskCreated", refreshCalendarTasks);
      socket.off("taskUpdated", refreshCalendarTasks);
      socket.off("taskMoved", refreshCalendarTasks);
      socket.off("taskDeleted", refreshCalendarTasks);
    };
  }, [projectId, queryClient, socket]);

  return useQuery({
    queryKey: ["tasks", "by-project", projectId],
    queryFn: () => getTasksByProject(projectId!),
    enabled: Boolean(projectId),
    refetchOnWindowFocus: false,
  });
};
