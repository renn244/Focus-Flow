import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useAuthContext } from "@/context/authContext"
import { cn } from "@/lib/utils"
import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import { format, isBefore, isToday, startOfDay } from "date-fns"
import { CalendarClock, GripVertical, ListChecks } from "lucide-react"
import type { TaskWithBoardAndColumn } from "../../type"
import TaskOptions from "./TaskOptions"
import useTaskDialogStore from "../../store/useTaskDialog"

const priorityStyles = {
    low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    medium: "bg-amber-50 text-amber-800 ring-amber-200",
    high: "bg-red-50 text-red-700 ring-red-200",
}

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()

type TaskCardProps = {
    task: TaskWithBoardAndColumn,
    columnId?: TaskWithBoardAndColumn["_id"];
}

const TaskCard = ({
    task, columnId
}: TaskCardProps) => {
    const { user } = useAuthContext();
    const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: task._id,
        data: { id: task._id, columnId: columnId, type: "task" }
    })
    const style = { transform: CSS.Translate.toString(transform) }
    const isMine = !!user?._id && (task.assigneeUser?._id ?? task.assignee) === user._id
    const isDone = /^(done|complete|completed)$/i.test(task.column?.title?.trim() ?? "")
    const overdue = !isDone && !!task.dueDate && isBefore(startOfDay(new Date(task.dueDate)), startOfDay(new Date()))
    const dueToday = !isDone && !!task.dueDate && isToday(new Date(task.dueDate))
    const assigneeName = task.assigneeUser?.displayName || task.assigneeUser?.username
    const checklistTotal = task.checklist?.length ?? 0
    const checklistDone = task.checklist?.filter((item) => item.done).length ?? 0
    const checklistComplete = checklistTotal > 0 && checklistDone === checklistTotal

    return (
        <article
        ref={setNodeRef}
        style={style}
        className={cn(
            "group relative overflow-hidden rounded-lg border bg-card p-3 shadow-[0_1px_2px_rgb(15_23_42/0.06)] transition-[border-color,box-shadow] hover:border-slate-300 hover:shadow-[0_4px_12px_rgb(15_23_42/0.08)]",
            isDragging && "relative z-50 shadow-[0_12px_32px_rgb(15_23_42/0.18)]"
        )}>
            <div className="flex items-start gap-1">
                <h3 className="min-w-0 flex-1 pt-0.5 text-sm font-medium leading-5 text-foreground">
                    <button type="button" className="line-clamp-2 rounded-sm text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2" onClick={() => setViewTaskId(task._id)}>
                        {task.title}
                    </button>
                </h3>
                <Button className="-my-0.5 size-7 text-muted-foreground opacity-60 group-hover:opacity-100" title="Move task" aria-label={`Move ${task.title}`}
                size="icon" variant="ghost" {...listeners} {...attributes}>
                    <GripVertical className="h-4 w-4" />
                </Button>
                <div className="-my-0.5"><TaskOptions taskId={task._id} /></div>
            </div>

            {task.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description}</p>}

            {task.tags && task.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                    {task.tags.map((tag, index) => (
                        <span key={index} className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-medium text-slate-600">{tag}</span>
                    ))}
                </div>
            )}

            <div className="mt-3 flex items-center gap-2">
                <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset", priorityStyles[task.priority])}>
                    {task.priority}
                </span>
                {task.dueDate && (
                    <time dateTime={task.dueDate} className={cn("flex items-center gap-1 text-xs tabular-nums", overdue ? "font-medium text-red-600" : dueToday ? "font-semibold text-blue-700" : "text-muted-foreground")}>
                        <CalendarClock className="size-3.5" />
                        {dueToday ? "Today" : format(new Date(task.dueDate), "MMM d")}
                        {overdue && <span className="sr-only">(overdue)</span>}
                    </time>
                )}
                {checklistTotal > 0 && (
                    <span
                        title={`Checklist: ${checklistDone} of ${checklistTotal} done`}
                        className={cn("flex items-center gap-1 text-xs font-medium tabular-nums", checklistComplete ? "text-emerald-700" : "text-muted-foreground")}
                    >
                        <ListChecks className="size-3.5" aria-hidden="true" />
                        <span className="sr-only">Checklist </span>{checklistDone}/{checklistTotal}
                    </span>
                )}
                {isMine ? (
                    <span className="ml-auto rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700">You</span>
                ) : assigneeName ? (
                    <Avatar className="ml-auto size-6" title={assigneeName}>
                        <AvatarImage src={task.assigneeUser?.avatarUrl} alt={assigneeName} />
                        <AvatarFallback className="bg-slate-200 text-[10px] font-semibold text-slate-700">{initials(assigneeName)}</AvatarFallback>
                    </Avatar>
                ) : null}
            </div>

            {/* Checklist progress runs along the card's bottom edge. */}
            {checklistTotal > 0 && (
                <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] bg-slate-100">
                    <div
                        className={cn("h-full transition-[width] duration-300", checklistComplete ? "bg-emerald-500" : "bg-primary")}
                        style={{ width: `${(checklistDone / checklistTotal) * 100}%` }}
                    />
                </div>
            )}
        </article>
    )
}

export default TaskCard
