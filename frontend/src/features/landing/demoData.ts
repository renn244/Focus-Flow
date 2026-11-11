import { addDays, setHours, setMinutes, startOfDay } from "date-fns";
import type { AuthContextType } from "@/context/authContext";
import type { BoardWithColumns, ColumnWithTasks, TaskWithBoardAndColumn } from "@/features/projectWorkSpace/type";
import type { ProjectWithOwner } from "@/features/projects/type";

/**
 * Sample workspace for the landing page preview. The preview renders the real
 * app components against this data, so every date is relative to today.
 */

const stamp = "2026-01-01T00:00:00.000Z";

const at = (days: number, hours = 0, minutes = 0) =>
    setMinutes(setHours(addDays(startOfDay(new Date()), days), hours), minutes).toISOString();

const people = {
    you: { _id: "demo-you", displayName: "Alex Rivera", username: "alex" },
    jordan: { _id: "demo-jordan", displayName: "Jordan Lee", username: "jordan" },
    sam: { _id: "demo-sam", displayName: "Sam Okafor", username: "sam" },
    priya: { _id: "demo-priya", displayName: "Priya Nair", username: "priya" },
};

export const demoMembers = [people.jordan, people.sam, people.priya];

export const demoAuth: AuthContextType = {
    isAuthenticated: true,
    isLoading: false,
    checkAuth: async () => undefined,
    user: {
        ...people.you,
        email: "alex@example.com",
        emailVerified: true,
        isOauthUser: false,
    },
};

const project = (_id: string, name: string, color: string, openTasks: number): ProjectWithOwner => ({
    _id,
    name,
    color,
    openTasks,
    description: "",
    status: "active",
    priority: "medium",
    progress: 0,
    totalTasks: openTasks,
    completedTasks: 0,
    dueDate: at(30),
    starred: false,
    createdAt: stamp,
    updatedAt: stamp,
    owner: { name: "alex", displayName: "Alex Rivera", email: "alex@example.com" },
});

export const demoProjects: ProjectWithOwner[] = [
    project("demo-capstone", "Capstone app", "bg-blue-500", 9),
    project("demo-research", "User research", "bg-purple-500", 4),
    project("demo-pitch", "Final pitch", "bg-cyan-500", 3),
];

export const demoProject = demoProjects[0];

const columns = {
    todo: { _id: "demo-col-todo", title: "To do", color: "#94a3b8" },
    doing: { _id: "demo-col-doing", title: "In progress", color: "#3b82f6" },
    review: { _id: "demo-col-review", title: "Review", color: "#a78bfa" },
    done: { _id: "demo-col-done", title: "Done", color: "#10b981" },
};

type ColumnKey = keyof typeof columns;

const sprint = { _id: "demo-board-sprint", name: "Sprint 3", projectId: demoProject._id };
const interviews = { _id: "demo-board-interviews", name: "Interviews", projectId: "demo-research" };
const deck = { _id: "demo-board-deck", name: "Pitch deck", projectId: "demo-pitch" };

let nextId = 0;

const task = (
    board: TaskWithBoardAndColumn["board"],
    column: ColumnKey,
    title: string,
    fields: Partial<Omit<TaskWithBoardAndColumn, "board" | "column" | "title">> = {}
): TaskWithBoardAndColumn => {
    const id = `demo-task-${++nextId}`;
    return {
        _id: id,
        title,
        description: "",
        priority: "medium",
        board,
        column: columns[column],
        createdAt: stamp,
        updatedAt: stamp,
        ...fields,
        assignee: fields.assigneeUser?._id,
    };
};

const checklist = (done: number, total: number) =>
    Array.from({ length: total }, (_, index) => ({ _id: `demo-check-${++nextId}`, text: `Step ${index + 1}`, done: index < done }));

const sprintTasks: Record<ColumnKey, TaskWithBoardAndColumn[]> = {
    todo: [
        task(sprint, "todo", "Write onboarding copy", { priority: "low", dueDate: at(4), tags: ["content"], assigneeUser: people.priya }),
        task(sprint, "todo", "Set up the staging database", { priority: "medium", dueDate: at(3), assigneeUser: people.sam }),
    ],
    doing: [
        task(sprint, "doing", "Build the sign-up flow", {
            priority: "high",
            dueDate: at(0, 15, 0),
            description: "Email check, password rules and the welcome screen.",
            tags: ["frontend"],
            checklist: checklist(3, 5),
            assigneeUser: people.you,
        }),
        task(sprint, "doing", "Connect the tasks API", { priority: "medium", dueDate: at(1), tags: ["backend"], checklist: checklist(1, 4), assigneeUser: people.jordan }),
    ],
    review: [
        task(sprint, "review", "Fix the date picker on mobile", { priority: "high", dueDate: at(-1), tags: ["bug"], assigneeUser: people.you }),
    ],
    done: [
        task(sprint, "done", "Agree on the colour palette", { priority: "low", checklist: checklist(3, 3), assigneeUser: people.priya }),
    ],
};

export const demoBoard: BoardWithColumns = {
    ...sprint,
    description: "Two weeks to a working sign-up and task list.",
    columns: [],
    createdAt: stamp,
    updatedAt: stamp,
};

export const demoColumns: ColumnWithTasks[] = (Object.keys(columns) as ColumnKey[]).map((key, order) => ({
    ...columns[key],
    order,
    tasks: sprintTasks[key],
    createdAt: stamp,
    updatedAt: stamp,
}));

const boardTasks = Object.values(sprintTasks).flat();

/** Everything assigned to the sample user, as `GET /task/mine` returns it. */
export const demoMyTasks: TaskWithBoardAndColumn[] = [
    ...boardTasks.filter((item) => item.assigneeUser?._id === people.you._id),
    task(interviews, "doing", "Summarise interview notes", { priority: "medium", dueDate: at(0, 10, 30), assigneeUser: people.you }),
    task(deck, "todo", "Send slides to the team", { priority: "medium", dueDate: at(0, 17, 0), assigneeUser: people.you }),
    task(interviews, "todo", "Book two more interviews", { priority: "low", dueDate: at(1, 9, 0), assigneeUser: people.you }),
    task(sprint, "todo", "Review Jordan's pull request", { priority: "medium", dueDate: at(2), assigneeUser: people.you }),
    task(deck, "todo", "Rehearse the demo", { priority: "high", dueDate: at(5, 14, 0), assigneeUser: people.you }),
];
