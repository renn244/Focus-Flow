import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { TaskAttachment } from "../../types/attachment";

type AttachmentsResponse = AxiosResponse<TaskAttachment[], ExceptionResponse>;

const attachmentsKey = (taskId: string) => ["attachments", taskId] as const;

const getAttachments = async (taskId: string): Promise<AttachmentsResponse["data"]> => {
  const response = await axiosInstance.get(`/attachment/task/${taskId}`);

  if (response.status >= 400) {
    throw new Error((response.data as ExceptionResponse).message || "Unable to load attachments");
  }

  return response.data;
};

export const useAttachments = (taskId: string) =>
  useQuery({
    queryKey: attachmentsKey(taskId),
    queryFn: () => getAttachments(taskId),
    enabled: Boolean(taskId),
    refetchOnWindowFocus: false,
  });

export const useUploadAttachment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await axiosInstance.post<TaskAttachment>(`/attachment/task/${taskId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status >= 400) {
        throw new Error((response.data as unknown as ExceptionResponse).message || "Unable to upload attachment");
      }

      return response.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attachmentsKey(taskId) }),
  });
};

export const useDeleteAttachment = (taskId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (attachmentId: string) => {
      const response = await axiosInstance.delete(`/attachment/${attachmentId}`);

      if (response.status >= 400) {
        throw new Error((response.data as ExceptionResponse).message || "Unable to remove attachment");
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: attachmentsKey(taskId) }),
  });
};

export const getAttachmentBlob = async (attachmentId: string) => {
  const response = await axiosInstance.get(`/attachment/${attachmentId}/download`, { responseType: "blob" });

  if (response.status >= 400) {
    throw new Error("Unable to load attachment");
  }

  return response.data as Blob;
};

export const downloadAttachment = async (attachment: TaskAttachment) => {
  const objectUrl = URL.createObjectURL(await getAttachmentBlob(attachment._id));
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = attachment.originalName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};
