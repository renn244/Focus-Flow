import { useEffect, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { CalendarCheck2, LayoutGrid, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useMyTasks } from "@/features/projectWorkSpace/hooks/Task/useMyTasks";
import { projectDotClass, useNavProjects } from "@/features/projects/hooks/useNavProjects";
import { useShellStore } from "./shellStore";
import { useOpenTask } from "./useOpenTask";

const groupHeading = "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground";
const item = "gap-3 rounded-md px-2.5 py-2 data-[selected=true]:bg-accent";

const CommandPalette = () => {
    const open = useShellStore((state) => state.commandOpen);
    const setOpen = useShellStore((state) => state.setCommandOpen);
    const navigate = useNavigate();
    const openTask = useOpenTask();
    const { data: projects = [] } = useNavProjects();
    const { data: tasks = [] } = useMyTasks();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                setOpen(!useShellStore.getState().commandOpen);
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [setOpen]);

    const projectById = useMemo(() => new Map(projects.map((project) => [project._id, project])), [projects]);

    const run = (action: () => void) => {
        setOpen(false);
        action();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent showCloseButton={false} className="top-[18%] translate-y-0 gap-0 overflow-hidden p-0 sm:max-w-xl">
                <DialogTitle className="sr-only">Search FocusFlow</DialogTitle>
                <DialogDescription className="sr-only">Jump to a project or one of your tasks.</DialogDescription>
                <Command loop className={cn("rounded-lg", groupHeading)}>
                    <CommandInput placeholder="Search projects and your tasks…" className="h-12 text-base sm:text-sm" />
                    <CommandList className="max-h-[min(60svh,26rem)] p-1.5">
                        <CommandEmpty className="px-4 py-8 text-center text-sm text-muted-foreground">No projects or tasks match.</CommandEmpty>
                        <CommandGroup heading="Go to">
                            <CommandItem value="My work agenda overview" className={item} onSelect={() => run(() => navigate({ to: "/projects" }))}>
                                <CalendarCheck2 className="text-muted-foreground" /> My work
                            </CommandItem>
                            <CommandItem value="All projects" className={item} onSelect={() => run(() => navigate({ to: "/projects/all" }))}>
                                <LayoutGrid className="text-muted-foreground" /> All projects
                            </CommandItem>
                            <CommandItem value="Settings profile password" className={item} onSelect={() => run(() => navigate({ to: "/settings" }))}>
                                <Settings className="text-muted-foreground" /> Settings
                            </CommandItem>
                        </CommandGroup>
                        {projects.length > 0 && (
                            <CommandGroup heading="Projects">
                                {projects.map((project) => (
                                    <CommandItem
                                        key={project._id}
                                        value={`project ${project.name} ${project._id}`}
                                        className={item}
                                        onSelect={() => run(() => navigate({ to: "/projects/$projectId", params: { projectId: project._id } }))}
                                    >
                                        <span aria-hidden="true" className={cn("ml-1 size-2.5 shrink-0 rounded-[3px]", projectDotClass(project.color))} />
                                        <span className="truncate">{project.name}</span>
                                        <span className="ml-auto shrink-0 text-xs text-muted-foreground tabular-nums">{project.openTasks} open</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        )}
                        {tasks.length > 0 && (
                            <CommandGroup heading="My tasks">
                                {tasks.map((task) => {
                                    const project = projectById.get(task.board.projectId);
                                    return (
                                        <CommandItem key={task._id} value={`task ${task.title} ${project?.name ?? ""} ${task._id}`} className={item} onSelect={() => run(() => openTask(task))}>
                                            <span aria-hidden="true" className={cn("ml-1 size-2.5 shrink-0 rounded-[3px]", projectDotClass(project?.color))} />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate">{task.title}</span>
                                                <span className="block truncate text-xs text-muted-foreground">{project?.name ?? task.board.name} · {task.column.title}</span>
                                            </span>
                                            {task.dueDate && <time dateTime={task.dueDate} className="shrink-0 text-xs text-muted-foreground tabular-nums">{format(new Date(task.dueDate), "MMM d")}</time>}
                                        </CommandItem>
                                    );
                                })}
                            </CommandGroup>
                        )}
                    </CommandList>
                    <div className="flex items-center justify-between border-t px-4 py-2.5 text-xs text-muted-foreground">
                        <span><kbd className="font-sans font-medium text-foreground">↑ ↓</kbd> to move, <kbd className="font-sans font-medium text-foreground">Enter</kbd> to open</span>
                        <span><kbd className="font-sans font-medium text-foreground">Esc</kbd> to close</span>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
};

export default CommandPalette;
