import { useMemo, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { format, isToday, isYesterday } from "date-fns";
import { ArrowRight, FileText, FolderKanban, History, ListChecks, MessageSquareText, MoveRight, NotebookText, Pencil, Plus, RotateCw, Trash2, UsersRound, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ListLoading from "@/components/common/ListLoading";
import { cn } from "@/lib/utils";
import { useProjectIdStore } from "../../store/useProjectId";
import useTaskDialogStore from "../../store/useTaskDialog";
import { useProjectActivity } from "../../hooks/Audit/useProjectActivity";
import { useGetTasksByProject } from "../../hooks/Task/useGetTasksByProject";
import type { ProjectActivityItem } from "../../types/audit";

type Filter = "all" | "task" | "comment" | "note" | "team";

const filters: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "task", label: "Tasks" },
  { id: "comment", label: "Comments" },
  { id: "note", label: "Notes" },
  { id: "team", label: "Team" },
];

const matchesFilter = (item: ProjectActivityItem, filter: Filter) => {
  if (filter === "all") return true;
  if (filter === "task") return item.entityType === "task" || item.entityType === "attachment";
  if (filter === "comment") return item.entityType === "comment";
  if (filter === "note") return item.entityType === "note";
  return item.entityType === "team_member";
};

/** Verb phrase per action; the task name (when there is one) follows it. */
const verbs: Record<string, string> = {
  "task.created": "created",
  "task.updated": "updated",
  "task.moved": "moved",
  "task.deleted": "deleted a task",
  "comment.created": "commented on",
  "comment.updated": "edited a comment on",
  "comment.deleted": "deleted a comment on",
  "attachment.uploaded": "attached a file to",
  "attachment.deleted": "removed a file from",
  "project.created": "created the project",
  "project.updated": "updated the project",
  "team.member_added": "added a member to the project",
  "team.member_removed": "removed a member from the project",
  "team.member_role_updated": "changed a member's role",
};

const actionIcon = (action: string, entityType: ProjectActivityItem["entityType"]) => {
  if (action.startsWith("checklist.")) return ListChecks;
  if (action.endsWith(".created") && entityType === "task") return Plus;
  if (action === "task.moved") return MoveRight;
  if (action.endsWith(".deleted")) return Trash2;
  if (entityType === "note") return NotebookText;
  if (entityType === "comment") return MessageSquareText;
  if (entityType === "attachment") return FileText;
  if (entityType === "team_member") return UsersRound;
  if (entityType === "project") return FolderKanban;
  return Pencil;
};

const initials = (name: string) => name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const isoDate = /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/;
const formatValue = (value?: string) => {
  if (!value) return "None";
  if (isoDate.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return format(date, "MMM d");
  }
  return value;
};

const dayLabel = (date: Date) => (isToday(date) ? "Today" : isYesterday(date) ? "Yesterday" : format(date, "EEEE, MMM d"));

/** Pulls the quoted text out of summaries like: Commented: “Looks good…” */
const commentQuote = (item: ProjectActivityItem) => {
  if (item.action !== "comment.created" && item.action !== "comment.updated") return null;
  const match = item.summary.match(/[“"](.+)[”"]\s*$/s);
  return match?.[1] ?? null;
};

type Entry = { item: ProjectActivityItem; batch: ProjectActivityItem[] };

const isNoOp = (item: ProjectActivityItem) =>
  item.action === "task.moved" && item.changes.length > 0 && item.changes.every((change) => (change.from ?? "") === (change.to ?? ""));

const batchable: Record<string, (count: number) => string> = {
  "task.created": (count) => `created ${count} tasks`,
  "team.member_added": (count) => `added ${count} members to the project`,
  "checklist.item_checked": (count) => `checked off ${count} items in`,
  "checklist.item_unchecked": (count) => `unchecked ${count} items in`,
  "checklist.item_removed": (count) => `removed ${count} checklist items in`,
};

const isChecklist = (action: string) => action.startsWith("checklist.");

/** Back-to-back creations, member additions or checklist ticks (on one task) by one person within ten minutes read as one entry. */
const canBatch = (entry: Entry, item: ProjectActivityItem) =>
  item.action in batchable &&
  entry.item.action === item.action &&
  (!isChecklist(item.action) || entry.item.taskId === item.taskId) &&
  entry.item.actor._id === item.actor._id &&
  Math.abs(new Date(entry.batch[entry.batch.length - 1].createdAt).getTime() - new Date(item.createdAt).getTime()) < 10 * 60 * 1000;

const fieldLabels: Record<string, string> = { starred: "starred status", dueDate: "due date", assignee: "assignee", contentText: "content" };

const ProjectActivityDialog = () => {
  const projectId = useProjectIdStore((state) => state.projectId);
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const activity = useProjectActivity(open ? projectId : null);
  const { data: tasks = [] } = useGetTasksByProject(open ? projectId : null);

  const taskTitles = useMemo(() => new Map(tasks.map((task) => [task._id, task.title])), [tasks]);
  const items = useMemo(
    () => (activity.data?.pages.flatMap((page) => page.items) ?? []).filter((item) => matchesFilter(item, filter)),
    [activity.data, filter]
  );
  const groups = useMemo(() => {
    const byDay = new Map<string, { label: string; entries: Entry[] }>();
    for (const item of items) {
      if (isNoOp(item)) continue;
      const date = new Date(item.createdAt);
      const key = format(date, "yyyy-MM-dd");
      if (!byDay.has(key)) byDay.set(key, { label: dayLabel(date), entries: [] });
      const entries = byDay.get(key)!.entries;
      const previous = entries[entries.length - 1];
      if (previous && canBatch(previous, item)) previous.batch.push(item);
      else entries.push({ item, batch: [item] });
    }
    return [...byDay.values()];
  }, [items]);

  const openTask = (taskId: string) => {
    setOpen(false);
    setViewTaskId(taskId);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
          <History className="size-4" />
          <span className="sr-only sm:not-sr-only">Activity</span>
        </Button>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-shell/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l bg-card shadow-[-12px_0_40px_rgb(15_23_42/0.18)] duration-200 data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right">
          <div className="flex items-start justify-between gap-4 border-b px-5 pb-4 pt-5">
            <div>
              <DialogPrimitive.Title className="text-base font-semibold text-foreground">Project activity</DialogPrimitive.Title>
              <DialogPrimitive.Description className="mt-0.5 text-sm text-muted-foreground">What changed in this project, newest first.</DialogPrimitive.Description>
            </div>
            <DialogPrimitive.Close className="-mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2" aria-label="Close activity">
              <X className="size-4" />
            </DialogPrimitive.Close>
          </div>

          <div role="group" aria-label="Filter activity" className="flex gap-1 border-b px-5 py-2.5">
            {filters.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
                className={cn(
                  "h-7 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2",
                  filter === item.id ? "bg-shell text-shell-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-6">
            {activity.isLoading ? (
              <ListLoading className="mt-4" label="Loading project activity" rows={5} avatar />
            ) : activity.isError ? (
              <div role="alert" className="mt-6 flex flex-wrap items-center gap-3 text-sm">
                <p className="text-destructive">Activity couldn't load.</p>
                <Button variant="outline" size="sm" onClick={() => activity.refetch()} disabled={activity.isFetching}>
                  <RotateCw className={cn(activity.isFetching && "animate-spin")} /> Try again
                </Button>
              </div>
            ) : groups.length === 0 ? (
              <div className="mt-10 text-center">
                <History className="mx-auto size-5 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium text-foreground">{filter === "all" ? "No activity yet" : "Nothing here yet"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filter === "all" ? "Creating, moving and commenting on tasks shows up here." : "Try another filter to see more of the project's history."}
                </p>
              </div>
            ) : (
              groups.map((group) => (
                <section key={group.label} aria-label={group.label} className="pt-5">
                  <h3 className="mb-2 text-xs font-semibold text-muted-foreground">{group.label}</h3>
                  <ol>
                    {group.entries.map((entry, index) => (
                      <ActivityRow
                        key={entry.item._id}
                        item={entry.item}
                        batch={entry.batch}
                        taskTitles={taskTitles}
                        onOpenTask={openTask}
                        last={index === group.entries.length - 1}
                      />
                    ))}
                  </ol>
                </section>
              ))
            )}

            {activity.hasNextPage && (
              <div className="pt-5 text-center">
                <Button variant="outline" size="sm" onClick={() => activity.fetchNextPage()} disabled={activity.isFetchingNextPage}>
                  {activity.isFetchingNextPage ? "Loading…" : "Load older activity"}
                </Button>
              </div>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

type ActivityRowProps = {
  item: ProjectActivityItem;
  batch: ProjectActivityItem[];
  taskTitles: Map<string, string>;
  onOpenTask: (taskId: string) => void;
  last: boolean;
};

const ActivityRow = ({ item, batch, taskTitles, onOpenTask, last }: ActivityRowProps) => {
  const taskTitle = item.taskId ? taskTitles.get(item.taskId) : undefined;
  const batched = batch.length > 1;
  const Icon = actionIcon(item.action, item.entityType);
  const actorName = item.actor.displayName || item.actor.username;
  const verb = verbs[item.action];
  const quote = commentQuote(item);
  const changes = item.changes.filter((change) => (change.from ?? "") !== (change.to ?? ""));
  // Task, comment and file entries name the task they belong to (a deleted task has no name left).
  const refersToTask = item.entityType !== "project" && item.entityType !== "team_member" && item.action !== "task.deleted";
  const taskLink = item.taskId && taskTitle ? (
    <>
      {" "}
      <button type="button" onClick={() => onOpenTask(item.taskId!)} className="rounded-sm font-medium text-foreground underline-offset-2 hover:underline focus-visible:outline-2">
        {taskTitle}
      </button>
    </>
  ) : " a task";

  return (
    <li className="relative flex gap-3 pb-4">
      {!last && <span aria-hidden="true" className="absolute bottom-0 left-[15px] top-9 w-px bg-border" />}
      <div className="relative shrink-0">
        <Avatar className="size-8">
          <AvatarImage src={item.actor.avatarUrl} alt="" />
          <AvatarFallback className="bg-slate-200 text-[11px] font-semibold text-slate-700">{initials(actorName)}</AvatarFallback>
        </Avatar>
        <span className="absolute -bottom-1 -right-1 flex size-4 items-center justify-center rounded-full bg-card text-muted-foreground ring-1 ring-border">
          <Icon className="size-2.5" />
        </span>
      </div>

      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex items-start gap-3">
          <p className="min-w-0 flex-1 text-sm leading-5 text-muted-foreground">
            <span className="font-medium text-foreground">{actorName}</span>{" "}
            {batched ? (
              <>{batchable[item.action](batch.length)}{isChecklist(item.action) && taskLink}</>
            ) : isChecklist(item.action) ? (
              // e.g. checked off “Write test” in Socket reconnect fix
              <>{item.summary.charAt(0).toLowerCase() + item.summary.slice(1)} in{taskLink}</>
            ) : verb ? (
              <>
                {verb}
                {refersToTask && taskLink}
              </>
            ) : (
              item.summary.charAt(0).toLowerCase() + item.summary.slice(1)
            )}
          </p>
          <time dateTime={item.createdAt} className="shrink-0 pt-0.5 text-xs text-muted-foreground tabular-nums">
            {format(new Date(item.createdAt), "HH:mm")}
          </time>
        </div>

        {batched && (
          <ul className="mt-1.5 flex flex-wrap gap-1.5">
            {batch.map((created) => {
              const title = created.taskId ? taskTitles.get(created.taskId) : undefined;
              return title ? (
                <li key={created._id}>
                  <button type="button" onClick={() => onOpenTask(created.taskId!)} className="max-w-56 truncate rounded bg-muted px-1.5 py-0.5 text-xs text-foreground hover:bg-accent focus-visible:outline-2">
                    {title}
                  </button>
                </li>
              ) : null;
            })}
          </ul>
        )}

        {quote && (
          <blockquote className="mt-2 rounded-md bg-muted px-3 py-2 text-sm leading-5 text-foreground">
            <span className="line-clamp-3">{quote}</span>
          </blockquote>
        )}

        {changes.length > 0 && (
          <ul className="mt-2 flex flex-col gap-1">
            {changes.map((change) => (
              <li key={change.field} className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-muted-foreground">{change.field}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground line-through decoration-slate-400">{formatValue(change.from)}</span>
                <ArrowRight aria-label="to" className="size-3 text-muted-foreground" />
                <span className="rounded bg-blue-50 px-1.5 py-0.5 font-medium text-blue-800">{formatValue(change.to)}</span>
              </li>
            ))}
          </ul>
        )}

        {changes.length === 0 && item.changes.length === 0 && item.changedFields.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">Changed the {[...new Set(item.changedFields.map((field) => fieldLabels[field] ?? field.toLowerCase()))].join(", ")}</p>
        )}
      </div>
    </li>
  );
};

export default ProjectActivityDialog;
