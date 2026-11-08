import { ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  noteTitle: string;
  showChanges: boolean;
  onToggleChanges: () => void;
  /** Hidden while the current version is picked: there's nothing to restore. */
  canRestore: boolean;
  restoreDisabled: boolean;
  onRestore: () => void;
  onBack: () => void;
};

/** The bar above the history: Back, the "Show changes" switch, and Restore. */
const HistoryToolbar = ({ noteTitle, showChanges, onToggleChanges, canRestore, restoreDisabled, onRestore, onBack }: Props) => (
  <div className="sticky top-14 z-10 flex flex-wrap items-center gap-x-3 gap-y-2 border-b bg-card px-3 py-2.5 sm:px-5">
    <Button variant="outline" size="sm" className="h-8" onClick={onBack}>
      <ArrowLeft /> Back
    </Button>
    <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">
      <span className="text-muted-foreground">{noteTitle} · </span>Version history
    </h2>
    <button
      type="button"
      role="switch"
      aria-checked={showChanges}
      onClick={onToggleChanges}
      className="flex items-center gap-2 rounded-md px-1.5 py-1 text-sm font-medium hover:bg-accent focus-visible:outline-2"
    >
      <span className={cn("relative h-4 w-7 rounded-full transition-colors", showChanges ? "bg-primary" : "bg-slate-300")}>
        <span className={cn("absolute top-0.5 size-3 rounded-full bg-white shadow transition-[left]", showChanges ? "left-3.5" : "left-0.5")} />
      </span>
      Show changes
    </button>
    {canRestore && (
      <Button size="sm" className="h-8" onClick={onRestore} disabled={restoreDisabled}>
        <RotateCcw /> Restore this version
      </Button>
    )}
  </div>
);

export default HistoryToolbar;
