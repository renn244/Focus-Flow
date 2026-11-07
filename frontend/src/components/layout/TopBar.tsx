import { useMemo } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck2, ChevronDown, LayoutGrid, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/context/authContext";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { projectDotClass, useNavProjects } from "@/features/projects/hooks/useNavProjects";
import type { ProjectWithOwner } from "@/features/projects/type";
import Brand from "../common/Brand";
import UserDropDown from "../common/Nav/UserDropDown";
import { useShellStore } from "./shellStore";

const tabClass =
    "relative flex h-full min-w-0 shrink-0 items-center gap-2 px-3 text-sm font-medium text-shell-muted transition-colors hover:text-shell-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-transparent data-[status=active]:text-shell-foreground data-[status=active]:after:bg-shell-accent";

const ProjectDot = ({ color }: { color?: string }) => (
    <span aria-hidden="true" className={cn("size-2 shrink-0 rounded-[3px]", projectDotClass(color))} />
);

/** Keeps the open project visible in the tab row even when it would overflow. */
const orderForTabs = (projects: ProjectWithOwner[], currentId: string | null, visible: number) => {
    const index = projects.findIndex((project) => project._id === currentId);
    if (index < visible) return projects;
    const reordered = [...projects];
    const [current] = reordered.splice(index, 1);
    reordered.splice(visible - 1, 0, current);
    return reordered;
};

const OverflowMenu = ({ projects, className }: { projects: ProjectWithOwner[]; className?: string }) => {
    if (projects.length === 0) return null;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger className={cn(tabClass, "data-[state=open]:text-shell-foreground", className)}>
                +{projects.length} more <ChevronDown className="size-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
                {projects.map((project) => (
                    <DropdownMenuItem key={project._id} asChild>
                        <Link to="/projects/$projectId" params={{ projectId: project._id }}>
                            <ProjectDot color={project.color} />
                            <span className="truncate">{project.name}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const MobilePicker = ({ projects, currentId }: { projects: ProjectWithOwner[]; currentId: string | null }) => {
    const pathname = useRouterState({ select: (state) => state.location.pathname });
    const current = projects.find((project) => project._id === currentId);
    const label = current?.name ?? (pathname === "/projects/all" ? "All projects" : pathname === "/settings" ? "Settings" : "My work");

    return (
        <DropdownMenu>
            <DropdownMenuTrigger className="flex h-9 min-w-0 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-shell-foreground hover:bg-shell-hover focus-visible:outline-2 data-[state=open]:bg-shell-hover">
                {current && <ProjectDot color={current.color} />}
                <span className="truncate">{label}</span>
                <ChevronDown className="size-4 shrink-0 text-shell-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[min(18rem,calc(100vw-2rem))]">
                <DropdownMenuItem asChild>
                    <Link to="/projects" activeOptions={{ exact: true }}><CalendarCheck2 /> My work</Link>
                </DropdownMenuItem>
                {projects.length > 0 && <DropdownMenuSeparator />}
                {projects.map((project) => (
                    <DropdownMenuItem key={project._id} asChild>
                        <Link to="/projects/$projectId" params={{ projectId: project._id }}>
                            <ProjectDot color={project.color} />
                            <span className="truncate">{project.name}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link to="/projects/all"><LayoutGrid /> All projects</Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

const TopBar = ({ projectId = null }: { projectId?: string | null }) => {
    const { user } = useAuthContext();
    const { data: projects = [] } = useNavProjects();
    const setCommandOpen = useShellStore((state) => state.setCommandOpen);

    // One order for both breakpoints: the open project always lands in the first three.
    const tabs = useMemo(() => orderForTabs(projects, projectId, 3), [projects, projectId]);

    return (
        <header className="sticky top-0 z-40 border-b border-shell-border bg-shell text-shell-text">
            <div className="flex h-14 items-center gap-1 px-3 sm:px-4">
                <Link to="/projects" aria-label="FocusFlow, my work" className="mr-2 shrink-0 rounded-lg text-shell-foreground focus-visible:outline-2 focus-visible:outline-offset-4 lg:mr-4">
                    <Brand className="[&>span:last-child]:hidden sm:[&>span:last-child]:inline" />
                </Link>

                <div className="min-w-0 md:hidden">
                    <MobilePicker projects={projects} currentId={projectId} />
                </div>

                <nav aria-label="Projects" className="hidden h-14 min-w-0 flex-1 items-stretch overflow-hidden md:flex">
                    <Link to="/projects" activeOptions={{ exact: true }} className={tabClass} activeProps={{ "aria-current": "page" }}>
                        My work
                    </Link>
                    <span aria-hidden="true" className="mx-1 my-4 w-px bg-shell-border" />
                    {tabs.slice(0, 5).map((project, index) => (
                        <Link
                            key={project._id}
                            to="/projects/$projectId"
                            params={{ projectId: project._id }}
                            title={project.name}
                            className={cn(tabClass, index === 3 && "hidden xl:flex", index === 4 && "hidden 2xl:flex")}
                            activeProps={{ "aria-current": "page" }}
                        >
                            <ProjectDot color={project.color} />
                            <span className="max-w-[10rem] truncate">{project.name}</span>
                        </Link>
                    ))}
                    <OverflowMenu projects={tabs.slice(3)} className="flex xl:hidden" />
                    <OverflowMenu projects={tabs.slice(4)} className="hidden xl:flex 2xl:hidden" />
                    <OverflowMenu projects={tabs.slice(5)} className="hidden 2xl:flex" />
                    <Link to="/projects/all" title="All projects" className={tabClass} activeProps={{ "aria-current": "page" }}>
                        <LayoutGrid className="size-4" />
                        <span className="sr-only">All projects</span>
                    </Link>
                </nav>

                <div className="ml-auto flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setCommandOpen(true)}
                        className="flex h-9 items-center gap-2 rounded-lg border border-shell-border px-2.5 text-sm text-shell-muted transition-colors hover:border-white/25 hover:text-shell-foreground focus-visible:outline-2 sm:w-44 xl:w-56"
                    >
                        <Search className="size-4 shrink-0" />
                        <span className="hidden sm:inline">Search</span>
                        <kbd className="ml-auto hidden rounded border border-shell-border px-1.5 py-0.5 font-sans text-[11px] leading-none sm:inline">Ctrl K</kbd>
                        <span className="sr-only sm:hidden">Search projects and tasks</span>
                    </button>
                    <UserDropDown
                        userEmail={user?.email || ""}
                        userName={user?.displayName || user?.username || ""}
                        avatarUrl={user?.avatarUrl || ""}
                    />
                </div>
            </div>
        </header>
    );
};

export default TopBar;
