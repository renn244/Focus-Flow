import { useMemo, useState, type ReactNode } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { ArrowRight, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import useSelectBoardStore from "@/features/projectWorkSpace/store/useSelectBoard";
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type";
import { groupAgenda, hasDueTime, type AgendaRange } from "@/features/projectWorkSpace/utils/agenda";
import { projectDotClass, useNavProjects } from "@/features/projects/hooks/useNavProjects";
import { useOpenTask } from "./useOpenTask";

const ranges: { id: AgendaRange; label: string; empty: string }[] = [
    { id: "overdue", label: "Overdue", empty: "You're caught up on overdue work." },
    { id: "today", label: "Today", empty: "Nothing is due today." },
    { id: "upcoming", label: "7 days", empty: "Nothing is due in the next 7 days." },
];

const dueLabel = (dueDate: string, range: AgendaRange) => {
    const date = new Date(dueDate);
    if (range === "today") return hasDueTime(dueDate) ? format(date, "HH:mm") : "Today";
    if (range === "upcoming" && isTomorrow(date)) return "Tomorrow";
    return format(date, range === "upcoming" ? "EEE d" : "MMM d");
};

const nextLabel = (dueDate: string) => {
    const date = new Date(dueDate);
    if (isToday(date)) return "today";
    if (isTomorrow(date)) return "tomorrow";
    return format(date, "EEE, MMM d");
};

type AgendaPanelProps = {
    onOpenTask?: () => void;
    /** Control rendered at the end of the heading row (collapse or close). */
    action?: ReactNode;
};

const AgendaPanel = ({ onOpenTask, action }: AgendaPanelProps) => {
    const [range, setRange] = useState<AgendaRange>("today");
    const { data: tasks = [], isLoading, isError, refetch, isFetching } = useMyTasks();
    const { data: projects = [] } = useNavProjects();
    const projectId = useProjectIdStore((state) => state.projectId);
    const selectedBoardId = useSelectBoardStore((state) => state.selectedBoardId);
    const openTask = useOpenTask();

    const groups = useMemo(() => groupAgenda(tasks), [tasks]);
    const projectById = useMemo(() => new Map(projects.map((project) => [project._id, project])), [projects]);
    const visible = groups[range];
    const next = range === "today" ? groups.upcoming[0] ?? groups.later : range === "overdue" ? groups.today[0] : groups.later;
    const current = ranges.find((item) => item.id === range)!;

    const handleOpen = (task: TaskWithBoardAndColumn) => {
        openTask(task);
        onOpenTask?.();
    };

    return (
        <div className="flex h-full min-h-0 flex-col text-shell-text">
            <div className="flex items-center gap-3 pl-5 pr-3 pt-4">
                <h2 className="text-base font-semibold text-shell-foreground">My agenda</h2>
                <time className="mr-auto text-xs text-shell-muted" dateTime={format(new Date(), "yyyy-MM-dd")}>{format(new Date(), "EEE, MMM d")}</time>
                {action}
            </div>

            <div role="group" aria-label="Agenda range" className="mx-5 mt-4 grid grid-cols-3 gap-1 rounded-lg bg-white/[0.06] p-1">
                {ranges.map((item) => {
                    const count = groups[item.id].length;
                    const active = item.id === range;
                    return (
                        <button
                            key={item.id}
                            type="button"
                            aria-pressed={active}
                            onClick={() => setRange(item.id)}
                            className={cn(
                                "flex h-8 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1",
                                active ? "bg-blue-600 text-white" : "text-shell-muted hover:bg-white/[0.06] hover:text-shell-foreground"
                            )}
                        >
                            {item.label}
                            {!isLoading && (
                                <span className={cn("tabular-nums", !active && item.id === "overdue" && count > 0 && "text-red-300")}>{count}</span>
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="shell-scroll mt-3 min-h-0 flex-1 overflow-y-auto px-3 pb-5">
                {isLoading ? (
                    <div role="status" aria-busy="true" className="space-y-2 px-2 pt-2">
                        <span className="sr-only">Loading your agenda</span>
                        {Array.from({ length: 4 }, (_, index) => (
                            <div key={index} aria-hidden="true" className="space-y-2 rounded-lg px-2 py-3">
                                <div className="h-3.5 w-3/4 animate-pulse rounded bg-white/10" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-white/[0.07]" />
                            </div>
                        ))}
                    </div>
                ) : isError ? (
                    <div role="alert" className="mx-2 mt-3 rounded-lg border border-shell-border p-4 text-sm">
                        <p className="text-shell-foreground">Your agenda couldn't load.</p>
                        <button type="button" onClick={() => refetch()} disabled={isFetching} className="mt-3 inline-flex items-center gap-1.5 rounded-md text-sm font-medium text-blue-300 hover:text-blue-200 disabled:opacity-60">
                            <RotateCw className={cn("size-3.5", isFetching && "animate-spin")} /> Try again
                        </button>
                    </div>
                ) : visible.length === 0 ? (
                    <div className="mx-2 mt-3 rounded-lg border border-dashed border-shell-border px-4 py-5 text-sm">
                        <p className="text-shell-foreground">{current.empty}</p>
                        {next?.dueDate && (
                            <button type="button" onClick={() => handleOpen(next)} className="group mt-2 flex w-full items-center gap-1.5 text-left text-shell-muted hover:text-shell-foreground">
                                <span className="truncate">Next: {next.title}, {nextLabel(next.dueDate)}</span>
                                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
                            </button>
                        )}
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {visible.map((task) => {
                            const project = projectById.get(task.board.projectId);
                            const onThisBoard = task.board.projectId === projectId && task.board._id === selectedBoardId;
                            return (
                                <li key={task._id}>
                                    <button
                                        type="button"
                                        onClick={() => handleOpen(task)}
                                        className={cn(
                                            "grid w-full grid-cols-[1fr_auto] items-start gap-x-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-shell-hover focus-visible:outline-2 focus-visible:-outline-offset-2",
                                            onThisBoard && "bg-shell-accent/[0.14] hover:bg-shell-accent/20"
                                        )}
                                    >
                                        <span className="min-w-0">
                                            <span className="line-clamp-2 text-sm font-medium text-shell-foreground">{task.title}</span>
                                            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-shell-muted">
                                                <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[3px]", projectDotClass(project?.color))} />
                                                <span className="truncate">{project?.name ?? task.board.name}</span>
                                                {onThisBoard && <span className="shrink-0 font-medium text-blue-300">· On this board</span>}
                                            </span>
                                        </span>
                                        <time
                                            dateTime={task.dueDate}
                                            className={cn("pt-0.5 text-xs font-medium tabular-nums", range === "overdue" ? "text-red-300" : "text-shell-muted")}
                                        >
                                            {dueLabel(task.dueDate!, range)}
                                        </time>
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default AgendaPanel;
