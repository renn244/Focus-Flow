import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { addDays, format, isSameDay, isTomorrow, startOfDay } from "date-fns"
import { ArrowRight, FolderPlus, RotateCw } from "lucide-react"
import AppShell from "@/components/layout/AppShell"
import { useOpenTask } from "@/components/layout/useOpenTask"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthContext } from "@/context/authContext"
import { cn } from "@/lib/utils"
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks"
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type"
import { groupAgenda, hasDueTime, tasksOnDay } from "@/features/projectWorkSpace/utils/agenda"
import { projectDotClass, useNavProjects } from "@/features/projects/hooks/useNavProjects"
import type { ProjectWithOwner } from "@/features/projects/type"

type ListView = "overdue" | "today" | "upcoming" | "day"

const priorityStyles = {
    high: "bg-red-50 text-red-700 ring-red-200",
    medium: "bg-amber-50 text-amber-800 ring-amber-200",
    low: "bg-emerald-50 text-emerald-700 ring-emerald-200",
} as const

const dueText = (dueDate: string) => {
    const date = new Date(dueDate)
    const time = hasDueTime(dueDate) ? format(date, " · HH:mm") : ""
    if (isSameDay(date, new Date())) return `Today${time}`
    if (isTomorrow(date)) return `Tomorrow${time}`
    return format(date, "EEE, MMM d") + time
}

const ProjectsDashboard = () => {
    const { user } = useAuthContext()
    const today = useMemo(() => startOfDay(new Date()), [])
    const [view, setView] = useState<ListView>("today")
    const [selectedDate, setSelectedDate] = useState<Date>(today)
    const { data: tasks = [], isLoading, isError, refetch, isFetching } = useMyTasks()
    const { data: projects = [], isLoading: projectsLoading } = useNavProjects()
    const openTask = useOpenTask()

    const groups = useMemo(() => groupAgenda(tasks, today), [tasks, today])
    const projectById = useMemo(() => new Map(projects.map((project) => [project._id, project])), [projects])
    const week = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(today, index)), [today])
    const taskDates = useMemo(() => tasks.flatMap((task) => (task.dueDate ? [new Date(task.dueDate)] : [])), [tasks])

    const selectDate = (date: Date) => {
        const day = startOfDay(date)
        setSelectedDate(day)
        setView(isSameDay(day, today) ? "today" : "day")
    }

    const listTabs: { id: ListView; label: string; count: number }[] = [
        { id: "overdue", label: "Overdue", count: groups.overdue.length },
        { id: "today", label: "Today", count: groups.today.length },
        { id: "upcoming", label: "Next 7 days", count: groups.upcoming.length },
        ...(view === "day" ? [{ id: "day" as const, label: format(selectedDate, "EEE, MMM d"), count: tasksOnDay(tasks, selectedDate).length }] : []),
    ]

    const listed = view === "day" ? tasksOnDay(tasks, selectedDate) : groups[view]
    const emptyCopy = {
        overdue: "You're caught up. Nothing is overdue.",
        today: "Nothing is due today.",
        upcoming: "Nothing is due in the next 7 days.",
        day: `Nothing is due on ${format(selectedDate, "EEEE, MMMM d")}.`,
    }[view]
    const firstName = (user?.displayName || user?.username || "").split(" ")[0]

    return (
        <AppShell>
            <div className="mx-auto w-full max-w-[1400px] px-4 py-7 sm:px-6 lg:px-8">
                <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">
                            {format(today, "EEEE, MMMM d")}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground">
                            {isLoading ? "Loading your agenda…" : (
                                <>
                                    {firstName && <>Hi {firstName}. </>}
                                    {groups.today.length} due today
                                    {groups.overdue.length > 0 && <>, <span className="font-medium text-red-700">{groups.overdue.length} overdue</span></>}
                                    {groups.upcoming.length > 0 && <>, {groups.upcoming.length} more this week</>}.
                                </>
                            )}
                        </p>
                    </div>
                </header>

                <ol aria-label="This week" className="mt-6 grid grid-cols-7 gap-1.5 sm:gap-2">
                    {week.map((day) => {
                        const dayTasks = tasksOnDay(tasks, day)
                        const selected = view === "day" ? isSameDay(day, selectedDate) : view === "today" && isSameDay(day, today)
                        return (
                            <li key={day.toISOString()}>
                                <button
                                    type="button"
                                    onClick={() => selectDate(day)}
                                    aria-pressed={selected}
                                    aria-label={`${format(day, "EEEE, MMMM d")}: ${dayTasks.length} due`}
                                    className={cn(
                                        "flex h-full w-full flex-col rounded-xl border px-2 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:px-3",
                                        selected ? "border-shell bg-shell text-shell-foreground" : "bg-card hover:border-slate-300"
                                    )}
                                >
                                    <span className={cn("text-xs font-medium", selected ? "text-shell-muted" : "text-muted-foreground")}>
                                        {isSameDay(day, today) ? "Today" : format(day, "EEE")}
                                    </span>
                                    <span className="text-lg font-semibold tabular-nums sm:text-xl">{format(day, "d")}</span>
                                    <span className="mt-2 flex min-h-1.5 flex-wrap gap-1" aria-hidden="true">
                                        {dayTasks.slice(0, 4).map((task) => (
                                            <span key={task._id} className={cn("h-1.5 w-3 rounded-full sm:w-4", projectDotClass(projectById.get(task.board.projectId)?.color))} />
                                        ))}
                                        {dayTasks.length > 4 && <span className={cn("text-[10px] leading-none", selected ? "text-shell-muted" : "text-muted-foreground")}>+{dayTasks.length - 4}</span>}
                                    </span>
                                </button>
                            </li>
                        )
                    })}
                </ol>

                <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                    <section aria-labelledby="my-tasks-heading" className="min-w-0 rounded-xl border bg-card">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
                            <h2 id="my-tasks-heading" className="text-base font-semibold">My tasks</h2>
                            <div role="group" aria-label="Show tasks" className="flex max-w-full gap-1 overflow-x-auto rounded-lg bg-muted p-1">
                                {listTabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        aria-pressed={view === tab.id}
                                        onClick={() => (tab.id === "today" ? selectDate(today) : setView(tab.id))}
                                        className={cn(
                                            "flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium transition-colors focus-visible:outline-2",
                                            view === tab.id ? "bg-card text-foreground shadow-[0_1px_2px_rgb(15_23_42/0.1)]" : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {tab.label}
                                        <span className={cn("tabular-nums", tab.id === "overdue" && tab.count > 0 && "text-red-700")}>{isLoading ? "–" : tab.count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {isLoading ? (
                            <div role="status" aria-busy="true" className="divide-y">
                                <span className="sr-only">Loading your tasks</span>
                                {Array.from({ length: 4 }, (_, index) => (
                                    <div key={index} aria-hidden="true" className="flex items-center gap-4 px-5 py-4">
                                        <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/3" /><Skeleton className="h-3 w-1/3" /></div>
                                        <Skeleton className="h-5 w-14" />
                                    </div>
                                ))}
                            </div>
                        ) : isError ? (
                            <div role="alert" className="flex flex-wrap items-center gap-3 px-5 py-8 text-sm">
                                <p className="text-destructive">Your tasks couldn't load.</p>
                                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                                    <RotateCw className={cn(isFetching && "animate-spin")} /> Try again
                                </Button>
                            </div>
                        ) : listed.length === 0 ? (
                            <EmptyTasks message={emptyCopy} next={view === "today" ? groups.upcoming[0] ?? groups.later : undefined} onOpen={openTask} hasProjects={projects.length > 0 || projectsLoading} />
                        ) : (
                            <ul className="divide-y">
                                {listed.map((task) => (
                                    <li key={task._id}>
                                        <TaskRow task={task} project={projectById.get(task.board.projectId)} overdue={view === "overdue"} onOpen={() => openTask(task)} />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <aside className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
                        <section aria-label="Schedule" className="rounded-xl border bg-card p-4 [&_[data-slot=calendar]]:bg-transparent">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={(date) => date && selectDate(date)}
                                modifiers={{ hasTasks: taskDates }}
                                modifiersClassNames={{ hasTasks: "font-semibold text-primary" }}
                                className="mx-auto w-full max-w-[18rem] bg-transparent p-0 [--cell-size:--spacing(9)]"
                                classNames={{ root: "w-full" }}
                            />
                        </section>
                        <ProjectList projects={projects} loading={projectsLoading} />
                    </aside>
                </div>
            </div>
        </AppShell>
    )
}

const TaskRow = ({ task, project, overdue, onOpen }: { task: TaskWithBoardAndColumn; project?: ProjectWithOwner; overdue: boolean; onOpen: () => void }) => (
    <button type="button" onClick={onOpen} className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2 sm:grid-cols-[6.5rem_minmax(0,1fr)_auto] sm:px-5">
        {task.dueDate ? (
            <time dateTime={task.dueDate} className={cn("hidden text-sm tabular-nums sm:block", overdue ? "font-medium text-red-700" : "font-medium text-foreground")}>
                {overdue ? format(new Date(task.dueDate), "EEE, MMM d") : shortDue(task.dueDate)}
            </time>
        ) : <span className="hidden sm:block" />}
        <span className="min-w-0">
            <span className="block truncate font-medium text-foreground">{task.title}</span>
            <span className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[3px]", projectDotClass(project?.color))} />
                <span className="truncate">
                    {project?.name ?? task.board.name} · {task.column.title}
                    {task.dueDate && <span className="sm:hidden"> · {shortDue(task.dueDate)}</span>}
                </span>
            </span>
        </span>
        <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset", priorityStyles[task.priority])}>{task.priority}</span>
    </button>
)

/** Time for today's tasks, day + date otherwise. */
const shortDue = (dueDate: string) => {
    const date = new Date(dueDate)
    if (isSameDay(date, new Date())) return hasDueTime(dueDate) ? format(date, "HH:mm") : "Today"
    if (isTomorrow(date)) return hasDueTime(dueDate) ? `Tomorrow ${format(date, "HH:mm")}` : "Tomorrow"
    return format(date, "EEE, MMM d")
}

const EmptyTasks = ({ message, next, onOpen, hasProjects }: { message: string; next?: TaskWithBoardAndColumn; onOpen: (task: TaskWithBoardAndColumn) => void; hasProjects: boolean }) => (
    <div className="px-5 py-10 text-center">
        <p className="font-medium text-foreground">{message}</p>
        {!hasProjects ? (
            <>
                <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Create a project, add a board, and tasks assigned to you with a due date will show up here.</p>
                <Button asChild className="mt-4"><Link to="/projects/all"><FolderPlus /> Create a project</Link></Button>
            </>
        ) : next?.dueDate ? (
            <button type="button" onClick={() => onOpen(next)} className="group mx-auto mt-2 inline-flex max-w-full items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <span className="truncate">Next up: {next.title}, {dueText(next.dueDate)}</span>
                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" />
            </button>
        ) : (
            <p className="mt-1 text-sm text-muted-foreground">Tasks assigned to you with a due date appear here.</p>
        )}
    </div>
)

const ProjectList = ({ projects, loading }: { projects: ProjectWithOwner[]; loading: boolean }) => (
    <section aria-labelledby="projects-heading" className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 id="projects-heading" className="text-sm font-semibold">Projects</h2>
            <Link to="/projects/all" className="rounded text-xs font-medium text-primary hover:underline focus-visible:outline-2">View all</Link>
        </div>
        {loading ? (
            <div className="space-y-3 p-4" role="status" aria-busy="true"><span className="sr-only">Loading projects</span><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-2/3" /><Skeleton className="h-4 w-1/2" /></div>
        ) : projects.length === 0 ? (
            <p className="px-4 py-5 text-sm text-muted-foreground">No active projects yet.</p>
        ) : (
            <ul className="py-1.5">
                {projects.slice(0, 6).map((project) => (
                    <li key={project._id}>
                        <Link to="/projects/$projectId" params={{ projectId: project._id }} className="flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-slate-50 focus-visible:outline-2 focus-visible:-outline-offset-2">
                            <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-[3px]", projectDotClass(project.color))} />
                            <span className="min-w-0 flex-1 truncate font-medium">{project.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{project.openTasks} open</span>
                        </Link>
                    </li>
                ))}
            </ul>
        )}
    </section>
)

export default ProjectsDashboard
