import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import type { Note, NoteSummary, NoteUpdatePayload, TaskNoteRef } from "../../types/note";

export const notesKey = (projectId: string) => ["notes", projectId] as const;
export const noteKey = (noteId: string) => ["note", noteId] as const;
const taskNotesKey = (taskId: string) => ["task-notes", taskId] as const;
const projectActivityKey = (projectId: string) => ["project-activity", projectId] as const;

/** The app's axios instance resolves error statuses, so failures are checked here. */
const unwrap = <T,>(response: AxiosResponse<T>, fallback: string): T => {
  if (response.status >= 400) {
    throw new Error((response.data as unknown as ExceptionResponse)?.message || fallback);
  }
  return response.data;
};

export const useNotes = (projectId: string | null) =>
  useQuery({
    queryKey: notesKey(projectId ?? ""),
    queryFn: async () => unwrap(await axiosInstance.get<NoteSummary[]>(`/note/project/${projectId}`), "Unable to load notes"),
    enabled: Boolean(projectId),
  });

export const useNote = (noteId: string | null) =>
  useQuery({
    queryKey: noteKey(noteId ?? ""),
    queryFn: async () => unwrap(await axiosInstance.get<Note>(`/note/${noteId}`), "Unable to load the note"),
    enabled: Boolean(noteId),
    refetchOnWindowFocus: false,
  });

export const useTaskNotes = (taskId: string | null) =>
  useQuery({
    queryKey: taskNotesKey(taskId ?? ""),
    queryFn: async () => unwrap(await axiosInstance.get<TaskNoteRef[]>(`/note/task/${taskId}`), "Unable to load notes"),
    enabled: Boolean(taskId),
  });

const toSummary = (note: Note): NoteSummary => {
  const summary: Partial<Note> = { ...note };
  delete summary.content;
  delete summary.canDelete;
  return summary as NoteSummary;
};

/** Puts a saved note into the list cache, keeping pinned notes first and the newest edits on top. */
const upsertSummary = (list: NoteSummary[] | undefined, note: Note) => {
  const next = [toSummary(note), ...(list ?? []).filter((item) => item._id !== note._id)];
  return next.sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
};

export const useCreateNote = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title: string) =>
      unwrap(await axiosInstance.post<Note>("/note", { projectId, title }), "Unable to create the note"),
    onSuccess: (note) => {
      queryClient.setQueryData(noteKey(note._id), note);
      queryClient.setQueryData<NoteSummary[]>(notesKey(projectId), (list) => upsertSummary(list, note));
      queryClient.invalidateQueries({ queryKey: projectActivityKey(projectId) });
    },
  });
};

export const useUpdateNote = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ noteId, payload }: { noteId: string; payload: NoteUpdatePayload }) =>
      unwrap(await axiosInstance.patch<Note>(`/note/${noteId}`, payload), "Unable to save the note"),
    onSuccess: (note, { payload }) => {
      // Content is kept by the open editor; only refresh the cached copy when it is not being typed into.
      queryClient.setQueryData<Note>(noteKey(note._id), (current) =>
        current && payload.content === undefined && payload.title === undefined ? { ...note, content: current.content } : note
      );
      queryClient.setQueryData<NoteSummary[]>(notesKey(projectId), (list) => upsertSummary(list, note));
      queryClient.invalidateQueries({ queryKey: ["task-notes"] });
      queryClient.invalidateQueries({ queryKey: projectActivityKey(projectId) });
      // A save can start a new version; refresh the history list if it's been loaded.
      queryClient.invalidateQueries({ queryKey: ["note-versions", note._id], exact: true });
    },
  });
};

export const useDeleteNote = (projectId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (noteId: string) => {
      unwrap(await axiosInstance.delete(`/note/${noteId}`), "Unable to delete the note");
      return noteId;
    },
    onSuccess: (noteId) => {
      queryClient.setQueryData<NoteSummary[]>(notesKey(projectId), (list) => list?.filter((item) => item._id !== noteId));
      queryClient.removeQueries({ queryKey: noteKey(noteId) });
      queryClient.invalidateQueries({ queryKey: ["task-notes"] });
      queryClient.invalidateQueries({ queryKey: projectActivityKey(projectId) });
    },
  });
};

/** Uploads an image for a note and resolves with the address to put in the editor. */
export const uploadNoteImage = async (noteId: string, file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axiosInstance.post<{ url: string }>(`/note/${noteId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (response.status === 413) throw new Error("Images can be up to 5 MB");
  return unwrap(response, "Unable to upload the image").url;
};
