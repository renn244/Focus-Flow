import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks"
import type { TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type"
import { addDays, format, isSameDay, startOfDay, subDays } from "date-fns"
import { CalendarDays, CircleCheck, ListTodo } from "lucide-react"
import { useMemo, useState } from "react"

const priorityClassNames = {
  high: "border-red-200 bg-red-50 text-red-700",
  medium: "border-amber-200 bg-amber-50 text-amber-700",
  low: "border-emerald-200 bg-emerald-50 text-emerald-700",
} as const

const WorkSummaryPanel = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()))
  const { data: tasks = [], isLoading, isError } = useMyTasks()

  const tasksForSelectedDate = useMemo(
    () =>
      tasks.filter((task) =>
        task.dueDate ? isSameDay(new Date(task.dueDate), selectedDate) : false
      ),
    [selectedDate, tasks]
  )

  const taskDates = useMemo(
    () => tasks.flatMap((task) => (task.dueDate ? [new Date(task.dueDate)] : [])),
    [tasks]
  )

  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ListTodo className="size-5 text-primary" />
              My work
            </CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Tasks assigned to you and due {format(selectedDate, "EEEE, MMMM d")}.
            </p>
          </div>
          {!isLoading && (
            <Badge variant="secondary">{tasksForSelectedDate.length} due</Badge>
          )}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading your assigned tasks…</p>
          ) : isError ? (
            <p className="text-sm text-destructive">Your tasks could not be loaded. Please try again.</p>
          ) : tasksForSelectedDate.length === 0 ? (
            <div className="flex min-h-44 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
              <CircleCheck className="size-8 text-emerald-600" />
              <h3 className="mt-3 font-medium">Nothing due this day</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Tasks assigned to you with a due date will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y rounded-lg border">
              {tasksForSelectedDate.map((task) => (
                <TaskRow key={task._id} task={task} />
              ))}
            </div>
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
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => date && setSelectedDate(startOfDay(date))}
            modifiers={{ hasTasks: taskDates }}
            modifiersClassNames={{ hasTasks: "font-semibold text-primary" }}
            className="w-full rounded-lg [--cell-size:--spacing(9)]"
            classNames={{ root: "w-full" }}
          />
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              variant={isSameDay(selectedDate, subDays(new Date(), 1)) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(startOfDay(subDays(new Date(), 1)))}
            >
              Yesterday
            </Button>
            <Button
              variant={isSameDay(selectedDate, new Date()) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(startOfDay(new Date()))}
            >
              Today
            </Button>
            <Button
              variant={isSameDay(selectedDate, addDays(new Date(), 1)) ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(startOfDay(addDays(new Date(), 1)))}
            >
              Tomorrow
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

const TaskRow = ({ task }: { task: TaskWithBoardAndColumn }) => (
  <div className="flex items-center justify-between gap-4 p-4">
    <div className="min-w-0">
      <p className="truncate font-medium text-foreground">{task.title}</p>
      <p className="mt-1 truncate text-sm text-muted-foreground">
        {task.board.name} · {task.column.title}
      </p>
    </div>
    <Badge variant="outline" className={priorityClassNames[task.priority]}>
      {task.priority}
    </Badge>
  </div>
)

export default WorkSummaryPanel
