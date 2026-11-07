import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import Mention from "@tiptap/extension-mention";
import type { SuggestionProps } from "@tiptap/suggestion";
import { cn } from "@/lib/utils";
import { suggestionPopup, type SuggestionListHandle } from "./suggestionPopup";

export type MentionableTask = { id: string; title: string; meta?: string };

type ListProps = SuggestionProps<MentionableTask, { id: string; label: string }>;

const TaskSuggestionList = forwardRef<SuggestionListHandle, ListProps>(({ items, command }, ref) => {
  const [active, setActive] = useState(0);

  useEffect(() => setActive(0), [items]);

  const pick = (index: number) => {
    const task = items[index];
    if (task) command({ id: task.id, label: task.title });
  };

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (items.length === 0) return false;
      if (event.key === "ArrowDown") { setActive((index) => (index + 1) % items.length); return true; }
      if (event.key === "ArrowUp") { setActive((index) => (index + items.length - 1) % items.length); return true; }
      if (event.key === "Enter" || event.key === "Tab") { pick(active); return true; }
      return false;
    },
  }));

  return (
    <div role="listbox" aria-label="Link a task" className="w-72 overflow-hidden rounded-lg border bg-popover p-1 text-popover-foreground shadow-[0_12px_32px_rgb(15_23_42/0.18)]">
      {items.length === 0 ? (
        <p className="px-2.5 py-2 text-sm text-muted-foreground">No matching tasks</p>
      ) : (
        items.map((task, index) => (
          <button
            key={task.id}
            type="button"
            role="option"
            aria-selected={index === active}
            onMouseEnter={() => setActive(index)}
            onMouseDown={(event) => { event.preventDefault(); pick(index); }}
            className={cn("flex w-full flex-col rounded-md px-2.5 py-1.5 text-left", index === active && "bg-accent")}
          >
            <span className="truncate text-sm font-medium">{task.title}</span>
            {task.meta && <span className="truncate text-xs text-muted-foreground">{task.meta}</span>}
          </button>
        ))
      )}
    </div>
  );
});
TaskSuggestionList.displayName = "TaskSuggestionList";

/**
 * A `#` mention that links a project task. Stored in the Tiptap JSON as a
 * `taskMention` node with the task id, which the backend reads to keep the
 * note's task links in sync.
 */
export const createTaskMention = (getTasks: () => MentionableTask[]) =>
  Mention.extend({ name: "taskMention" }).configure({
    HTMLAttributes: { class: "task-mention" },
    renderText: ({ node }) => `#${node.attrs.label ?? node.attrs.id}`,
    renderHTML: ({ options, node }) => [
      "span",
      { ...options.HTMLAttributes, "data-task-id": node.attrs.id, role: "link", tabindex: "0", title: "Open task" },
      `# ${node.attrs.label ?? "Task"}`,
    ],
    suggestion: {
      char: "#",
      allowSpaces: true,
      items: ({ query }) => {
        const needle = query.trim().toLowerCase();
        return getTasks().filter((task) => task.title.toLowerCase().includes(needle)).slice(0, 8);
      },
      render: suggestionPopup(TaskSuggestionList, { width: 288 }),
    },
  });
