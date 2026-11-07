import axiosInstance from "@/lib/httpService";
import type { ExceptionResponse } from "@/types/ExceptionResponse";
import { useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";
import { toast } from "sonner";
import type { ChecklistItem, ColumnWithTasks, TaskWithBoardAndColumn } from "../../type";

/** The app's axios instance resolves error statuses, so failures are checked here. */
const unwrap = (response: AxiosResponse<ChecklistItem[]>, fallback: string) => {
  if (response.status >= 400) {
    throw new Error((response.data as unknown as ExceptionResponse)?.message || fallback);
  }
  return response.data;
};

type TaskRef = Pick<TaskWithBoardAndColumn, "_id" | "board">;

/** Writes a checklist into the open task and into its card on the board. */
const writeChecklist = (queryClient: QueryClient, task: TaskRef, update: (list: ChecklistItem[]) => ChecklistItem[]) => {
  queryClient.setQueryData<TaskWithBoardAndColumn>(["task", task._id], (current) =>
    current ? { ...current, checklist: update(current.checklist ?? []) } : current
  );
  queryClient.setQueryData<ColumnWithTasks[]>(["columns", "byboard", task.board._id], (columns) =>
    columns?.map((column) => ({
      ...column,
      tasks: column.tasks.map((item) => (item._id === task._id ? { ...item, checklist: update(item.checklist ?? []) } : item)),
    }))
  );
};

/** Add, tick, rename, and remove a task's checklist items. Ticking and removing show up instantly. */
export const useChecklist = (task: TaskRef) => {
  const queryClient = useQueryClient();
  const base = `/task/${task._id}/checklist`;

  const settle = (list: ChecklistItem[]) => {
    writeChecklist(queryClient, task, () => list);
    queryClient.invalidateQueries({ queryKey: ["task-activity", task._id] });
    queryClient.invalidateQueries({ queryKey: ["project-activity", task.board.projectId] });
  };

  // On failure, put back what the server has.
  const fail = (error: Error) => {
    toast.error(error.message);
    queryClient.invalidateQueries({ queryKey: ["task", task._id] });
    queryClient.invalidateQueries({ queryKey: ["columns", "byboard", task.board._id] });
  };

  const add = useMutation({
    mutationFn: async (texts: string[]) => unwrap(await axiosInstance.post<ChecklistItem[]>(base, { texts }), "Unable to add the item"),
    onSuccess: settle,
    onError: fail,
  });

  const update = useMutation({
    mutationFn: async ({ itemId, ...body }: { itemId: string; text?: string; done?: boolean }) =>
      unwrap(await axiosInstance.patch<ChecklistItem[]>(`${base}/${itemId}`, body), "Unable to update the item"),
    onMutate: ({ itemId, ...body }) =>
      writeChecklist(queryClient, task, (list) => list.map((item) => (item._id === itemId ? { ...item, ...body } : item))),
    onSuccess: settle,
    onError: fail,
  });

  const remove = useMutation({
    mutationFn: async (itemId: string) =>
      unwrap(await axiosInstance.delete<ChecklistItem[]>(`${base}/${itemId}`), "Unable to remove the item"),
    onMutate: (itemId) => writeChecklist(queryClient, task, (list) => list.filter((item) => item._id !== itemId)),
    onSuccess: settle,
    onError: fail,
  });

  return { add, update, remove };
};
