import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { DiffBlock, NoteBlock, TextPart } from "../../../utils/noteDiff";

/** A note compared with an earlier one: unchanged blocks plain, changes marked in green and red. */
const ChangesView = ({ blocks }: { blocks: DiffBlock[] }) => (
  <>
    <div className="space-y-1.5 text-[15px] leading-7">
      {blocks.map((entry, index) => (
        <BlockRow key={index} entry={entry} />
      ))}
    </div>
    <p className="mt-6 flex gap-4 border-t pt-3 text-xs text-muted-foreground">
      <span><ins className="rounded-sm bg-emerald-100 px-1 text-emerald-800 no-underline">added</ins></span>
      <span><del className="rounded-sm bg-red-100 px-1 text-red-800">removed</del></span>
    </p>
  </>
);

/** Words inside an edited line (or the title), with added and removed words marked. */
export const ChangedWords = ({ parts }: { parts: TextPart[] }) => (
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

const frameByType: Record<DiffBlock["type"], string> = {
  same: "",
  changed: "border-l-[3px] border-amber-300 pl-3",
  added: "border-l-[3px] border-emerald-500 bg-emerald-50 pl-3",
  removed: "border-l-[3px] border-red-400 bg-red-50 pl-3 text-red-800 line-through decoration-red-400",
};

const labelByType: Partial<Record<DiffBlock["type"], string>> = { added: "Added", removed: "Removed", changed: "Changed" };

const BlockRow = ({ entry }: { entry: DiffBlock }) => {
  const label = labelByType[entry.type];
  return (
    <div className={cn("rounded-sm py-0.5", frameByType[entry.type])} style={{ marginLeft: entry.block.depth * 20 }}>
      {label && <span className="sr-only">{label}: </span>}
      <BlockBody block={entry.block}>
        {entry.type === "changed" ? <ChangedWords parts={entry.parts} /> : entry.block.text}
      </BlockBody>
    </div>
  );
};

/** Draws a block the way it looks in the note: heading, list item, checkbox, image… */
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
            className={cn(
              "mt-1.5 flex size-4 shrink-0 items-center justify-center rounded border text-[10px]",
              block.checked ? "border-primary bg-primary text-white" : "border-slate-400"
            )}
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

export default ChangesView;
