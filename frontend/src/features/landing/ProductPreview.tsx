import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DndContext } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { PanelLeftClose, Plus } from "lucide-react";
import AgendaPanel from "@/components/layout/AgendaPanel";
import TopBar from "@/components/layout/TopBar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AuthContext } from "@/context/authContext";
import { cn } from "@/lib/utils";
import ProjectActivityDialog from "@/features/projectWorkSpace/components/Activity/ProjectActivityDialog";
import SwitchBoard from "@/features/projectWorkSpace/components/Board/SwitchBoard";
import ColumnCard from "@/features/projectWorkSpace/components/Column/ColumnCard";
import WorkspaceHeader, { workspaceViews } from "@/features/projectWorkSpace/components/WorkspaceHeader";
import { MyWorkView } from "@/pages/projects/ProjectsDashboard";
import { demoAuth, demoBoard, demoColumns, demoMembers, demoMyTasks, demoProject, demoProjects } from "./demoData";
import { ease } from "./motion";

/** The width the app is laid out at before the preview scales it down. */
const STAGE_WIDTH = 1440;
const STAGE_HEIGHT = 820;
/** Below this the preview shows the app's own narrow layout instead of a scaled desktop. */
const SCALE_FROM = 880;
const NARROW_HEIGHT = 600;

type Scene = "board" | "mywork";

const scenes: { id: Scene; label: string }[] = [
    { id: "board", label: "Project board" },
    { id: "mywork", label: "My work" },
];

const noop = () => undefined;

const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/**
 * A query cache that already holds the sample workspace and never fetches,
 * so the real components render sample data without touching the API.
 */
const createDemoClient = () => {
    const client = new QueryClient({
        defaultOptions: {
            queries: { enabled: false, staleTime: Infinity, gcTime: Infinity, retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
        },
    });
    client.setQueryData(["tasks", "mine"], demoMyTasks);
    client.setQueryData(["allProjects", "active", "all"], demoProjects);
    return client;
};

const DemoProviders = ({ children }: { children: ReactNode }) => {
    const [client] = useState(createDemoClient);
    return (
        <QueryClientProvider client={client}>
            <AuthContext.Provider value={demoAuth}>{children}</AuthContext.Provider>
        </QueryClientProvider>
    );
};

const laneList = {
    hidden: {},
    shown: { transition: { staggerChildren: 0.07, delayChildren: 0.45 } },
};

const lane = {
    hidden: { opacity: 0, y: 14 },
    shown: { opacity: 1, y: 0, transition: { duration: 0.5, ease } },
};

const BoardScene = () => (
    <div className="flex h-full flex-col bg-background">
        <TopBar projectId={demoProject._id} />
        <div className="flex min-h-0 flex-1">
            <aside aria-label="My agenda" className="hidden w-[340px] shrink-0 border-r border-shell-border bg-shell-raised lg:block">
                <AgendaPanel
                    action={
                        <span className="inline-flex size-8 items-center justify-center rounded-md text-shell-muted">
                            <PanelLeftClose className="size-4" />
                        </span>
                    }
                />
            </aside>
            <main className="min-w-0 flex-1 overflow-hidden">
                <WorkspaceHeader
                    name={demoProject.name}
                    color={demoProject.color}
                    views={workspaceViews}
                    activeView="board"
                    onSelectView={noop}
                    onOpenAgenda={noop}
                    actions={
                        <>
                            <div className="hidden -space-x-1 sm:flex">
                                {demoMembers.map((member) => (
                                    <Avatar key={member._id} className="ring-2 ring-card">
                                        <AvatarFallback className="select-none bg-slate-200 text-xs font-semibold text-slate-700">{initials(member.displayName)}</AvatarFallback>
                                    </Avatar>
                                ))}
                            </div>
                            <ProjectActivityDialog />
                        </>
                    }
                />
                <div className="app-content">
                    <div className="mb-5 flex flex-wrap items-center gap-x-3 gap-y-2">
                        <div className="flex min-w-0 flex-1 items-center gap-1">
                            <div className="-ml-2 min-w-0">
                                <SwitchBoard boards={[demoBoard]} currentName={demoBoard.name} onCreate={noop} />
                            </div>
                            <p className="ml-2 hidden min-w-0 truncate text-sm text-muted-foreground md:block">{demoBoard.description}</p>
                        </div>
                        <Button><Plus />New task</Button>
                    </div>
                    <DndContext>
                        <motion.div
                            variants={laneList}
                            initial="hidden"
                            animate="shown"
                            className="grid grid-cols-1 items-start gap-4 pb-3 sm:grid-cols-2 lg:auto-cols-[minmax(15rem,1fr)] lg:grid-flow-col lg:grid-cols-none"
                        >
                            {demoColumns.map((column) => (
                                <motion.div key={column._id} variants={lane} className="min-w-0">
                                    <ColumnCard column={column} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </DndContext>
                </div>
            </main>
        </div>
    </div>
);

const MyWorkScene = () => (
    <div className="flex h-full flex-col bg-background">
        <TopBar />
        <main className="min-h-0 flex-1 overflow-hidden">
            <MyWorkView />
        </main>
    </div>
);

/** Lays the app out at desktop width and scales it to fit, or shows the narrow layout on phones. */
const Stage = ({ children }: { children: ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [width, setWidth] = useState(0);

    useLayoutEffect(() => {
        const element = ref.current;
        if (!element) return;
        const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    const scaled = width >= SCALE_FROM;
    const scale = scaled ? width / STAGE_WIDTH : 1;

    return (
        <div ref={ref} className="relative overflow-hidden rounded-[10px]" style={{ height: scaled ? STAGE_HEIGHT * scale : NARROW_HEIGHT }}>
            {width > 0 && (
                <div
                    className="absolute left-0 top-0 origin-top-left overflow-hidden text-left text-foreground"
                    style={scaled ? { width: STAGE_WIDTH, height: STAGE_HEIGHT, transform: `scale(${scale})` } : { width: "100%", height: NARROW_HEIGHT }}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

const ProductPreview = () => {
    const [scene, setScene] = useState<Scene>("board");

    return (
        <motion.div
            className="relative mx-auto mt-12 max-w-6xl sm:mt-16"
            initial={{ opacity: 0, y: 28, clipPath: "inset(0% 0% 18% 0% round 16px)" }}
            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0% round 16px)" }}
            transition={{ duration: 0.8, delay: 0.25, ease }}
        >
            <div role="group" aria-label="Preview" className="mx-auto mb-4 flex w-fit gap-1 rounded-lg border border-blue-300/15 bg-white/[0.04] p-1">
                {scenes.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        aria-pressed={scene === item.id}
                        onClick={() => setScene(item.id)}
                        className={cn(
                            "relative h-8 rounded-md px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200",
                            scene === item.id ? "text-white" : "text-blue-100/65 hover:text-white"
                        )}
                    >
                        {scene === item.id && (
                            <motion.span layoutId="preview-scene" className="absolute inset-0 rounded-md bg-blue-600" transition={{ duration: 0.3, ease }} />
                        )}
                        <span className="relative">{item.label}</span>
                    </button>
                ))}
            </div>

            <figure className="overflow-hidden rounded-2xl border border-blue-300/15 bg-[#0b1630] p-1.5 shadow-[0_32px_90px_rgba(0,0,0,0.42)] sm:p-2">
                <DemoProviders>
                    {/* A picture of the app, not a second copy of it: nothing inside can be focused or clicked. */}
                    <div inert className="select-none">
                        <Stage>
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={scene}
                                    className="h-full"
                                    initial={{ opacity: 0, filter: "blur(6px)" }}
                                    animate={{ opacity: 1, filter: "blur(0px)" }}
                                    exit={{ opacity: 0, filter: "blur(6px)", transition: { duration: 0.18 } }}
                                    transition={{ duration: 0.35, ease }}
                                >
                                    {scene === "board" ? <BoardScene /> : <MyWorkScene />}
                                </motion.div>
                            </AnimatePresence>
                        </Stage>
                    </div>
                </DemoProviders>
                <figcaption className="px-2 pb-0.5 pt-2.5 text-xs text-blue-200/55">
                    The FocusFlow interface, filled with sample data.
                </figcaption>
            </figure>
        </motion.div>
    );
};

export default ProductPreview;
