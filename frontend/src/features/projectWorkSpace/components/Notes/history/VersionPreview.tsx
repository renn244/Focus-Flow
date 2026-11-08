import { Skeleton } from "@/components/ui/skeleton";
import type { NoteVersionContent } from "../../../types/note";
import type { DiffBlock, TextPart } from "../../../utils/noteDiff";
import NoteEditor from "../NoteEditor";
import type { MentionableTask } from "../taskMention";
import ChangesView, { ChangedWords } from "./ChangesView";

type Props = {
  /** Line above the title, e.g. "Saved Today, 3:40 PM · edits by Ana Lim". */
  caption: string;
  /** Used to reset the read-only editor when another version is picked. */
  versionKey: string;
  isCurrent: boolean;
  showChanges: boolean;
  loading: boolean;
  shown?: NoteVersionContent;
  baseline?: NoteVersionContent;
  diff: DiffBlock[] | null;
  titleParts: TextPart[] | null;
  nothingChanged: boolean;
  tasks: MentionableTask[];
  onOpenTask: (taskId: string) => void;
};

const Hint = ({ children }: { children: string }) => (
  <p className="mb-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{children}</p>
);

/** The reading card: the picked version with its changes marked, or as plain read-only text. */
const VersionPreview = ({
  caption, versionKey, isCurrent, showChanges, loading, shown, baseline, diff, titleParts, nothingChanged, tasks, onOpenTask,
}: Props) => {
  const body = () => {
    if (!shown || (showChanges && loading)) {
      return <div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /></div>;
    }

    if (showChanges && diff) {
      return (
        <>
          <h1 className="mb-4 text-2xl font-semibold tracking-tight">
            {titleParts ? <ChangedWords parts={titleParts} /> : shown.title}
          </h1>
          {nothingChanged && (
            <Hint>{isCurrent ? "No changes since the newest version." : "No text changes compared with the version before."}</Hint>
          )}
          <ChangesView blocks={diff} />
        </>
      );
    }

    return (
      <>
        {showChanges && !baseline && !isCurrent && (
          <Hint>This is the oldest saved version, so there is nothing earlier to compare it with.</Hint>
        )}
        <h1 className="mb-2 text-2xl font-semibold tracking-tight">{shown.title}</h1>
        <NoteEditor key={versionKey} readOnly initialContent={shown.content} tasks={tasks} onOpenTask={onOpenTask} />
      </>
    );
  };

  return (
    <article className="mx-auto max-w-[760px] rounded-xl border bg-card px-5 py-6 shadow-[0_1px_2px_rgb(15_23_42/0.06)] sm:px-10">
      <p className="mb-4 text-[13px] text-muted-foreground">{caption}</p>
      {body()}
    </article>
  );
};

export default VersionPreview;
