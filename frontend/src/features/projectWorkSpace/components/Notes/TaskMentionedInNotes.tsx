import { useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import { NotebookText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useTaskNotes } from "../../hooks/Note/useNotes";
import { useProjectIdStore } from "../../store/useProjectId";
import useTaskDialogStore from "../../store/useTaskDialog";
import useWorkspaceViewStore from "../../store/useWorkspaceView";

/** The notes that link this task with a # mention; opening one jumps to the project's Notes tab. */
const TaskMentionedInNotes = ({ taskId, projectId: taskProjectId }: { taskId: string; projectId?: string }) => {
  const openProjectId = useProjectIdStore((state) => state.projectId);
  const projectId = taskProjectId ?? openProjectId;
  const { data: notes = [], isLoading } = useTaskNotes(taskId);
  const setViewTaskId = useTaskDialogStore((state) => state.setViewTaskId);
  const openNote = useWorkspaceViewStore((state) => state.openNote);
  const navigate = useNavigate();

  const open = (noteId: string) => {
    setViewTaskId(null);
    openNote(noteId);
    if (projectId && projectId !== openProjectId) navigate({ to: "/projects/$projectId", params: { projectId } });
  };

  return (
    <div>
      <Label className="text-sm font-medium text-muted-foreground">Mentioned in notes</Label>
      {isLoading ? (
        <p className="mt-1 text-sm text-muted-foreground">Loading…</p>
      ) : notes.length === 0 ? (
        <p className="mt-1 text-sm text-muted-foreground">Not mentioned in any note yet.</p>
      ) : (
        <ul className="mt-1 space-y-0.5">
          {notes.map((note) => (
            <li key={note._id}>
              <button
                type="button"
                onClick={() => open(note._id)}
                className="-mx-1.5 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm hover:bg-accent focus-visible:outline-2"
              >
                <NotebookText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate font-medium">{note.title}</span>
                <time dateTime={note.updatedAt} className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {format(new Date(note.updatedAt), "MMM d")}
                </time>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskMentionedInNotes;
