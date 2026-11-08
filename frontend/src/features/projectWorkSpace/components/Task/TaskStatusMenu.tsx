import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetColumnByBoardId } from "../../hooks/Column/useGetColumnByBoardId";
import { useTaskMovedMutation } from "../../hooks/Task/useTaskMovedMutation";
import type { TaskWithBoardAndColumn } from "../../type";

export const DONE_COLUMN_TITLE = /^(done|complete|completed)$/i;

type Props = {
  task: TaskWithBoardAndColumn;
  /** "dot": a round status button at the start of a list row. "pill": the column name with a caret. */
  variant?: "dot" | "pill";
};

/** Moves a task to any column on its board. */
const TaskStatusMenu = ({ task, variant = "pill" }: Props) => {
  const { data: columns } = useGetColumnByBoardId(task.board._id);
  const { mutate: moveTask, isPending } = useTaskMovedMutation();
  const current = columns?.find((column) => column._id === task.column._id) ?? task.column;
  const isDone = DONE_COLUMN_TITLE.test(current.title.trim());

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "dot" ? (
          <button
            type="button"
            disabled={isPending}
            aria-label={`Status: ${current.title}. Change status`}
            title="Change status"
            className="flex size-6 shrink-0 items-center justify-center rounded-full hover:bg-accent focus-visible:outline-2 disabled:opacity-60"
          >
            {isDone ? (
              <span className="flex size-4 items-center justify-center rounded-full" style={{ backgroundColor: current.color }}>
                <Check className="size-3 text-white" strokeWidth={3} />
              </span>
            ) : (
              <span className="size-4 rounded-full border-2" style={{ borderColor: current.color }} />
            )}
          </button>
        ) : (
          <button
            type="button"
            disabled={isPending}
            aria-label={`Status: ${current.title}. Change status`}
            className="inline-flex h-7 items-center gap-1.5 rounded-md border bg-background px-2 text-sm font-medium text-foreground hover:bg-accent focus-visible:outline-2 disabled:opacity-60"
          >
            <span className="size-2.5 rounded-full" style={{ backgroundColor: current.color }} aria-hidden="true" />
            {current.title}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground">Move to</DropdownMenuLabel>
        {(columns ?? []).map((column) => (
          <DropdownMenuItem
            key={column._id}
            onSelect={() => {
              if (column._id === task.column._id) return;
              moveTask({ taskId: task._id, taskCurrentColumnId: task.column._id, taskFutureColumnId: column._id });
            }}
          >
            <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: column.color }} aria-hidden="true" />
            <span className="flex-1 truncate">{column.title}</span>
            {column._id === task.column._id && <Check className="size-4 text-muted-foreground" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskStatusMenu;
