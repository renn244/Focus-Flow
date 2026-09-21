import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { CommentPayload, TaskComment } from "../../types/comment";

type CommentsResponse = AxiosResponse<TaskComment[], ExceptionResponse>;
type CommentResponse = AxiosResponse<TaskComment, ExceptionResponse>;

const commentsKey = (taskId: string) => ["comments", taskId] as const;

const getComments = async (taskId: string): Promise<CommentsResponse["data"]> => {
  const response = await axiosInstance.get(`/comment/task/${taskId}`);

  if (response.status >= 400) {
    throw new Error(response.data.message || "Unable to load comments");
  }

  return response.data;
};

export const useComments = (taskId: string) =>
  useQuery({
    queryKey: commentsKey(taskId),
    queryFn: () => getComments(taskId),
    enabled: Boolean(taskId),
    refetchOnWindowFocus: false,
  });

export const useCreateComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CommentPayload) => {
      const response = await axiosInstance.post<TaskComment, CommentResponse>("/comment", { taskId, ...payload });

      if (response.status >= 400) {
        const error = response.data as unknown as ExceptionResponse;
        throw new Error(error.message || "Unable to add comment");
      }

      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(taskId) }),
  });
};

export const useUpdateComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ commentId, payload }: { commentId: string; payload: CommentPayload }) => {
      const response = await axiosInstance.patch<TaskComment, CommentResponse>(`/comment/${commentId}`, payload);

      if (response.status >= 400) {
        const error = response.data as unknown as ExceptionResponse;
        throw new Error(error.message || "Unable to update comment");
      }

      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(taskId) }),
  });
};

export const useDeleteComment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (commentId: string) => {
      const response = await axiosInstance.delete(`/comment/${commentId}`);

      if (response.status >= 400) {
        throw new Error((response.data as ExceptionResponse).message || "Unable to delete comment");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: commentsKey(taskId) }),
  });
};
