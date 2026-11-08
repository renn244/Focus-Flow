import { useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { Plus, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useChecklist } from "../../hooks/Task/useChecklist";
import { SortableChecklist } from "./SortableChecklist";
import { useSortableRow } from "./useSortableRow";
import { toChecklistLines } from "../../utils/checklistLines";
import type { ChecklistItem, TaskWithBoardAndColumn } from "../../type";

const MAX_TEXT = 200;

/** The task's checklist, shown in the dialog's Details panel. Any project member can use it. */
const TaskChecklist = ({ task }: { task: TaskWithBoardAndColumn }) => {
  const items = task.checklist ?? [];
  const { add, update, remove, reorder } = useChecklist(task);
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");

  const done = items.filter((item) => item.done).length;
  const complete = items.length > 0 && done === items.length;

  const submit = (texts: string[]) => {
    const clean = texts.map((text) => text.slice(0, MAX_TEXT)).filter(Boolean);
    if (clean.length === 0) return;
    add.mutate(clean);
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit([draft.trim()]);
    }
    if (event.key === "Escape") {
      setDraft("");
      setAdding(false);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const lines = toChecklistLines(event.clipboardData.getData("text"));
    if (lines.length < 2) return;
    event.preventDefault();
    submit(lines);
  };

  return (
    <section aria-labelledby="task-checklist-label">
      <div className="flex items-center justify-between">
        <Label id="task-checklist-label" className="text-sm font-medium text-muted-foreground">Checklist</Label>
        {items.length > 0 && (
          <span className={cn("text-xs font-medium tabular-nums", complete ? "text-emerald-700" : "text-muted-foreground")}>
            {done}/{items.length}
          </span>
        )}
      </div>

      {items.length > 0 && (
        <div
          role="progressbar"
          aria-label="Checklist progress"
          aria-valuemin={0}
          aria-valuemax={items.length}
          aria-valuenow={done}
          className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-border"
        >
          <div
            className={cn("h-full rounded-full transition-[width] duration-300", complete ? "bg-emerald-500" : "bg-primary")}
            style={{ width: `${(done / items.length) * 100}%` }}
          />
        </div>
      )}

      {items.length > 0 && (
        <SortableChecklist ids={items.map((item) => item._id)} onReorder={(ids) => reorder.mutate(ids)}>
          <ul className="mt-1.5 -mx-1.5">
            {items.map((item) => (
              <ChecklistRow
                key={item._id}
                item={item}
                onToggle={(value) => update.mutate({ itemId: item._id, done: value })}
                onRename={(text) => update.mutate({ itemId: item._id, text })}
                onRemove={() => remove.mutate(item._id)}
              />
            ))}
          </ul>
        </SortableChecklist>
      )}

      {adding ? (
        <div className="mt-1.5">
          <input
            autoFocus
            value={draft}
            maxLength={MAX_TEXT}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            onPaste={onPaste}
            onBlur={() => {
              if (draft.trim()) submit([draft.trim()]);
              setAdding(false);
            }}
            placeholder="Add an item"
            aria-label="New checklist item"
            data-checklist-input
            className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">Enter to add · Esc when done · paste a list to add each line</p>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="-mx-1.5 mt-1 flex w-[calc(100%+0.75rem)] items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-2"
        >
          <Plus className="size-4" />
          {items.length === 0 ? "Add a checklist item" : "Add item"}
        </button>
      )}
    </section>
  );
};

type RowProps = {
  item: ChecklistItem;
  onToggle: (done: boolean) => void;
  onRename: (text: string) => void;
  onRemove: () => void;
};

const ChecklistRow = ({ item, onToggle, onRename, onRemove }: RowProps) => {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(item.text);
  const { rowProps, handle, isDragging } = useSortableRow(item._id, item.text);

  const save = () => {
    const next = text.trim();
    setEditing(false);
    if (next && next !== item.text) onRename(next);
    else setText(item.text);
  };

  return (
    <li
      {...rowProps}
      className={cn(
        "group flex items-start gap-1.5 rounded-md px-1.5 py-1 hover:bg-accent/60",
        isDragging && "bg-card shadow-[0_6px_16px_rgb(15_23_42/0.14)] ring-1 ring-border"
      )}
    >
      {handle}
      <Checkbox
        checked={item.done}
        onCheckedChange={(value) => onToggle(value === true)}
        aria-label={item.done ? `Uncheck ${item.text}` : `Check off ${item.text}`}
        className="mt-0.5 mr-0.5 border-slate-400 bg-background"
      />
      {editing ? (
        <input
          autoFocus
          value={text}
          maxLength={MAX_TEXT}
          onChange={(event) => setText(event.target.value)}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === "Enter") save();
            if (event.key === "Escape") {
              setText(item.text);
              setEditing(false);
            }
          }}
          aria-label="Edit checklist item"
          data-checklist-input
          className="-my-0.5 min-w-0 flex-1 rounded border border-ring bg-background px-1 py-px text-sm outline-none"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            setText(item.text);
            setEditing(true);
          }}
          title="Click to edit"
          className={cn(
            "min-w-0 flex-1 break-words text-left text-sm leading-5",
            item.done && "text-muted-foreground line-through"
          )}
        >
          {item.text}
        </button>
      )}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${item.text}`}
        title="Remove"
        className="-my-0.5 flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-background hover:text-red-700 focus-visible:opacity-100 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
};

export default TaskChecklist;
