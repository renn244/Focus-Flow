import { useMemo, useState, type ReactNode } from "react";
import { format, isToday, isYesterday } from "date-fns";
import { ArrowLeft, History, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useNoteVersion, useNoteVersions, useRestoreNoteVersion } from "../../hooks/Note/useNoteVersions";
import type { Note, NoteChangeCount, NoteUser, NoteVersionSummary } from "../../types/note";
import { diffNotes, diffText, type DiffBlock, type NoteBlock, type TextPart } from "../../utils/noteDiff";
import NoteEditor from "./NoteEditor";
import type { MentionableTask } from "./taskMention";

const CURRENT = "current";

const userName = (user: NoteUser, meId?: string) => (user._id === meId ? "You" : user.displayName || user.username);
const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

const dayLabel = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
};

const timeLabel = (iso: string) => format(new Date(iso), "h:mm a");
const fullLabel = (iso: string) => `${dayLabel(iso)}, ${timeLabel(iso)}`;

const countLabel = ({ added, removed }: NoteChangeCount) =>
  [added > 0 && `+${added}`, removed > 0 && `−${removed}`].filter(Boolean).join(" ") || "no text changes";

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
  const isCurrent = selected === CURRENT;
  const picked = versions.find((version) => version._id === selected);
  // The live note is compared with the newest version; a version with the one before it.
  const { data: version, isLoading: loadingVersion } = useNoteVersion(note._id, isCurrent ? versions[0]?._id ?? null : selected);

  const shown = isCurrent ? { title: note.title, content: note.content } : version && { title: version.title, content: version.content };
  const baseline = isCurrent ? version && { title: version.title, content: version.content } : version?.previous ?? undefined;

  const shownContent = shown?.content;
  const baselineContent = baseline?.content;
  const diff = useMemo(
    () => (shownContent && baselineContent ? diffNotes(baselineContent, shownContent) : null),
    [shownContent, baselineContent]
  );
  const titleParts = shown && baseline && shown.title !== baseline.title ? diffText(baseline.title, shown.title) : null;
  const nothingChanged = diff !== null && !titleParts && diff.every((block) => block.type === "same");

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

  const groups = useMemo(() => {
    const byDay = new Map<string, NoteVersionSummary[]>();
    for (const item of versions) {
      const key = dayLabel(item.savedAt);
      byDay.set(key, [...(byDay.get(key) ?? []), item]);
    }
    return [...byDay.entries()];
  }, [versions]);

  const currentEntry = {
    by: note.updatedBy,
    at: note.updatedAt,
    count: data?.current ?? { added: 0, removed: 0 },
  };

  return (
    <div className="flex min-h-[calc(100svh-10rem)] flex-col bg-lane">
      <div className="sticky top-14 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-3 py-2.5 sm:px-5">
        <Button variant="outline" size="sm" className="h-8" onClick={onClose}>
          <ArrowLeft /> Back
        </Button>
        <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
          <span className="text-muted-foreground">{note.title} · </span>Version history
        </h2>
        <button
          type="button"
          role="switch"
          aria-checked={showChanges}
          onClick={() => setShowChanges((value) => !value)}
          className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-accent focus-visible:outline-2"
        >
          <span className={cn("relative h-4 w-7 rounded-full transition-colors", showChanges ? "bg-primary" : "bg-slate-300")}>
            <span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-[left]", showChanges ? "left-3.5" : "left-0.5")} />
          </span>
          Show changes
        </button>
        {!isCurrent && (
          <Button size="sm" className="h-8" onClick={doRestore} disabled={restore.isPending || !picked}>
            <RotateCcw /> Restore this version
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3 p-6"><Skeleton className="h-6 w-1/3" /><Skeleton className="h-40 w-full max-w-3xl" /></div>
      ) : isError ? (
        <p role="alert" className="p-6 text-sm text-destructive">The history could not be loaded.</p>
      ) : versions.length === 0 ? (
        <div className="mx-auto mt-10 flex max-w-md flex-col items-center px-6 text-center">
          <History className="size-8 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-3 font-semibold">No earlier versions yet</h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A version is saved when someone else starts editing this note, and every 10 minutes while you write.
          </p>
        </div>
      ) : (
        <div className="flex flex-1 items-start">
          <div className="min-w-0 flex-1 p-3 sm:p-5">
            {/* Narrow screens pick a version from a menu instead of the side list. */}
            <div className="mb-3 @4xl:hidden">
              <Select value={selected} onValueChange={setSelected}>
                <SelectTrigger className="w-full bg-card" aria-label="Version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CURRENT}>Current version · {userName(currentEntry.by, meId)}</SelectItem>
                  {versions.map((item) => (
                    <SelectItem key={item._id} value={item._id}>
                      {fullLabel(item.savedAt)} · {userName(item.savedBy, meId)} · {countLabel(item)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <article className="mx-auto max-w-[760px] rounded-xl border bg-card px-5 py-6 shadow-[0_1px_2px_rgb(15_23_42/0.06)] sm:px-10">
              <p className="mb-4 text-[13px] text-muted-foreground">
                {isCurrent
                  ? `Current version · last edited by ${userName(note.updatedBy, meId)}, ${fullLabel(note.updatedAt)}`
                  : picked && `Saved ${fullLabel(picked.savedAt)} · edits by ${userName(picked.savedBy, meId)}`}
              </p>

              {(!shown || (showChanges && loadingVersion)) ? (
                <div className="space-y-3"><Skeleton className="h-8 w-2/3" /><Skeleton className="h-24 w-full" /></div>
              ) : showChanges && diff ? (
                <>
                  <h1 className="mb-4 text-2xl font-semibold tracking-tight">
                    {titleParts ? <Parts parts={titleParts} /> : shown.title}
                  </h1>
                  {nothingChanged && (
                    <p className="mb-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                      {isCurrent ? "No changes since the newest version." : "No text changes compared with the version before."}
                    </p>
                  )}
                  <DiffView blocks={diff} />
                  <p className="mt-6 flex gap-4 border-t pt-3 text-xs text-muted-foreground">
                    <span><ins className="rounded-sm bg-emerald-100 px-1 text-emerald-800 no-underline">added</ins></span>
                    <span><del className="rounded-sm bg-red-100 px-1 text-red-800">removed</del></span>
                  </p>
                </>
              ) : (
                <>
                  {showChanges && !baseline && !isCurrent && (
                    <p className="mb-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                      This is the oldest saved version, so there is nothing earlier to compare it with.
                    </p>
                  )}
                  <h1 className="mb-2 text-2xl font-semibold tracking-tight">{shown.title}</h1>
                  <NoteEditor key={selected} readOnly initialContent={shown.content} tasks={tasks} onOpenTask={onOpenTask} />
                </>
              )}
            </article>
          </div>

          <aside aria-label="Versions" className="sticky top-[6.75rem] hidden max-h-[calc(100svh-7rem)] w-72 shrink-0 overflow-y-auto border-l bg-card p-3 @4xl:block">
            <ol>
              <li>
                <VersionButton
                  active={isCurrent}
                  onClick={() => setSelected(CURRENT)}
                  user={currentEntry.by}
                  title="Current version"
                  detail={`${userName(currentEntry.by, meId)} · ${countLabel(currentEntry.count)}`}
                />
              </li>
            </ol>
            {groups.map(([day, items]) => (
              <section key={day} aria-label={day}>
                <h3 className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{day}</h3>
                <ol>
                  {items.map((item) => (
                    <li key={item._id}>
                      <VersionButton
                        active={selected === item._id}
                        onClick={() => setSelected(item._id)}
                        user={item.savedBy}
                        title={timeLabel(item.savedAt)}
                        detail={`${userName(item.savedBy, meId)} · ${countLabel(item)}`}
                      />
                    </li>
                  ))}
                </ol>
              </section>
            ))}
            <p className="mt-4 px-2 text-xs leading-5 text-muted-foreground">
              A version is saved when someone else starts editing, and every 10 minutes of writing. The newest 50 are kept.
            </p>
          </aside>
        </div>
      )}
    </div>
  );
};

type VersionButtonProps = { active: boolean; onClick: () => void; user: NoteUser; title: string; detail: string };

const VersionButton = ({ active, onClick, user, title, detail }: VersionButtonProps) => {
  const name = user.displayName || user.username;
  return (
    <button
      type="button"
      aria-current={active ? "true" : undefined}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left hover:bg-accent focus-visible:outline-2",
        active && "bg-primary/10 shadow-[inset_2px_0_0_var(--color-primary)] hover:bg-primary/10"
      )}
    >
      <Avatar className="size-6">
        <AvatarImage src={user.avatarUrl} alt="" />
        <AvatarFallback className="bg-slate-200 text-[10px] font-semibold text-slate-700">{initials(name)}</AvatarFallback>
      </Avatar>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted-foreground">{detail}</span>
      </span>
    </button>
  );
};

const Parts = ({ parts }: { parts: TextPart[] }) => (
  <>
    {parts.map((part, index) =>
      part.change === "added" ? (
        <ins key={index} className="rounded-sm bg-emerald-100 text-emerald-900 no-underline">{part.text}</ins>
      ) : part.change === "removed" ? (
        <del key={index} className="mr-0.5 rounded-sm bg-red-100 text-red-800">{part.text}</del>
      ) : (
        <span key={index}>{part.text}</span>
      )
    )}
  </>
);

const DiffView = ({ blocks }: { blocks: DiffBlock[] }) => (
  <div className="space-y-1.5 text-[15px] leading-7">
    {blocks.map((entry, index) => (
      <BlockRow key={index} entry={entry} />
    ))}
  </div>
);

const blockFrame: Record<DiffBlock["type"], string> = {
  same: "",
  changed: "border-l-[3px] border-amber-300 pl-3",
  added: "border-l-[3px] border-emerald-500 bg-emerald-50 pl-3",
  removed: "border-l-[3px] border-red-400 bg-red-50 pl-3 text-red-800 line-through decoration-red-400",
};

const BlockRow = ({ entry }: { entry: DiffBlock }) => {
  const { block } = entry;
  const content = entry.type === "changed" ? <Parts parts={entry.parts} /> : block.text;
  const label = entry.type === "added" ? "Added" : entry.type === "removed" ? "Removed" : entry.type === "changed" ? "Changed" : undefined;

  return (
    <div className={cn("rounded-sm py-0.5", blockFrame[entry.type])} style={{ marginLeft: block.depth * 20 }}>
      {label && <span className="sr-only">{label}: </span>}
      <BlockBody block={block}>{content}</BlockBody>
    </div>
  );
};

const BlockBody = ({ block, children }: { block: NoteBlock; children: ReactNode }) => {
  switch (block.kind) {
    case "h2":
      return <h2 className="mt-4 text-xl font-semibold">{children}</h2>;
    case "h3":
      return <h3 className="mt-3 text-base font-semibold">{children}</h3>;
    case "quote":
      return <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">{children}</blockquote>;
    case "code":
      return <pre className="overflow-x-auto whitespace-pre-wrap rounded-md bg-muted px-3 py-2 font-mono text-[13px] leading-6">{children}</pre>;
    case "bullet":
    case "number":
      return <p className="flex gap-2"><span aria-hidden="true" className="text-muted-foreground">•</span><span>{children}</span></p>;
    case "task":
      return (
        <p className="flex items-start gap-2">
          <span
            role="img"
            aria-label={block.checked ? "Done" : "Not done"}
            className={cn("mt-1.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px]", block.checked ? "border-primary bg-primary text-white" : "border-slate-400")}
          >
            {block.checked ? "✓" : ""}
          </span>
          <span className={cn(block.checked && "text-muted-foreground")}>{children}</span>
        </p>
      );
    case "img":
      return <img src={block.src} alt={block.text} className="my-1 max-h-60 max-w-full rounded-md border" />;
    case "hr":
      return <hr className="my-3 border-border" />;
    default:
      return <p>{children}</p>;
  }
};

export default NoteHistory;
