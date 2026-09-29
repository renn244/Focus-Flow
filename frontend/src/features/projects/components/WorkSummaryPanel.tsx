import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks"
import useSelectBoardStore from "@/features/projectWorkSpace/store/useSelectBoard"
import useTaskDialogStore from "@/features/projectWorkSpace/store/useTaskDialog"
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type"
import { addDays, format, isBefore, isSameDay, startOfDay, subDays } from "date-fns"
import { CalendarDays, ListTodo } from "lucide-react"
import { useNavigate } from "@tanstack/react-router"
import { useMemo, useState } from "react"

const priorityClassNames = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const

const taskGroupId = (title: string) => `${title.toLowerCase().replace(/\s+/g, "-")}-tasks`

const WorkSummaryPanel = () => {
  const today = startOfDay(new Date())
  const [selectedDate, setSelectedDate] = useState<Date>(today)
  const [activeWorkTab, setActiveWorkTab] = useState("today")
  const { data: tasks = [], isLoading, isError } = useMyTasks()
  const navigate = useNavigate()
  const setSelectedBoardId = useSelectBoardStore((state) => state.setSelectedBoardId)
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId)

  const taskDates = useMemo(
    () => tasks.flatMap((task) => (task.dueDate ? [new Date(task.dueDate)] : [])),
    [tasks]
  )

  const taskGroups = useMemo(() => {
    const nextWeek = addDays(today, 8)

    return {
      overdue: tasks.filter((task) => task.dueDate && isBefore(startOfDay(new Date(task.dueDate)), today)),
      today: tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), today)),
      upcoming: tasks.filter(
        (task) =>
          task.dueDate &&
          isBefore(today, startOfDay(new Date(task.dueDate))) &&
          isBefore(startOfDay(new Date(task.dueDate)), nextWeek)
      ),
    }
  }, [tasks, today])

  const selectedDateTasks = useMemo(
    () => tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), selectedDate)),
    [selectedDate, tasks]
  )

  const openTask = (task: TaskWithBoardAndColumn) => {
    setSelectedBoardId(task.board._id)
    setViewTaskId(task._id)
    navigate({ to: "/projects/$projectId", params: { projectId: task.board.projectId } })
  }

  const selectScheduleDate = (date: Date) => {
    const nextDate = startOfDay(date)
    setSelectedDate(nextDate)
    setActiveWorkTab(isSameDay(nextDate, today) ? "today" : "selected-date")
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <ListTodo className="size-5 text-primary" />
            My work
          </CardTitle>
          <p className="text-sm text-muted-foreground">Your assigned work, grouped by when it needs attention.</p>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your assigned tasks…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Your tasks could not be loaded. Please try again.</p>
          ) : (
            <Tabs value={activeWorkTab} onValueChange={setActiveWorkTab}>
              <div className="overflow-x-auto pb-1">
                <TabsList className="w-max">
                  <TabsTrigger value="overdue">
                    Overdue
                    <Badge variant="secondary">{taskGroups.overdue.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="today">
                    Today
                    <Badge variant="secondary">{taskGroups.today.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="upcoming">
                    Next 7 days
                    <Badge variant="secondary">{taskGroups.upcoming.length}</Badge>
                  </TabsTrigger>
                  {!isSameDay(selectedDate, today) && (
                    <TabsTrigger value="selected-date">
                      {format(selectedDate, "MMM d")}
                      <Badge variant="secondary">{selectedDateTasks.length}</Badge>
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <TabsContent value="overdue" className="mt-4">
                <TaskGroup title="Overdue" description="Tasks that need attention first." tasks={taskGroups.overdue} emptyMessage="You have no overdue work." onOpenTask={openTask} />
              </TabsContent>
              <TabsContent value="today" className="mt-4">
                <TaskGroup title="Today" description="Tasks due today." tasks={taskGroups.today} emptyMessage="Nothing due today." onOpenTask={openTask} />
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                <TaskGroup title="Upcoming" description="Due tomorrow through the next seven days." tasks={taskGroups.upcoming} emptyMessage="No upcoming tasks in the next seven days." onOpenTask={openTask} />
              </TabsContent>
              {!isSameDay(selectedDate, today) && (
                <TabsContent value="selected-date" className="mt-4">
                  <TaskGroup title={format(selectedDate, "EEEE, MMMM d")} description="Tasks due on the date selected in your schedule." tasks={selectedDateTasks} emptyMessage="Nothing is due on this day." onOpenTask={openTask} />
                </TabsContent>
              )}
            </Tabs>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit gap-0">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CalendarDays className="size-5 text-primary" />
            Schedule
          </CardTitle>
          <p className="text-sm text-muted-foreground">Choose a date to review your due work.</p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-3">
          <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && selectScheduleDate(date)} modifiers={{ hasTasks: taskDates }} modifiersClassNames={{ hasTasks: "font-semibold text-primary" }} className="w-full rounded-lg [--cell-size:--spacing(9)]" classNames={{ root: "w-full" }} />
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant={isSameDay(selectedDate, subDays(today, 1)) ? "default" : "outline"} size="sm" onClick={() => selectScheduleDate(subDays(today, 1))}>Yesterday</Button>
            <Button variant={isSameDay(selectedDate, today) ? "default" : "outline"} size="sm" onClick={() => selectScheduleDate(today)}>Today</Button>
            <Button variant={isSameDay(selectedDate, addDays(today, 1)) ? "default" : "outline"} size="sm" onClick={() => selectScheduleDate(addDays(today, 1))}>Tomorrow</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

type TaskGroupProps = {
  title: string
  description: string
  tasks: TaskWithBoardAndColumn[]
  emptyMessage: string
  onOpenTask: (task: TaskWithBoardAndColumn) => void
}

const TaskGroup = ({ title, description, tasks, emptyMessage, onOpenTask }: TaskGroupProps) => (
  <section aria-labelledby={taskGroupId(title)}>
    <div className="mb-3 flex items-end justify-between gap-4">
      <div>
        <h3 id={taskGroupId(title)} className="font-medium">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Badge variant="secondary">{tasks.length}</Badge>
    </div>
    {tasks.length === 0 ? (
      <div className="flex min-h-20 items-center rounded-lg border border-dashed px-4 text-sm text-muted-foreground">{emptyMessage}</div>
    ) : (
      <div className="overflow-hidden rounded-lg border">
        {tasks.map((task) => <TaskRow key={task._id} task={task} onOpenTask={onOpenTask} />)}
      </div>
    )}
  </section>
)

const TaskRow = ({ task, onOpenTask }: { task: TaskWithBoardAndColumn; onOpenTask: (task: TaskWithBoardAndColumn) => void }) => (
  <button type="button" onClick={() => onOpenTask(task)} className="flex w-full items-center justify-between gap-4 border-b p-4 text-left last:border-b-0 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{task.title}</p>
      <p className="mt-1 truncate text-sm text-muted-foreground">{task.board.name} · {task.column.title} · due {task.dueDate ? format(new Date(task.dueDate), "MMM d") : "later"}</p>
    </div>
    <Badge variant="outline" className={priorityClassNames[task.priority]}>{task.priority}</Badge>
  </button>
)

export default WorkSummaryPanel
