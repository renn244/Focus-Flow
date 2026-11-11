import { useMemo, type ReactNode } from "react";
import { DndContext } from "@dnd-kit/core";
import { motion } from "framer-motion";
import { startOfDay } from "date-fns";
import { CalendarDays, Check, KeyRound, Layers, MessagesSquare, Radio, Search } from "lucide-react";
import AgendaPanel from "@/components/layout/AgendaPanel";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import ColumnCard from "@/features/projectWorkSpace/components/Column/ColumnCard";
import ChangesView from "@/features/projectWorkSpace/components/Notes/history/ChangesView";
import HistoryToolbar from "@/features/projectWorkSpace/components/Notes/history/HistoryToolbar";
import TaskAttachments from "@/features/projectWorkSpace/components/Task/attachments/TaskAttachments";
import TaskComments from "@/features/projectWorkSpace/components/Task/comments/TaskComments";
import DemoProviders from "./DemoProviders";
import { demoColumns, demoFocusTask, demoMyTasks, demoNoteChanges, demoNoteTitle } from "./demoData";
import { ease } from "./motion";

const noop = () => undefined;

/** A window onto one part of the real app, filled with sample data and not clickable. */
const AppFrame = ({ children, className }: { children: ReactNode; className?: string }) => (
    <motion.figure
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease }}
        className="min-w-0 rounded-2xl border border-blue-300/15 bg-[#0b1630] p-1.5 shadow-[0_24px_64px_rgba(0,0,0,0.38)] sm:p-2"
    >
        <div inert className={cn("select-none overflow-hidden rounded-[10px] text-left text-foreground", className)}>
            {children}
        </div>
    </motion.figure>
);

type FeatureProps = {
    title: string;
    description: string;
    points: string[];
    visual: ReactNode;
    flip?: boolean;
};

const Feature = ({ title, description, points, visual, flip = false }: FeatureProps) => (
    <div className={cn("grid items-center gap-10 lg:gap-16", flip ? "lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]" : "lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]")}>
        <div className={cn("max-w-lg", flip && "lg:order-last")}>
            <h3 className="text-balance text-2xl font-semibold tracking-[-0.035em] text-white sm:text-3xl">{title}</h3>
            <p className="mt-4 text-base leading-7 text-blue-100/70">{description}</p>
            <ul className="mt-6 space-y-2.5">
                {points.map((point) => (
                    <li key={point} className="flex gap-3 text-sm leading-6 text-blue-50/85">
                        <Check className="mt-1 size-4 shrink-0 text-blue-300" aria-hidden="true" />
                        {point}
                    </li>
                ))}
            </ul>
        </div>
        {visual}
    </div>
);

const BoardVisual = () => (
    <AppFrame className="bg-background p-3 sm:p-4">
        <DndContext>
            <div className="grid gap-3 sm:grid-cols-2">
                {demoColumns.slice(1, 3).map((column) => <ColumnCard key={column._id} column={column} />)}
            </div>
        </DndContext>
    </AppFrame>
);

const AgendaVisual = () => {
    const today = useMemo(() => startOfDay(new Date()), []);
    const taskDates = useMemo(() => demoMyTasks.flatMap((task) => (task.dueDate ? [new Date(task.dueDate)] : [])), []);
    return (
        <AppFrame className="grid sm:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
            <div className="h-[22rem] bg-shell-raised">
                <AgendaPanel />
            </div>
            <div className="hidden items-center justify-center bg-background p-4 sm:flex">
                <div className="w-full rounded-xl border bg-card p-4 [&_[data-slot=calendar]]:bg-transparent">
                    <Calendar
                        mode="single"
                        selected={today}
                        modifiers={{ hasTasks: taskDates }}
                        modifiersClassNames={{ hasTasks: "font-semibold text-primary" }}
                        className="mx-auto w-full bg-transparent p-0 [--cell-size:--spacing(8)]"
                        classNames={{ root: "w-full" }}
                    />
                </div>
            </div>
        </AppFrame>
    );
};

const NotesVisual = () => (
    <AppFrame className="bg-card">
        {/* In the app the toolbar sticks under the top bar; here it simply heads the window. */}
        <div className="[&>div]:static">
            <HistoryToolbar noteTitle={demoNoteTitle} showChanges onToggleChanges={noop} canRestore restoreDisabled={false} onRestore={noop} onBack={noop} />
        </div>
        <div className="px-5 py-5 sm:px-7">
            <ChangesView blocks={demoNoteChanges} />
        </div>
    </AppFrame>
);

const TeamVisual = () => (
    <AppFrame className="relative max-h-[38rem] bg-card after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-28 after:bg-gradient-to-t after:from-card after:to-transparent">
        <div className="border-b px-5 py-3.5">
            <p className="text-xs text-muted-foreground">Capstone app · In progress</p>
            <p className="mt-0.5 font-semibold">{demoFocusTask.title}</p>
        </div>
        <div className="space-y-6 px-5 py-5">
            <TaskAttachments taskId={demoFocusTask._id} standalone />
            <TaskComments taskId={demoFocusTask._id} standalone />
        </div>
    </AppFrame>
);

const extras = [
    { icon: Layers, title: "Several boards per project", description: "One for each sprint, module or stage of the work." },
    { icon: CalendarDays, title: "Calendar and My list", description: "See a project's tasks by date, or only the ones assigned to you." },
    { icon: Search, title: "Search with Ctrl K", description: "Jump to any project or task from anywhere in the app." },
    { icon: Radio, title: "Live updates", description: "Board changes and who's online appear without refreshing." },
    { icon: MessagesSquare, title: "Discord updates", description: "Post new tasks, finished work and new notes to your team's channel." },
    { icon: KeyRound, title: "Sign in your way", description: "Use a username and password, or your GitHub account." },
];

const FeatureSections = () => (
    <section id="features" aria-labelledby="features-heading" className="relative border-t border-white/[0.07]">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-10 lg:py-28">
            <div className="max-w-2xl">
                <h2 id="features-heading" className="text-3xl font-semibold tracking-[-0.035em] text-white sm:text-4xl">
                    What you can do in FocusFlow
                </h2>
                <p className="mt-4 text-base leading-7 text-blue-100/65">
                    Boards, a personal agenda, notes and task conversations, kept together in each project. Every picture below is the real app with sample data.
                </p>
            </div>

            <DemoProviders>
                <div className="mt-16 space-y-24 lg:mt-20 lg:space-y-32">
                    <Feature
                        title="Plan the work on a board"
                        description="Name your own columns and drag tasks through them. Each task can have an owner, a priority, a due date and tags."
                        points={[
                            "Drag and drop tasks and columns",
                            "Break a task into a checklist; the card shows how far along it is",
                            "Overdue and due-today dates stand out on the card",
                        ]}
                        visual={<BoardVisual />}
                    />
                    <Feature
                        flip
                        title="See what needs you today"
                        description="My work gathers the tasks assigned to you from every project. Inside a project, the same agenda stays docked beside the board."
                        points={[
                            "Overdue, today and the next 7 days, with exact times",
                            "A week strip and month calendar of what's due",
                            "Open any task straight from the agenda",
                        ]}
                        visual={<AgendaVisual />}
                    />
                    <Feature
                        title="Keep notes next to the tasks"
                        description="Write project notes with headings, checklists, code and images. Type # to link a task, so the note and the work point at each other."
                        points={[
                            "Pin the notes your team needs most",
                            "Every save keeps a version you can compare",
                            "Restore an older version in one click",
                        ]}
                        visual={<NotesVisual />}
                    />
                    <Feature
                        flip
                        title="Talk it through on the task"
                        description="Each task has its own thread for comments and files, with its history alongside: who moved it, who ticked off what."
                        points={[
                            "Rich-text comments that you can edit or delete",
                            "Attach PDFs, images, Word and text files up to 5 MB",
                            "A project activity log, and owner, admin and member roles",
                        ]}
                        visual={<TeamVisual />}
                    />
                </div>
            </DemoProviders>

            <div className="mt-24 border-t border-white/[0.07] pt-12 lg:mt-32">
                <h3 className="text-lg font-semibold text-white">Also included</h3>
                <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {extras.map(({ icon: Icon, title, description }) => (
                        <li key={title} className="flex gap-3.5">
                            <Icon className="mt-0.5 size-5 shrink-0 text-blue-300" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-semibold text-blue-50">{title}</p>
                                <p className="mt-1 text-sm leading-6 text-blue-100/65">{description}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </section>
);

export default FeatureSections;
