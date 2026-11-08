import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toChecklistLines } from "../../utils/checklistLines";
import { SortableChecklist } from "./SortableChecklist";
import { useSortableRow } from "./useSortableRow";

const MAX_TEXT = 200;
const MAX_ITEMS = 100;

type DraftItem = { id: string; text: string };

type Props = {
  value: string[];
  onChange: (texts: string[]) => void;
  disabled?: boolean;
};

/** Checklist items typed while creating a task. Nothing is saved until the task is created. */
const ChecklistDraft = ({ value, onChange, disabled }: Props) => {
  const nextId = useRef(0);
  const makeItem = (text: string): DraftItem => ({ id: `draft-${nextId.current++}`, text });
  const [items, setItems] = useState<DraftItem[]>(() => value.map(makeItem));
  const [draft, setDraft] = useState("");

  const commit = (next: DraftItem[]) => {
    setItems(next);
    onChange(next.map((item) => item.text.trim()).filter(Boolean));
  };

  const addTexts = (texts: string[]) => {
    const clean = texts.map((text) => text.trim().slice(0, MAX_TEXT)).filter(Boolean);
    if (clean.length === 0) return;
    commit([...items, ...clean.map(makeItem)].slice(0, MAX_ITEMS));
    setDraft("");
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    // Enter adds the item instead of submitting the form.
    if (event.key === "Enter") {
      event.preventDefault();
      addTexts([draft]);
    }
    if (event.key === "Escape" && draft) setDraft("");
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>) => {
    const lines = toChecklistLines(event.clipboardData.getData("text"));
    if (lines.length < 2) return;
    event.preventDefault();
    addTexts(lines);
  };

  return (
    <div>
      {items.length > 0 && (
        <SortableChecklist
          ids={items.map((item) => item.id)}
          onReorder={(ids) => commit(ids.map((id) => items.find((item) => item.id === id)!))}
        >
          <ul className="-mx-1.5 mb-1.5">
            {items.map((item) => (
              <DraftRow
                key={item.id}
                item={item}
                disabled={disabled}
                onRename={(text) => commit(items.map((entry) => (entry.id === item.id ? { ...entry, text } : entry)))}
                onRemove={() => commit(items.filter((entry) => entry.id !== item.id))}
              />
            ))}
          </ul>
        </SortableChecklist>
      )}
      {items.length < MAX_ITEMS && (
        <input
          value={draft}
          disabled={disabled}
          maxLength={MAX_TEXT}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onPaste={onPaste}
          onBlur={() => draft.trim() && addTexts([draft])}
          placeholder="Add an item…"
          aria-label="New checklist item"
          data-checklist-input
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50"
        />
      )}
      <p className="mt-1 text-xs text-muted-foreground">Enter to add · paste a list to add each line · drag to reorder</p>
    </div>
  );
};

type RowProps = {
  item: DraftItem;
  disabled?: boolean;
  onRename: (text: string) => void;
  onRemove: () => void;
};

const DraftRow = ({ item, disabled, onRename, onRemove }: RowProps) => {
  const label = item.text || "item";
  const { rowProps, handle, isDragging } = useSortableRow(item.id, label);

  return (
    <li
      {...rowProps}
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-accent/60",
        isDragging && "bg-card shadow-[0_6px_16px_rgb(15_23_42/0.14)] ring-1 ring-border"
      )}
    >
      {handle}
      <span aria-hidden="true" className="size-3.5 shrink-0 rounded-[4px] border border-slate-400 bg-background" />
      <input
        value={item.text}
        disabled={disabled}
        maxLength={MAX_TEXT}
        onChange={(event) => onRename(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && event.preventDefault()}
        aria-label={`Checklist item: ${label}`}
        data-checklist-input
        className="h-7 min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 text-sm outline-none hover:border-input focus-visible:border-ring focus-visible:bg-background"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        aria-label={`Remove ${label}`}
        title="Remove"
        className="flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 hover:bg-background hover:text-red-700 focus-visible:opacity-100 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  );
};

export default ChecklistDraft;
