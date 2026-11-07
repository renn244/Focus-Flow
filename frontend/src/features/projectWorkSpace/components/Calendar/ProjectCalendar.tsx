import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import dayGridPlugin from "@fullcalendar/react/daygrid";
import interactionPlugin from "@fullcalendar/react/interaction";
import listPlugin from "@fullcalendar/react/list";
import themePlugin from "@fullcalendar/react/themes/classic";
import FullCalendar, { type CalendarRef, type DatesSetInfo, type EventDisplayInfo, type EventInput } from "@fullcalendar/react";
import "@fullcalendar/react/skeleton.css";
import "@fullcalendar/react/themes/classic/theme.css";
import { CalendarDays, ChevronLeft, ChevronRight, CircleAlert } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useGetTasksByProject } from "../../hooks/Task/useGetTasksByProject";
import useTaskDialogStore from "../../store/useTaskDialog";
import type { TaskWithBoardAndColumn } from "../../type";
import "./project-calendar.css";
import ProjectCalendarSkeleton from "./ProjectCalendarSkeleton";

type ProjectCalendarProps = {
  projectId: string;
};

type CalendarView = "dayGridMonth" | "dayGridWeek" | "listWeek";

const toCalendarDate = (dueDate: string) => {
  const date = new Date(dueDate);

  return Number.isNaN(date.getTime()) ? dueDate : date.toISOString().slice(0, 10);
};

const priorityStyles = {
  high: "bg-rose-700 text-white hover:bg-rose-800",
  medium: "bg-amber-200 text-amber-950 hover:bg-amber-300",
  low: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
} as const;

const agendaPriorityStyles = {
  high: "bg-rose-700",
  medium: "bg-amber-500",
  low: "bg-emerald-600",
} as const;

const calendarRailStyles = {
  high: "bg-white/85",
  medium: "bg-amber-800/70",
  low: "bg-emerald-800/70",
} as const;

const initials = (name: string) => name
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase();

const formatCalendarEvent = (eventInfo: EventDisplayInfo) => {
  const task = eventInfo.event.extendedProps.task as TaskWithBoardAndColumn;

  if (eventInfo.view.type === "listWeek") {
    const assignee = task.assigneeUser;
    const assigneeName = assignee?.displayName || assignee?.username;

    return (
      <div className="agenda-task-card group relative flex min-h-[3.25rem] w-full items-center gap-3 rounded-lg border border-slate-200 bg-white py-2 pl-6 pr-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
        <span className={cn("absolute left-2.5 top-1/2 h-8 w-1.5 -translate-y-1/2 rounded-full", agendaPriorityStyles[task.priority])} aria-label={`${task.priority} priority`} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-900">{task.title}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{task.board.name} · {task.column.title}</p>
        </div>
        {assignee && assigneeName ? (
          <div className="flex shrink-0 items-center gap-2 pl-2" title={assigneeName}>
            <span className="hidden max-w-28 truncate text-xs font-medium text-slate-600 sm:inline">{assigneeName}</span>
            <Avatar className="size-7 border border-white ring-1 ring-slate-200">
              <AvatarImage src={assignee.avatarUrl} alt={assigneeName} />
              <AvatarFallback className="bg-[#4263eb]/10 text-[10px] font-semibold text-[#4263eb]">{initials(assigneeName)}</AvatarFallback>
            </Avatar>
          </div>
        ) : (
          <span className="shrink-0 text-xs font-medium text-slate-400">Unassigned</span>
        )}
      </div>
    );
  }

  const assignee = task.assigneeUser;
  const assigneeName = assignee?.displayName || assignee?.username;

  if (eventInfo.view.type === "dayGridWeek") {
    return (
      <div className="week-task-card relative flex min-h-28 w-full flex-col rounded-lg border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50">
        <span className={cn("absolute bottom-3 left-2 top-3 w-1.5 rounded-full", agendaPriorityStyles[task.priority])} aria-label={`${task.priority} priority`} />
        <p className="line-clamp-2 pl-2 text-sm font-semibold leading-5 text-slate-900">{task.title}</p>
        <p className="mt-1 line-clamp-2 pl-2 text-xs leading-4 text-slate-500">{task.description || "No description provided."}</p>
        <div className="mt-auto flex min-h-5 items-center justify-between gap-2 pl-2 pt-3">
          <div className="flex min-w-0 flex-wrap gap-1">
            {task.tags?.slice(0, 2).map((tag) => (
              <span key={tag} className="max-w-20 truncate rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium leading-3 text-slate-600">{tag}</span>
            ))}
          </div>
          {assignee && assigneeName && (
            <div className="shrink-0" title={assigneeName}>
              <Avatar className="size-5 border border-slate-200">
                <AvatarImage src={assignee.avatarUrl} alt={assigneeName} />
                <AvatarFallback className="bg-[#4263eb]/10 text-[8px] font-semibold text-[#4263eb]">{initials(assigneeName)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative flex min-w-0 items-start rounded-[3px] py-1.5 pl-4 pr-2 text-xs font-semibold shadow-sm transition-colors", priorityStyles[task.priority])}>
      <span className={cn("absolute bottom-1.5 left-1 top-1.5 w-1 rounded-full", calendarRailStyles[task.priority])} aria-label={`${task.priority} priority`} />
      <span className="line-clamp-2 leading-3">{task.title}</span>
    </div>
  );
};

const ProjectCalendar = ({ projectId }: ProjectCalendarProps) => {
  const calendarRef = useRef<CalendarRef>(null);
  const [calendarTitle, setCalendarTitle] = useState("");
  const [calendarView, setCalendarView] = useState<CalendarView>(() =>
    window.matchMedia("(max-width: 639px)").matches ? "listWeek" : "dayGridMonth"
  );
  const { data: tasks = [], isLoading, isError } = useGetTasksByProject(projectId);
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);

  const events = useMemo<EventInput[]>(
    () => tasks
      .filter((task) => Boolean(task.dueDate))
      .map((task) => ({
        id: task._id,
        title: task.title,
        start: toCalendarDate(task.dueDate!),
        allDay: true,
        extendedProps: { task },
      })),
    [tasks],
  );

  const navigate = (action: "prev" | "next" | "today") => {
    calendarRef.current?.getApi()[action]();
  };

  const changeView = (view: CalendarView) => {
    calendarRef.current?.getApi().changeView(view);
    setCalendarView(view);
  };

  if (isLoading) {
    return <ProjectCalendarSkeleton agenda={calendarView === "listWeek"} />;
  }

  if (isError) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-2 p-6 text-center">
        <CircleAlert className="size-5 text-destructive" />
        <p className="font-medium">Couldn’t load the project calendar.</p>
        <p className="text-sm text-muted-foreground">Try refreshing the page.</p>
      </div>
    );
  }

  return (
    <section className="project-calendar app-content min-h-[calc(100vh-8rem)]" aria-label="Project calendar">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground" aria-live="polite">{calendarTitle}</h2>
        <div className="flex flex-wrap items-center justify-end gap-3">
          <div className="flex flex-wrap items-center gap-1.5" aria-label="Calendar controls">
            <Tabs value={calendarView} onValueChange={(value) => changeView(value as CalendarView)} aria-label="Calendar view">
              <TabsList className="h-9 rounded-lg bg-slate-100 p-1 shadow-none">
                <TabsTrigger value="dayGridMonth" className="h-7 min-w-16 rounded-md border-0 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Month</TabsTrigger>
                <TabsTrigger value="dayGridWeek" className="h-7 min-w-16 rounded-md border-0 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Week</TabsTrigger>
                <TabsTrigger value="listWeek" className="h-7 min-w-16 rounded-md border-0 px-3 text-xs font-semibold text-slate-500 hover:text-slate-900 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-sm">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button type="button" variant="outline" size="sm" className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-950" onClick={() => navigate("today")}>Today</Button>
            <div className="flex items-center rounded-md border border-slate-200 bg-white p-0.5 shadow-xs">
              <Button type="button" variant="ghost" size="icon" className="size-7 text-slate-500 hover:bg-slate-50 hover:text-slate-950" aria-label="Previous period" onClick={() => navigate("prev")}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-7 text-slate-500 hover:bg-slate-50 hover:text-slate-950" aria-label="Next period" onClick={() => navigate("next")}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className={cn(
        "task-calendar",
        calendarView === "dayGridWeek" && "task-calendar-week",
        calendarView === "listWeek" && "task-calendar-agenda",
      )}>
        <FullCalendar
          ref={calendarRef}
          plugins={[themePlugin, dayGridPlugin, listPlugin, interactionPlugin]}
          initialView={calendarView}
          headerToolbar={false}
          fixedWeekCount={false}
          expandRows={calendarView === "dayGridWeek"}
          dayMaxEventRows={3}
          moreLinkText={(count) => `+${count} more`}
          events={events}
          eventContent={formatCalendarEvent}
          eventClick={(info) => setViewTaskId(info.event.id)}
          dayCellClass={(info) => (
            info.isToday ? "task-calendar-today" : info.isOther ? "task-calendar-other-month" : ""
          )}
          datesSet={(info: DatesSetInfo) => setCalendarTitle(info.view.title)}
          height={calendarView === "dayGridWeek" ? 640 : "auto"}
        />
      </div>

      {events.length === 0 && (
        <div className="mt-6 flex items-start gap-3 text-sm text-slate-500">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <CalendarDays className="size-4" aria-hidden="true" />
          </span>
          <p className="pt-1 leading-5"><span className="font-medium text-slate-800">No due dates yet.</span> Set a due date on a task and it will appear in this month view.</p>
        </div>
      )}
    </section>
  );
};

export default ProjectCalendar;
