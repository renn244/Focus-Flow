import type { JSONContent } from "@tiptap/core";
import { diffWords } from "diff";

/** One readable piece of a note: a paragraph, heading, list item, image… */
export type NoteBlock = {
  kind: "p" | "h2" | "h3" | "quote" | "code" | "bullet" | "number" | "task" | "img" | "hr";
  text: string;
  /** List nesting, 0 at the top. */
  depth: number;
  checked?: boolean;
  src?: string;
};

export type TextPart = { text: string; change?: "added" | "removed" };

export type DiffBlock =
  | { type: "same"; block: NoteBlock }
  | { type: "added" | "removed"; block: NoteBlock }
  | { type: "changed"; block: NoteBlock; parts: TextPart[] };

const LIST_TYPES = new Set(["bulletList", "orderedList", "taskList"]);

const inlineText = (node: JSONContent | undefined): string => {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (node.type === "hardBreak") return "\n";
  if (node.type === "taskMention") return `#${String(node.attrs?.label ?? "")}`;
  return (node.content ?? []).map(inlineText).join("");
};

const walk = (nodes: JSONContent[] | undefined, out: NoteBlock[], depth: number, listKind?: NoteBlock["kind"]) => {
  for (const node of nodes ?? []) {
    switch (node.type) {
      case "paragraph": {
        const text = inlineText(node).trim();
        if (text) out.push({ kind: "p", text, depth });
        break;
      }
      case "heading":
        out.push({ kind: node.attrs?.level === 3 ? "h3" : "h2", text: inlineText(node).trim(), depth });
        break;
      case "codeBlock":
        out.push({ kind: "code", text: inlineText(node), depth });
        break;
      case "blockquote":
        out.push({ kind: "quote", text: (node.content ?? []).map(inlineText).join("\n").trim(), depth });
        break;
      case "image":
        out.push({ kind: "img", text: String(node.attrs?.alt ?? ""), src: String(node.attrs?.src ?? ""), depth });
        break;
      case "horizontalRule":
        out.push({ kind: "hr", text: "", depth });
        break;
      case "bulletList":
        walk(node.content, out, depth, "bullet");
        break;
      case "orderedList":
        walk(node.content, out, depth, "number");
        break;
      case "taskList":
        walk(node.content, out, depth, "task");
        break;
      case "listItem":
      case "taskItem": {
        const own = (node.content ?? []).filter((child) => !LIST_TYPES.has(child.type ?? ""));
        out.push({
          kind: listKind ?? "bullet",
          text: own.map(inlineText).join(" ").trim(),
          depth,
          checked: node.type === "taskItem" ? Boolean(node.attrs?.checked) : undefined,
        });
        walk((node.content ?? []).filter((child) => LIST_TYPES.has(child.type ?? "")), out, depth + 1);
        break;
      }
      default:
        walk(node.content, out, depth, listKind);
    }
  }
  return out;
};

/** Flattens a Tiptap document into blocks, in reading order. */
export const noteBlocks = (doc: JSONContent | undefined) => walk(doc?.content, [], 0);

const signature = (block: NoteBlock) => `${block.kind}|${block.depth}|${block.checked ?? ""}|${block.src ?? ""}|${block.text}`;

/** Blocks with text that can be compared word by word when they changed. */
const isText = (block: NoteBlock) => block.kind !== "img" && block.kind !== "hr";

/** Word-level differences between two strings. */
export const diffText = (before: string, after: string): TextPart[] =>
  diffWords(before, after).map((part) => ({
    text: part.value,
    change: part.added ? "added" : part.removed ? "removed" : undefined,
  }));

/**
 * True when at least half of the text survived the edit. A rewrite into a different sentence
 * reads better as one block removed and another added than as a tangle of marked words.
 */
const isMostlySame = (parts: TextPart[], before: string, after: string) => {
  const kept = parts.filter((part) => !part.change).reduce((sum, part) => sum + part.text.trim().length, 0);
  const longest = Math.max(before.trim().length, after.trim().length);
  return longest === 0 || kept / longest >= 0.5;
};

/**
 * Compares two versions block by block. Unchanged blocks are kept in place; a block edited in
 * place (removed and added at the same spot, same kind) is shown once with its changed words marked.
 */
export const diffNotes = (before: JSONContent | undefined, after: JSONContent | undefined): DiffBlock[] => {
  const a = noteBlocks(before);
  const b = noteBlocks(after);
  const sa = a.map(signature);
  const sb = b.map(signature);

  // Longest common subsequence table, filled from the end.
  const lcs = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      lcs[i][j] = sa[i] === sb[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }

  const out: DiffBlock[] = [];
  let removed: NoteBlock[] = [];
  let added: NoteBlock[] = [];

  // Pairs up a run of removed blocks with the run of added blocks that replaced them.
  const flushRun = () => {
    let k = 0;
    for (; k < Math.min(removed.length, added.length); k++) {
      const old = removed[k];
      const next = added[k];
      const parts = isText(old) && isText(next) && old.kind === next.kind ? diffText(old.text, next.text) : null;
      if (parts && isMostlySame(parts, old.text, next.text)) {
        out.push({ type: "changed", block: next, parts });
      } else {
        out.push({ type: "removed", block: old }, { type: "added", block: next });
      }
    }
    for (const block of removed.slice(k)) out.push({ type: "removed", block });
    for (const block of added.slice(k)) out.push({ type: "added", block });
    removed = [];
    added = [];
  };

  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && sa[i] === sb[j]) {
      flushRun();
      out.push({ type: "same", block: b[j] });
      i++;
      j++;
    } else if (j < b.length && (i === a.length || lcs[i][j + 1] >= lcs[i + 1][j])) {
      added.push(b[j++]);
    } else {
      removed.push(a[i++]);
    }
  }
  flushRun();
  return out;
};
