import { useMemo, useState } from "react";
import { History } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useNoteVersions, useRestoreNoteVersion } from "../../../hooks/Note/useNoteVersions";
import type { Note } from "../../../types/note";
import type { MentionableTask } from "../taskMention";
import HistoryToolbar from "./HistoryToolbar";
import { fullLabel, userName } from "./historyLabels";
import { CURRENT, useVersionComparison } from "./useVersionComparison";
import VersionList from "./VersionList";
import VersionPreview from "./VersionPreview";
import VersionSelect from "./VersionSelect";

type Props = {
  note: Note;
  projectId: string;
  meId?: string;
  tasks: MentionableTask[];
  onOpenTask: (taskId: string) => void;
  onClose: () => void;
};

/** Every kept version of a note, what each one changed, and a way to put one back. */
const NoteHistory = ({ note, projectId, meId, tasks, onOpenTask, onClose }: Props) => {
  const { data, isLoading, isError } = useNoteVersions(note._id);
  const restore = useRestoreNoteVersion(projectId, note._id);
  const [selected, setSelected] = useState<string>(CURRENT);
  const [showChanges, setShowChanges] = useState(true);

  const versions = useMemo(() => data?.versions ?? [], [data]);
  const comparison = useVersionComparison(note, versions, selected);
  const { isCurrent, picked } = comparison;

  const doRestore = () => {
    if (!picked) return;
    restore.mutate(picked._id, {
      onSuccess: () => {
        toast.success(`Restored the version from ${fullLabel(picked.savedAt)}`, {
          description: "The text it replaced is kept in History.",
        });
        onClose();
      },
      onError: (error) => toast.error(error.message),
    });
  };

  const caption = isCurrent
    ? `Current version · last edited by ${userName(note.updatedBy, meId)}, ${fullLabel(note.updatedAt)}`
    : picked
      ? `Saved ${fullLabel(picked.savedAt)} · edits by ${userName(picked.savedBy, meId)}`
      : "";

  return (
    <div className="flex min-h-[calc(100svh-10rem)] flex-col bg-lane">
      <HistoryToolbar
        noteTitle={note.title}
        showChanges={showChanges}
        onToggleChanges={() => setShowChanges((value) => !value)}
        canRestore={!isCurrent}
        restoreDisabled={restore.isPending || !picked}
        onRestore={doRestore}
        onBack={onClose}
      />

      {isLoading ? (
        <div className="space-y-3 p-6"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-40 w-full max-w-3xl" /></div>
      ) : isError ? (
        <p role="alert" className="p-6 text-sm text-destructive">The history could not be loaded.</p>
      ) : versions.length === 0 ? (
        <NoVersionsYet />
      ) : (
        <div className="flex flex-1 items-start">
          <div className="min-w-0 flex-1 p-3 sm:p-5">
            <VersionSelect versions={versions} currentBy={note.updatedBy} selected={selected} meId={meId} onSelect={setSelected} />
            <VersionPreview
              caption={caption}
              versionKey={selected}
              isCurrent={isCurrent}
              showChanges={showChanges}
              loading={comparison.isLoading}
              shown={comparison.shown}
              baseline={comparison.baseline}
              diff={comparison.diff}
              titleParts={comparison.titleParts}
              nothingChanged={comparison.nothingChanged}
              tasks={tasks}
              onOpenTask={onOpenTask}
            />
          </div>
          <VersionList
            versions={versions}
            current={{ by: note.updatedBy, count: data?.current ?? { added: 0, removed: 0 } }}
            selected={selected}
            meId={meId}
            onSelect={setSelected}
          />
        </div>
      )}
    </div>
  );
};

const NoVersionsYet = () => (
  <div className="mx-auto mt-10 flex max-w-md flex-col items-center px-6 text-center">
    <History className="size-8 text-muted-foreground" aria-hidden="true" />
    <h3 className="mt-3 font-semibold">No earlier versions yet</h3>
    <p className="mt-1.5 text-sm text-muted-foreground">
      A version is saved when someone else starts editing this note, and every 10 minutes while you write.
    </p>
  </div>
);

export default NoteHistory;
