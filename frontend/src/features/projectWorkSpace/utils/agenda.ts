import { addDays, isBefore, isSameDay, startOfDay } from "date-fns";
import type { TaskWithBoardAndColumn } from "../type";

export type AgendaRange = "overdue" | "today" | "upcoming";

export type AgendaGroups = Record<AgendaRange, TaskWithBoardAndColumn[]> & {
    /** First task due after the next seven days, used for "next up" empty states. */
    later?: TaskWithBoardAndColumn;
};

const due = (task: TaskWithBoardAndColumn) => (task.dueDate ? startOfDay(new Date(task.dueDate)) : null);

const byDueDate = (a: TaskWithBoardAndColumn, b: TaskWithBoardAndColumn) =>
    new Date(a.dueDate ?? 0).getTime() - new Date(b.dueDate ?? 0).getTime();

export const groupAgenda = (tasks: TaskWithBoardAndColumn[], today = startOfDay(new Date())): AgendaGroups => {
    const weekEnd = addDays(today, 8);
    const dated = tasks.filter((task) => task.dueDate).sort(byDueDate);

    return {
        overdue: dated.filter((task) => isBefore(due(task)!, today)),
        today: dated.filter((task) => isSameDay(due(task)!, today)),
        upcoming: dated.filter((task) => isBefore(today, due(task)!) && isBefore(due(task)!, weekEnd)),
        later: dated.find((task) => !isBefore(due(task)!, weekEnd)),
    };
};

export const tasksOnDay = (tasks: TaskWithBoardAndColumn[], day: Date) =>
    tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), day)).sort(byDueDate);

/** True when the due date carries a time other than midnight. */
export const hasDueTime = (dueDate: string) => {
    const date = new Date(dueDate);
    return date.getHours() !== 0 || date.getMinutes() !== 0;
};
