import { useState } from "react";
import { format, isBefore, isToday, startOfDay } from "date-fns";
import { CalendarClock, ChevronRight, ListChecks, Plus } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { useGetBoards } from "../../hooks/Board/useGetBoards";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import { useSortableColumnViewSocket } from "../../hooks/Column/useSortableColumnViewSocket";
import { useTaskSocket } from "../../hooks/Task/useTaskSocket";
import { useProjectIdStore } from "../../store/useProjectId";
import useSelectBoardStore from "../../store/useSelectBoard";
import useTaskDialogStore from "../../store/useTaskDialog";
import type { ColumnWithTasks, TaskWithBoardAndColumn } from "../../type";
import KanbanBoardHeader from "../Board/KanbanBoardHeader";
import CreateBoardDialog from "../Board/CreateBoardDialog";
import CreateTaskDialog from "../Task/CreateTaskDialog";
import EditTaskDialog from "../Task/EditTaskDialog";
import RemoveTaskDialog from "../Task/RemoveTaskDialog";
import TaskOptions from "../Task/TaskOptions";
import TaskStatusMenu, { DONE_COLUMN_TITLE } from "../Task/TaskStatusMenu";

const priorityStyles = {
  low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  medium: "bg-amber-50 text-amber-800 ring-amber-200",
  high: "bg-red-50 text-red-700 ring-red-200",
};

const SCOPE_KEY = "focusflow:list-scope";

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const readScope = (): "mine" | "everyone" => {
  try {
    return localStorage.getItem(SCOPE_KEY) === "everyone" ? "everyone" : "mine";
  } catch {
    return "mine";
  }
};

/** The column treated as finished: one named Done, or else the last column. */
const findDoneColumn = (columns: ColumnWithTasks[]) =>
  columns.find((column) => DONE_COLUMN_TITLE.test(column.title.trim())) ?? columns[columns.length - 1];

/** The board's tasks as rows, grouped under each column. Shows your tasks by default. */
const ProjectList = () => {
  const { user } = useAuthContext();
  const projectId = useProjectIdStore((state) => state.projectId);
  const boardId = useSelectBoardStore((state) => state.selectedBoardId);
  const { isLoading: loadingBoards } = useGetBoards(projectId || "");
  const { data: columns, isLoading, isError, refetch, isFetching } = useGetColumnByBoardId(boardId || "");
  const setCreateColumnId = useTaskDialogStore((state) => state.setCreateColumnId);

  useSortableColumnViewSocket(boardId);
  useTaskSocket(boardId);

  const [scope, setScopeState] = useState(readScope);
  const setScope = (next: "mine" | "everyone") => {
    setScopeState(next);
    try {
      localStorage.setItem(SCOPE_KEY, next);
    } catch {
      /* the choice just won't be remembered */
    }
  };

  const doneColumn = columns?.length ? findDoneColumn(columns) : undefined;
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  // Done starts collapsed so the list shows what's left to do.
  const isCollapsed = (columnId: string) => collapsed[columnId] ?? columnId === doneColumn?._id;

  const isMine = (task: TaskWithBoardAndColumn) =>
    !!user?._id && (task.assigneeUser?._id ?? task.assignee) === user._id;
  const visible = (column: ColumnWithTasks) =>
    scope === "mine" ? column.tasks.filter(isMine) : column.tasks;

  const total = columns?.reduce((sum, column) => sum + visible(column).length, 0) ?? 0;

  return (
    <div className="app-content">
      <KanbanBoardHeader />

      {boardId && !loadingBoards && (
        <div className="mb-3 flex items-center gap-3">
          <div role="radiogroup" aria-label="Whose tasks" className="flex rounded-lg border bg-card p-0.5 text-sm">
            {(["mine", "everyone"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={scope === value}
                onClick={() => setScope(value)}
                className={cn(
                  "rounded-md px-3 py-1 font-medium transition-colors focus-visible:outline-2",
                  scope === value ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {value === "mine" ? "Mine" : "Everyone"}
              </button>
            ))}
          </div>
          {columns && (
            <span className="text-sm text-muted-foreground tabular-nums">
              {total} {total === 1 ? "task" : "tasks"}
            </span>
          )}
        </div>
      )}

      {isLoading || loadingBoards ? (
        <div role="status" aria-busy="true" className="overflow-hidden rounded-xl border bg-card">
          <span className="sr-only">Loading tasks</span>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} aria-hidden="true" className="flex items-center gap-3 border-b px-4 py-3 last:border-0">
              <Skeleton className="size-4" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div role="alert" className="flex items-center gap-3 py-8">
          <p className="text-sm text-destructive">Tasks could not be loaded.</p>
          <Button variant="outline" size="sm" disabled={isFetching} onClick={() => refetch()}>Retry</Button>
        </div>
      ) : columns && columns.length > 0 ? (
        <div className="overflow-hidden rounded-xl border bg-card">
          {columns.map((column) => {
            const tasks = visible(column);
            const open = !isCollapsed(column._id);
            const isDoneColumn = column._id === doneColumn?._id;
            return (
              <section key={column._id} aria-label={column.title} className="border-b last:border-0">
                <h2>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setCollapsed((state) => ({ ...state, [column._id]: open }))}
                    className="flex w-full items-center gap-2 bg-muted/60 px-3 py-2 text-left text-sm font-semibold text-foreground hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2"
                  >
                    <ChevronRight className={cn("size-4 text-muted-foreground transition-transform", open && "rotate-90")} />
                    <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color }} aria-hidden="true" />
                    <span className="truncate">{column.title}</span>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">{tasks.length}</span>
                  </button>
                </h2>

                {open && (
                  <>
                    {tasks.length > 0 && (
                      <ul>
                        {tasks.map((task) => (
                          <TaskRow
                            key={task._id}
                            task={task}
                            done={isDoneColumn}
                            mine={isMine(task)}
                          />
                        ))}
                      </ul>
                    )}
                    {tasks.length === 0 && (
                      <p className="border-t px-10 py-2.5 text-sm text-muted-foreground">
                        {scope === "mine" && column.tasks.length > 0 ? `Nothing of yours here (${column.tasks.length} for others)` : "No tasks"}
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => setCreateColumnId(column._id)}
                      className="flex w-full items-center gap-2 border-t px-10 py-2 text-left text-sm text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2"
                    >
                      <Plus className="size-4" />
                      Add task
                    </button>
                  </>
                )}
              </section>
            );
          })}
        </div>
      ) : boardId ? (
        <p className="rounded-xl border border-dashed bg-card px-6 py-8 text-sm text-muted-foreground">
          This board has no columns yet. Add one from the Board tab.
        </p>
      ) : null}

      <CreateBoardDialog />
      <CreateTaskDialog />
      <EditTaskDialog />
      <RemoveTaskDialog />
    </div>
  );
};

type RowProps = {
  task: TaskWithBoardAndColumn;
  done: boolean;
  mine: boolean;
};

const TaskRow = ({ task, done, mine }: RowProps) => {
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
  const overdue = !done && !!task.dueDate && isBefore(startOfDay(new Date(task.dueDate)), startOfDay(new Date()));
  const dueToday = !done && !!task.dueDate && isToday(new Date(task.dueDate));
  const assigneeName = task.assigneeUser?.displayName || task.assigneeUser?.username;
  const checklistTotal = task.checklist?.length ?? 0;
  const checklistDone = task.checklist?.filter((item) => item.done).length ?? 0;

  return (
    <li className="group flex items-center gap-2.5 border-t py-2 pl-2 pr-2 hover:bg-accent/40 sm:pl-9">
      <TaskStatusMenu task={task} variant="dot" />
      <button
        type="button"
        onClick={() => setViewTaskId(task._id)}
        className={cn(
          "min-w-0 flex-1 truncate text-left text-sm font-medium hover:text-primary focus-visible:outline-2",
          done ? "text-muted-foreground line-through" : "text-foreground"
        )}
      >
        {task.title}
      </button>

      <div className="flex shrink-0 items-center gap-3">
        {checklistTotal > 0 && (
          <span
            title={`Checklist: ${checklistDone} of ${checklistTotal} done`}
            className={cn(
              "hidden items-center gap-1 text-xs font-medium tabular-nums sm:flex",
              checklistDone === checklistTotal ? "text-emerald-700" : "text-muted-foreground"
            )}
          >
            <ListChecks className="size-3.5" aria-hidden="true" />
            {checklistDone}/{checklistTotal}
          </span>
        )}
        <span className={cn("hidden rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset sm:inline", priorityStyles[task.priority])}>
          {task.priority}
        </span>
        {task.dueDate && (
          <time
            dateTime={task.dueDate}
            className={cn(
              "flex min-w-14 items-center gap-1 whitespace-nowrap text-xs tabular-nums",
              overdue ? "font-medium text-red-600" : dueToday ? "font-semibold text-blue-700" : "text-muted-foreground"
            )}
          >
            <CalendarClock className="size-3.5" aria-hidden="true" />
            {dueToday ? "Today" : format(new Date(task.dueDate), "MMM d")}
            {overdue && <span className="sr-only">(overdue)</span>}
          </time>
        )}
        <span className="flex w-6 justify-center">
          {mine ? (
            <span title="Assigned to you" className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-[10px] font-semibold text-blue-700">You</span>
          ) : assigneeName ? (
            <Avatar className="size-6" title={assigneeName}>
              <AvatarImage src={task.assigneeUser?.avatarUrl} alt={assigneeName} />
              <AvatarFallback className="bg-slate-200 text-[10px] font-semibold text-slate-700">{initials(assigneeName)}</AvatarFallback>
            </Avatar>
          ) : null}
        </span>
        <TaskOptions taskId={task._id} />
      </div>
    </li>
  );
};

export default ProjectList;
