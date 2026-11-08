import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { NoteChangeCount, NoteUser, NoteVersionSummary } from "../../../types/note";
import { countLabel, groupByDay, initials, timeLabel, userName } from "./historyLabels";
import { CURRENT } from "./useVersionComparison";

type Props = {
  versions: NoteVersionSummary[];
  current: { by: NoteUser; count: NoteChangeCount };
  selected: string;
  meId?: string;
  onSelect: (id: string) => void;
};

/** The side list on wide screens: the current version, then saved versions grouped by day. */
const VersionList = ({ versions, current, selected, meId, onSelect }: Props) => (
  <aside aria-label="Versions" className="sticky top-[6.75rem] hidden max-h-[calc(100svh-7rem)] w-72 shrink-0 overflow-y-auto border-l bg-card p-3 @4xl:block">
    <ol>
      <li>
        <VersionButton
          active={selected === CURRENT}
          onClick={() => onSelect(CURRENT)}
          user={current.by}
          title="Current version"
          detail={`${userName(current.by, meId)} · ${countLabel(current.count)}`}
        />
      </li>
    </ol>
    {groupByDay(versions).map(([day, items]) => (
      <section key={day} aria-label={day}>
        <h3 className="mb-1 mt-4 px-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{day}</h3>
        <ol>
          {items.map((item) => (
            <li key={item._id}>
              <VersionButton
                active={selected === item._id}
                onClick={() => onSelect(item._id)}
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
);

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

export default VersionList;
