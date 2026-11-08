import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { JSONContent } from "@tiptap/core";
import { differenceInCalendarDays, format, formatDistanceToNowStrict, isToday } from "date-fns";
import { ChevronLeft, FileText, History, Pin, PinOff, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthContext } from "@/context/authContext";
import { cn } from "@/lib/utils";
import { useCreateNote, useDeleteNote, useNote, useNotes, useUpdateNote, uploadNoteImage } from "../../hooks/Note/useNotes";
import { useGetTasksByProject } from "../../hooks/Task/useGetTasksByProject";
import useTaskDialogStore from "../../store/useTaskDialog";
import useWorkspaceViewStore from "../../store/useWorkspaceView";
import type { TaskWithBoardAndColumn } from "../../type";
import type { Note, NoteSummary, NoteUpdatePayload, NoteUser } from "../../types/note";
import NoteEditor from "./NoteEditor";
import NoteHistory from "./NoteHistory";

const SAVE_DELAY_MS = 800;

const userName = (user: NoteUser, meId?: string) => (user._id === meId ? "You" : user.displayName || user.username);

const editedAgo = (iso: string) => {
  const date = new Date(iso);
  if (Date.now() - date.getTime() < 60_000) return "just now";
  if (differenceInCalendarDays(new Date(), date) < 7) return `${formatDistanceToNowStrict(date)} ago`;
  return format(date, "MMM d");
};

const ProjectNotes = ({ projectId }: { projectId: string }) => {
  const { user } = useAuthContext();
  const { data: notes, isLoading } = useNotes(projectId);
  const { data: tasks = [] } = useGetTasksByProject(projectId);
  const selectedNoteId = useWorkspaceViewStore((state) => state.selectedNoteId);
  const setSelectedNoteId = useWorkspaceViewStore((state) => state.setSelectedNoteId);
  const createNote = useCreateNote(projectId);
  const [query, setQuery] = useState("");
  // On narrow screens the list and the open note are two screens.
  const [showListOnMobile, setShowListOnMobile] = useState(!selectedNoteId);
  const [focusTitleOf, setFocusTitleOf] = useState<string | null>(null);
  // The note whose version history fills the Notes area, if any.
  const [historyOf, setHistoryOf] = useState<string | null>(null);
  const historyNote = useNote(historyOf);
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
  const mentionable = useMemo(
    () => tasks.map((task) => ({ id: task._id, title: task.title, meta: `${task.column.title} · ${task.board.name}` })),
    [tasks]
  );

  // Keep a valid note open: the requested one if it belongs to this project, else the first.
  useEffect(() => {
    if (!notes) return;
    if (selectedNoteId && notes.some((note) => note._id === selectedNoteId)) return;
    setSelectedNoteId(notes[0]?._id ?? null);
  }, [notes, selectedNoteId, setSelectedNoteId]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notes ?? [];
    return (notes ?? []).filter((note) => `${note.title} ${note.excerpt}`.toLowerCase().includes(needle));
  }, [notes, query]);

  const pinned = filtered.filter((note) => note.pinned);
  const others = filtered.filter((note) => !note.pinned);

  const open = (noteId: string) => {
    setSelectedNoteId(noteId);
    setShowListOnMobile(false);
  };

  const create = () =>
    createNote.mutate("Untitled note", {
      onSuccess: (note) => {
        setQuery("");
        open(note._id);
        setFocusTitleOf(note._id);
      },
      onError: (error) => toast.error(error.message),
    });

  if (isLoading) return <NotesSkeleton />;

  if (!notes || notes.length === 0) {
    return (
      <div className="app-content">
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center rounded-xl border border-dashed bg-card px-6 py-12 text-center">
          <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-4 text-lg font-semibold">No notes yet</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Keep meeting notes, project docs, research and class info next to the board. Type # in a note to link a task.
          </p>
          <Button className="mt-6" onClick={create} disabled={createNote.isPending}>
            <Plus /> New note
          </Button>
        </div>
      </div>
    );
  }

  if (historyOf && historyNote.data) {
    return (
      <div className="@container">
        <NoteHistory
          note={historyNote.data}
          projectId={projectId}
          meId={user?._id}
          tasks={mentionable}
          onOpenTask={setViewTaskId}
          onClose={() => setHistoryOf(null)}
        />
      </div>
    );
  }

  return (
    <div className="@container">
      <div className="flex min-h-[calc(100svh-10rem)]">
        <nav
          aria-label="Notes"
          className={cn(
            "w-full shrink-0 bg-lane px-3 py-4 @2xl:sticky @2xl:top-14 @2xl:block @2xl:h-[calc(100svh-3.5rem)] @2xl:w-60 @2xl:overflow-y-auto",
            !showListOnMobile && "hidden"
          )}
        >
          <div className="flex items-center justify-between px-2 pb-3">
            <h2 className="text-sm font-semibold">
              Notes <span className="font-medium text-muted-foreground tabular-nums">{notes.length}</span>
            </h2>
            <Button size="sm" className="h-8 px-2.5" onClick={create} disabled={createNote.isPending}>
              <Plus /> New
            </Button>
          </div>
          <label className="mb-2 flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-2.5 text-sm focus-within:outline-2 focus-within:outline-shell-accent">
            <Search className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Search notes</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search notes"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </label>
          {filtered.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No notes match “{query.trim()}”.</p>}
          {pinned.length > 0 && <NoteGroup label="Pinned" notes={pinned} selectedId={selectedNoteId} meId={user?._id} onOpen={open} />}
          {others.length > 0 && (
            <NoteGroup label={pinned.length > 0 ? "All notes" : undefined} notes={others} selectedId={selectedNoteId} meId={user?._id} onOpen={open} />
          )}
        </nav>

        <div className={cn("min-w-0 flex-1 bg-card", showListOnMobile && "hidden @2xl:block")}>
          {selectedNoteId ? (
            <NoteDocument
              key={selectedNoteId}
              noteId={selectedNoteId}
              projectId={projectId}
              tasks={tasks}
              meId={user?._id}
              autoFocusTitle={focusTitleOf === selectedNoteId}
              onBack={() => setShowListOnMobile(true)}
              onOpenHistory={() => setHistoryOf(selectedNoteId)}
              onDeleted={() => {
                setSelectedNoteId(null);
                setShowListOnMobile(true);
              }}
            />
          ) : (
            <p className="p-8 text-sm text-muted-foreground">Pick a note from the list.</p>
          )}
        </div>
      </div>
    </div>
  );
};

type NoteGroupProps = {
  label?: string;
  notes: NoteSummary[];
  selectedId: string | null;
  meId?: string;
  onOpen: (noteId: string) => void;
};

const NoteGroup = ({ label, notes, selectedId, meId, onOpen }: NoteGroupProps) => (
  <div className="mt-2">
    {label && <h3 className="px-2 pb-1 pt-2 text-xs font-semibold text-muted-foreground">{label}</h3>}
    <ul className="space-y-0.5">
      {notes.map((note) => {
        const selected = note._id === selectedId;
        return (
          <li key={note._id}>
            <button
              type="button"
              aria-current={selected ? "page" : undefined}
              onClick={() => onOpen(note._id)}
              className={cn(
                "w-full rounded-md px-2.5 py-2 text-left transition-colors focus-visible:outline-2",
                selected ? "bg-card shadow-[0_1px_2px_rgb(15_23_42/0.06)]" : "hover:bg-card/60"
              )}
            >
              <span className={cn("block truncate text-sm", selected ? "font-semibold" : "font-medium")}>{note.title}</span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground tabular-nums">
                {userName(note.updatedBy, meId)} · {editedAgo(note.updatedAt)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  </div>
);

type NoteDocumentProps = {
  noteId: string;
  projectId: string;
  tasks: TaskWithBoardAndColumn[];
  meId?: string;
  autoFocusTitle: boolean;
  onBack: () => void;
  onDeleted: () => void;
  onOpenHistory: () => void;
};

type SaveState = "idle" | "pending" | "saving" | "saved" | "error";

const NoteDocument = ({ noteId, projectId, tasks, meId, autoFocusTitle, onBack, onDeleted, onOpenHistory }: NoteDocumentProps) => {
  const { data: note, isLoading, isError } = useNote(noteId);
  const updateNote = useUpdateNote(projectId);
  const deleteNote = useDeleteNote(projectId);
  const pinNote = useUpdateNote(projectId);
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
  const [title, setTitle] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pending = useRef<NoteUpdatePayload>({});
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const titleRef = useRef<HTMLTextAreaElement>(null);

  const flush = useCallback(() => {
    clearTimeout(timer.current);
    const payload = pending.current;
    if (Object.keys(payload).length === 0) return;
    pending.current = {};
    setSaveState("saving");
    updateNote.mutate(
      { noteId, payload },
      {
        onSuccess: () => setSaveState(Object.keys(pending.current).length ? "pending" : "saved"),
        onError: () => {
          // Put the failed changes back so the next edit or retry sends them.
          pending.current = { ...payload, ...pending.current };
          setSaveState("error");
        },
      }
    );
  }, [noteId, updateNote]);

  const queue = useCallback(
    (change: NoteUpdatePayload) => {
      pending.current = { ...pending.current, ...change };
      setSaveState("pending");
      clearTimeout(timer.current);
      timer.current = setTimeout(flush, SAVE_DELAY_MS);
    },
    [flush]
  );

  // Save whatever is left when switching notes or leaving the tab, and warn before closing the page.
  const flushRef = useRef(flush);
  flushRef.current = flush;
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (Object.keys(pending.current).length) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      flushRef.current();
    };
  }, []);

  // A brand-new note starts with its title selected, once.
  const focusedTitle = useRef(false);
  useEffect(() => {
    if (autoFocusTitle && note && !focusedTitle.current) {
      focusedTitle.current = true;
      titleRef.current?.focus();
      titleRef.current?.select();
    }
  }, [autoFocusTitle, note]);

  // Grow the title field with its text.
  useEffect(() => {
    const field = titleRef.current;
    if (!field) return;
    field.style.height = "auto";
    field.style.height = `${field.scrollHeight}px`;
  }, [title, note]);

  const onContentChange = useCallback(
    (content: JSONContent, contentText: string) => queue({ content, contentText }),
    [queue]
  );

  const tasksById = useMemo(() => new Map(tasks.map((task) => [task._id, task])), [tasks]);
  const mentionable = useMemo(
    () => tasks.map((task) => ({ id: task._id, title: task.title, meta: `${task.column.title} · ${task.board.name}` })),
    [tasks]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[680px] space-y-4 px-6 py-8">
        <Skeleton className="h-9 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    );
  }

  if (isError || !note) {
    return <p className="p-8 text-sm text-muted-foreground">This note could not be loaded. It may have been deleted.</p>;
  }

  const shownTitle = title ?? note.title;
  const linkedTasks = note.taskIds.map((id) => tasksById.get(id)).filter((task): task is TaskWithBoardAndColumn => Boolean(task));

  const togglePin = () =>
    pinNote.mutate(
      { noteId, payload: { pinned: !note.pinned } },
      { onError: (error) => toast.error(error.message) }
    );

  const remove = () =>
    deleteNote.mutate(noteId, {
      onSuccess: () => {
        pending.current = {};
        setConfirmDelete(false);
        toast.success("Note deleted");
        onDeleted();
      },
      onError: (error) => toast.error(error.message),
    });

  // Save anything still being typed first, so the history's "current version" is up to date.
  const openHistory = () => {
    flush();
    onOpenHistory();
  };

  const details = (
    <NoteDetails
      onOpenHistory={openHistory}
      note={note}
      linkedTasks={linkedTasks}
      meId={meId}
      onOpenTask={setViewTaskId}
      onTogglePin={togglePin}
      onDelete={() => setConfirmDelete(true)}
      pinBusy={pinNote.isPending}
    />
  );

  return (
    <div className="flex">
      <article className="min-w-0 flex-1 px-4 pb-10 pt-5 sm:pl-12 sm:pr-8 @5xl:px-12">
        <div className="mx-auto max-w-[680px]">
          <div className="mb-3 flex items-center justify-between gap-3 @2xl:hidden">
            <Button variant="ghost" size="sm" className="-ml-2 h-8 px-2" onClick={onBack}>
              <ChevronLeft /> All notes
            </Button>
          </div>

          <label className="sr-only" htmlFor={`note-title-${noteId}`}>Note title</label>
          <textarea
            id={`note-title-${noteId}`}
            ref={titleRef}
            rows={1}
            value={shownTitle}
            maxLength={160}
            onChange={(event) => {
              const next = event.target.value.replace(/\n/g, " ");
              setTitle(next);
              if (next.trim()) queue({ title: next.trim() });
            }}
            onBlur={() => {
              if (!shownTitle.trim()) setTitle(note.title);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                (document.querySelector(".ProseMirror") as HTMLElement | null)?.focus();
              }
            }}
            placeholder="Untitled note"
            className="block w-full resize-none overflow-hidden bg-transparent text-[26px] font-semibold leading-tight tracking-[-0.025em] outline-none placeholder:text-muted-foreground sm:text-3xl"
          />
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="tabular-nums">
              Last edited by {userName(note.updatedBy, meId)}, {editedAgo(note.updatedAt)}
            </span>
            <span className="tabular-nums @5xl:hidden">
              Created by {userName(note.createdBy, meId)}, {format(new Date(note.createdAt), "MMM d")}
            </span>
            <SaveIndicator state={saveState} onRetry={flush} />
            <span className="ml-auto flex items-center gap-0.5 @5xl:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={openHistory}
                aria-label="Version history"
                title="Version history"
              >
                <History />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-muted-foreground"
                onClick={togglePin}
                disabled={pinNote.isPending}
                aria-pressed={note.pinned}
                aria-label={note.pinned ? "Unpin note" : "Pin note"}
                title={note.pinned ? "Unpin" : "Pin"}
              >
                {note.pinned ? <PinOff /> : <Pin />}
              </Button>
              {note.canDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground hover:bg-red-50 hover:text-red-700"
                  onClick={() => setConfirmDelete(true)}
                  aria-label="Delete note"
                  title="Delete"
                >
                  <Trash2 />
                </Button>
              )}
            </span>
          </div>

          {linkedTasks.length > 0 && (
            <div className="mt-4 @5xl:hidden">
              <LinkedTaskList linkedTasks={linkedTasks} meId={meId} onOpenTask={setViewTaskId} />
            </div>
          )}

          <div className="mt-4">
            <NoteEditor
              initialContent={note.content}
              tasks={mentionable}
              onChange={onContentChange}
              onOpenTask={setViewTaskId}
              onUploadImage={(file) => uploadNoteImage(noteId, file)}
            />
          </div>
        </div>
      </article>

      <aside
        aria-label="Note details"
        className="hidden w-72 shrink-0 border-l bg-card @5xl:block"
      >
        <div className="sticky top-14 max-h-[calc(100svh-3.5rem)] overflow-y-auto p-5">{details}</div>
      </aside>

      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete “{note.title}”?</DialogTitle>
            <DialogDescription>The note is removed for everyone in the project. This can’t be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button variant="destructive" onClick={remove} disabled={deleteNote.isPending}>Delete note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const SaveIndicator = ({ state, onRetry }: { state: SaveState; onRetry: () => void }) => {
  if (state === "error") {
    return (
      <span role="alert" className="text-red-700">
        Not saved.{" "}
        <button type="button" onClick={onRetry} className="font-medium underline underline-offset-2">Try again</button>
      </span>
    );
  }
  const label = state === "pending" || state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "";
  return <span aria-live="polite">{label}</span>;
};

type NoteDetailsProps = {
  note: Note;
  linkedTasks: TaskWithBoardAndColumn[];
  meId?: string;
  onOpenTask: (taskId: string) => void;
  onTogglePin: () => void;
  onDelete: () => void;
  onOpenHistory: () => void;
  pinBusy: boolean;
};

const NoteDetails = ({ note, linkedTasks, meId, onOpenTask, onTogglePin, onDelete, onOpenHistory, pinBusy }: NoteDetailsProps) => (
  <div className="space-y-5">
    <LinkedTaskList linkedTasks={linkedTasks} meId={meId} onOpenTask={onOpenTask} />

    <section className="border-t pt-4">
      <h3 className="text-sm font-semibold">Details</h3>
      <dl className="mt-2 grid grid-cols-[5.5rem_1fr] gap-y-1.5 text-[13px] tabular-nums">
        <dt className="text-muted-foreground">Created</dt>
        <dd>{userName(note.createdBy, meId)}, {format(new Date(note.createdAt), "MMM d")}</dd>
        <dt className="text-muted-foreground">Last edit</dt>
        <dd>{userName(note.updatedBy, meId)}, {editedAgo(note.updatedAt)}</dd>
      </dl>
      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={onOpenHistory}>
        <History /> Version history
      </Button>
      <div className="mt-2 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onTogglePin} disabled={pinBusy} aria-pressed={note.pinned}>
          {note.pinned ? <PinOff /> : <Pin />}
          {note.pinned ? "Unpin" : "Pin"}
        </Button>
        {note.canDelete && (
          <Button variant="outline" size="sm" className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800" onClick={onDelete}>
            <Trash2 /> Delete
          </Button>
        )}
      </div>
    </section>
  </div>
);

type LinkedTaskListProps = { linkedTasks: TaskWithBoardAndColumn[]; meId?: string; onOpenTask: (taskId: string) => void };

const LinkedTaskList = ({ linkedTasks, meId, onOpenTask }: LinkedTaskListProps) => (
  <section>
    <h3 className="text-sm font-semibold">
      Linked tasks <span className="font-medium text-muted-foreground tabular-nums">{linkedTasks.length}</span>
    </h3>
    {linkedTasks.length === 0 ? (
      <p className="mt-2 text-[13px] leading-5 text-muted-foreground">Type # in the note to link a task. Linked tasks show this note too.</p>
    ) : (
      <ul className="mt-2 grid gap-2 @2xl:grid-cols-2 @5xl:grid-cols-1">
        {linkedTasks.map((task) => (
          <li key={task._id}>
            <LinkedTask task={task} meId={meId} onOpen={() => onOpenTask(task._id)} />
          </li>
        ))}
      </ul>
    )}
  </section>
);

const LinkedTask = ({ task, meId, onOpen }: { task: TaskWithBoardAndColumn; meId?: string; onOpen: () => void }) => {
  const due = task.dueDate ? new Date(task.dueDate) : null;
  const overdue = due ? differenceInCalendarDays(due, new Date()) < 0 : false;
  const mine = task.assignee === meId || task.assigneeUser?._id === meId;
  const assigneeName = task.assigneeUser?.displayName || task.assigneeUser?.username;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full rounded-lg border bg-card px-3 py-2.5 text-left shadow-[0_1px_2px_rgb(15_23_42/0.06)] transition-shadow hover:border-slate-300 hover:shadow-[0_4px_12px_rgb(15_23_42/0.08)] focus-visible:outline-2"
    >
      <span className="line-clamp-2 text-sm font-medium">{task.title}</span>
      <span className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-muted-foreground tabular-nums">
        <span className="inline-flex items-center gap-1">
          <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: task.column.color }} />
          {task.column.title}
        </span>
        {due && (
          <>
            <span aria-hidden="true">·</span>
            <span className={cn(overdue && "font-medium text-red-700", isToday(due) && "font-semibold text-blue-700")}>
              {overdue ? `Overdue · ${format(due, "MMM d")}` : isToday(due) ? "Today" : format(due, "MMM d")}
            </span>
          </>
        )}
        {mine ? (
          <span className="ml-auto rounded-full bg-blue-50 px-1.5 font-medium text-blue-700">You</span>
        ) : assigneeName ? (
          <span className="ml-auto truncate">{assigneeName}</span>
        ) : null}
      </span>
    </button>
  );
};

const NotesSkeleton = () => (
  <div className="flex min-h-[calc(100svh-10rem)]">
    <div className="hidden w-60 space-y-2 bg-lane p-4 md:block">
      <Skeleton className="h-8 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
    <div className="flex-1 space-y-4 bg-card p-8">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="h-4 w-1/3" />
      <Skeleton className="mt-8 h-48 w-full max-w-2xl" />
    </div>
  </div>
);

export default ProjectNotes;
