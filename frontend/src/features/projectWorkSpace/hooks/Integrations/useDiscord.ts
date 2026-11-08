import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { DiscordChannel, DiscordEvents, DiscordIntegration, DiscordStatus } from "../../types/discord";

const statusKey = (projectId: string) => ["discord", projectId] as const;
const channelsKey = (projectId: string) => ["discord", projectId, "channels"] as const;
const base = (projectId: string) => `/integrations/discord/project/${projectId}`;

/** The app's axios instance resolves error statuses, so failures are checked here. */
const unwrap = <T,>(response: AxiosResponse<T>, fallback: string): T => {
  if (response.status >= 400) {
    throw new Error((response.data as unknown as ExceptionResponse)?.message || fallback);
  }
  return response.data;
};

export const useDiscordStatus = (projectId: string) =>
  useQuery({
    queryKey: statusKey(projectId),
    queryFn: async () => unwrap(await axiosInstance.get<DiscordStatus>(base(projectId)), "Unable to load the Discord connection"),
  });

export const useDiscordChannels = (projectId: string, enabled: boolean) =>
  useQuery({
    queryKey: channelsKey(projectId),
    queryFn: async () => unwrap(await axiosInstance.get<DiscordChannel[]>(`${base(projectId)}/channels`), "Unable to load the channels"),
    enabled,
    retry: false,
  });

/** Sends the browser to Discord's "add the bot to a server" page. */
export const useStartDiscordInstall = (projectId: string) =>
  useMutation({
    mutationFn: async () => unwrap(await axiosInstance.post<{ url: string }>(`${base(projectId)}/install`), "Unable to start connecting Discord"),
    onSuccess: ({ url }) => window.location.assign(url),
  });

export const useUpdateDiscord = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: { channelId?: string; events?: Partial<DiscordEvents> }) =>
      unwrap(await axiosInstance.patch<DiscordIntegration>(base(projectId), body), "Unable to save the Discord settings"),
    // Switches flip right away; the server's answer replaces them.
    onMutate: ({ events }) => {
      if (!events) return;
      queryClient.setQueryData<DiscordStatus>(statusKey(projectId), (status) =>
        status?.integration ? { ...status, integration: { ...status.integration, events: { ...status.integration.events, ...events } } } : status
      );
    },
    onSuccess: (integration) =>
      queryClient.setQueryData<DiscordStatus>(statusKey(projectId), (status) => (status ? { ...status, integration } : status)),
    onError: () => queryClient.invalidateQueries({ queryKey: statusKey(projectId) }),
  });
};

const usePost = (projectId: string, path: string, fallback: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await axiosInstance.post<{ message: string }>(`${base(projectId)}/${path}`), fallback),
    // A failed post may have recorded a problem (missing permission…); show it.
    onSettled: () => queryClient.invalidateQueries({ queryKey: statusKey(projectId) }),
  });
};

export const useSendDiscordTest = (projectId: string) => usePost(projectId, "test", "Unable to send the test message");
export const useSendDiscordSummary = (projectId: string) => usePost(projectId, "summary", "Unable to post the summary");

export const useDisconnectDiscord = (projectId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => unwrap(await axiosInstance.delete<{ message: string }>(base(projectId)), "Unable to disconnect Discord"),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: channelsKey(projectId) });
      queryClient.invalidateQueries({ queryKey: statusKey(projectId) });
      queryClient.invalidateQueries({ queryKey: ["project-activity", projectId] });
    },
  });
};
