import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { Note, NoteSummary, NoteVersion, NoteVersionList } from "../../types/note";
import { noteKey, notesKey } from "./useNotes";

export const noteVersionsKey = (noteId: string) => ["note-versions", noteId] as const;

/** The app's axios instance resolves error statuses, so failures are checked here. */
const unwrap = <T,>(response: AxiosResponse<T>, fallback: string): T => {
  if (response.status >= 400) {
    throw new Error((response.data as unknown as ExceptionResponse)?.message || fallback);
  }
  return response.data;
};

export const useNoteVersions = (noteId: string) =>
  useQuery({
    queryKey: noteVersionsKey(noteId),
    queryFn: async () => unwrap(await axiosInstance.get<NoteVersionList>(`/note/${noteId}/versions`), "Unable to load the history"),
  });

export const useNoteVersion = (noteId: string, versionId: string | null) =>
  useQuery({
    queryKey: [...noteVersionsKey(noteId), versionId],
    queryFn: async () =>
      unwrap(await axiosInstance.get<NoteVersion>(`/note/${noteId}/versions/${versionId}`), "Unable to load that version"),
    enabled: Boolean(versionId),
    // A saved version never changes.
    staleTime: Infinity,
  });

/** Puts an earlier version back. The note as it was becomes a version too, so this can be undone. */
export const useRestoreNoteVersion = (projectId: string, noteId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (versionId: string) =>
      unwrap(await axiosInstance.post<Note>(`/note/${noteId}/versions/${versionId}/restore`), "Unable to restore that version"),
    onSuccess: (note) => {
      queryClient.setQueryData(noteKey(noteId), note);
      queryClient.setQueryData<NoteSummary[]>(notesKey(projectId), (list) =>
        list?.map((item) => (item._id === note._id ? { ...item, title: note.title, updatedAt: note.updatedAt, updatedBy: note.updatedBy } : item))
      );
      queryClient.invalidateQueries({ queryKey: noteVersionsKey(noteId) });
      queryClient.invalidateQueries({ queryKey: ["task-notes"] });
      queryClient.invalidateQueries({ queryKey: ["project-activity", projectId] });
    },
  });
};
