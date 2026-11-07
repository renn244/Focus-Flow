import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import {
  Code, Hash, Heading2, Heading3, ImageIcon, List, ListChecks, ListOrdered, Minus, Quote, Type, type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { suggestionPopup, type SuggestionListHandle } from "./suggestionPopup";

/** Things a `/` command needs from the editor around it. */
export type SlashActions = { pickImage: () => void };

type SlashItem = {
  title: string;
  hint: string;
  icon: LucideIcon;
  keywords: string[];
  run: (editor: Editor, range: Range, actions: SlashActions) => void;
};

const block = (editor: Editor, range: Range) => editor.chain().focus().deleteRange(range);

const SLASH_ITEMS: SlashItem[] = [
  { title: "Text", hint: "Plain paragraph", icon: Type, keywords: ["paragraph", "p"], run: (e, r) => block(e, r).setParagraph().run() },
  { title: "Heading", hint: "Big section title", icon: Heading2, keywords: ["h1", "h2", "title"], run: (e, r) => block(e, r).setNode("heading", { level: 2 }).run() },
  { title: "Subheading", hint: "Smaller title", icon: Heading3, keywords: ["h3"], run: (e, r) => block(e, r).setNode("heading", { level: 3 }).run() },
  { title: "Bullet list", hint: "Simple list", icon: List, keywords: ["ul", "unordered", "-"], run: (e, r) => block(e, r).toggleBulletList().run() },
  { title: "Numbered list", hint: "1, 2, 3…", icon: ListOrdered, keywords: ["ol", "ordered"], run: (e, r) => block(e, r).toggleOrderedList().run() },
  { title: "Checklist", hint: "To-dos with checkboxes", icon: ListChecks, keywords: ["todo", "task list", "checkbox"], run: (e, r) => block(e, r).toggleTaskList().run() },
  { title: "Quote", hint: "Quoted text", icon: Quote, keywords: ["blockquote"], run: (e, r) => block(e, r).toggleBlockquote().run() },
  { title: "Code block", hint: "Code or commands", icon: Code, keywords: ["snippet", "pre"], run: (e, r) => block(e, r).toggleCodeBlock().run() },
  { title: "Divider", hint: "A line between sections", icon: Minus, keywords: ["hr", "separator", "line"], run: (e, r) => block(e, r).setHorizontalRule().run() },
  {
    title: "Image",
    hint: "Upload from your device",
    icon: ImageIcon,
    keywords: ["picture", "photo", "upload"],
    run: (e, r, actions) => {
      block(e, r).run();
      actions.pickImage();
    },
  },
  // Inserting "#" opens the task picker.
  { title: "Link a task", hint: "Mention a project task", icon: Hash, keywords: ["task", "mention", "#"], run: (e, r) => block(e, r).insertContent("#").run() },
];

/** How well an item matches what was typed after "/": title starts > title contains > keyword. 0 = no match. */
const score = (item: SlashItem, needle: string) => {
  const title = item.title.toLowerCase();
  if (title.startsWith(needle)) return 4;
  if (title.split(" ").some((word) => word.startsWith(needle))) return 3;
  if (title.includes(needle)) return 2;
  return item.keywords.some((word) => word.toLowerCase().includes(needle)) ? 1 : 0;
};

const filterItems = (query: string) => {
  const needle = query.trim().toLowerCase();
  if (!needle) return SLASH_ITEMS;
  return SLASH_ITEMS.map((item) => ({ item, rank: score(item, needle) }))
    .filter(({ rank }) => rank > 0)
    .sort((a, b) => b.rank - a.rank)
    .map(({ item }) => item);
};

type ListProps = SuggestionProps<SlashItem, SlashItem>;

const SlashMenuList = forwardRef<SuggestionListHandle, ListProps>(({ items, command }, ref) => {
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => setActive(0), [items]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowDown") { setActive((index) => (index + 1) % items.length); return true; }
      if (event.key === "ArrowUp") { setActive((index) => (index + items.length - 1) % items.length); return true; }
      if (event.key === "Enter" || event.key === "Tab") { command(items[active]); return true; }
      return false;
    },
  }));

  return (
    <div
      ref={listRef}
      role="listbox"
      aria-label="Insert a block"
      className="max-h-80 w-72 overflow-y-auto rounded-lg border bg-popover p-1 text-popover-foreground shadow-[0_12px_32px_rgb(15_23_42/0.18)]"
    >
      {items.length === 0 ? (
        <p className="px-2.5 py-2 text-sm text-muted-foreground">No matching blocks</p>
      ) : (
        items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.title}
              type="button"
              role="option"
              data-index={index}
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
              onMouseDown={(event) => { event.preventDefault(); command(item); }}
              className={cn("flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left", index === active && "bg-accent")}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
              </span>
            </button>
          );
        })
      )}
    </div>
  );
});
SlashMenuList.displayName = "SlashMenuList";

/** Typing `/` opens a menu of blocks to insert, like in Notion. */
export const createSlashCommands = (getActions: () => SlashActions) =>
  Extension.create({
    name: "slashCommands",
    addProseMirrorPlugins() {
      return [
        Suggestion<SlashItem, SlashItem>({
          editor: this.editor,
          pluginKey: new PluginKey("slashCommands"),
          char: "/",
          items: ({ query }) => filterItems(query),
          command: ({ editor, range, props }) => props.run(editor, range, getActions()),
          // No menu inside code, where "/" is usually just a character.
          allow: ({ editor }) => !editor.isActive("codeBlock"),
          render: suggestionPopup(SlashMenuList, { width: 288, height: 330 }),
        }),
      ];
    },
  });
