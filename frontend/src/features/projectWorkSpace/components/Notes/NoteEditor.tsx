import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import type { Editor, JSONContent } from "@tiptap/core";
import DragHandle from "@tiptap/extension-drag-handle-react";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import { TaskItem, TaskList } from "@tiptap/extension-list";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold, Code, GripVertical, Hash, Heading2, Heading3, ImageIcon, Italic, Link2, List, ListChecks, ListOrdered, Quote, Redo2, Undo2, Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { createSlashCommands } from "./slashCommands";
import { createTaskMention, type MentionableTask } from "./taskMention";

type NoteEditorProps = {
  initialContent?: JSONContent;
  tasks: MentionableTask[];
  onChange?: (content: JSONContent, contentText: string) => void;
  onOpenTask: (taskId: string) => void;
  onUploadImage?: (file: File) => Promise<string>;
  /** Shows the content without the toolbar or drag handle and doesn't allow edits (used for older versions). */
  readOnly?: boolean;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const imageFiles = (files: FileList | null | undefined) =>
  Array.from(files ?? []).filter((file) => file.type.startsWith("image/"));

/** Typography for the note body, set on the editor's root element. */
const proseClass = cn(
  // The left padding reaches under the drag grip, so a block dropped along the grip column still lands in the note.
  "note-editor -ml-4 pl-4 sm:-ml-10 sm:pl-10 min-h-[50vh] pb-24 text-[15px] leading-7 text-foreground outline-none",
  "[&_h2]:mt-7 [&_h2]:mb-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h3]:mt-5 [&_h3]:mb-1.5 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:my-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_li_p]:my-0.5",
  "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
  "[&_blockquote]:my-3 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:text-muted-foreground",
  "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[13px]",
  "[&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-shell-raised [&_pre]:px-4 [&_pre]:py-3 [&_pre]:text-[13px] [&_pre]:leading-6 [&_pre]:text-blue-50",
  "[&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-inherit",
  "[&_img]:my-3 [&_img]:max-h-[480px] [&_img]:max-w-full [&_img]:rounded-lg [&_img]:border",
  // A clicked image is selected as a whole; show it so the click doesn't look like it did nothing.
  "[&_img.ProseMirror-selectednode]:outline-2 [&_img.ProseMirror-selectednode]:outline-offset-2 [&_img.ProseMirror-selectednode]:outline-primary",
  "[&_hr]:my-6 [&_hr]:border-border",
  "[&_ul[data-type=taskList]]:list-none [&_ul[data-type=taskList]]:pl-0.5",
  "[&_ul[data-type=taskList]>li]:flex [&_ul[data-type=taskList]>li]:items-start [&_ul[data-type=taskList]>li]:gap-2.5",
  "[&_ul[data-type=taskList]>li>label]:mt-[5px] [&_ul[data-type=taskList]>li>div]:flex-1",
  "[&_ul[data-type=taskList]>li_input]:size-4 [&_ul[data-type=taskList]>li_input]:accent-primary",
  "[&_li[data-checked=true]>div]:text-muted-foreground [&_li[data-checked=true]>div]:line-through",
  "[&_.task-mention]:cursor-pointer [&_.task-mention]:rounded [&_.task-mention]:border [&_.task-mention]:border-blue-200 [&_.task-mention]:bg-blue-50 [&_.task-mention]:px-1.5 [&_.task-mention]:py-px [&_.task-mention]:text-[13px] [&_.task-mention]:font-medium [&_.task-mention]:text-blue-700 [&_.task-mention]:hover:bg-blue-100",
  "[&_p.is-editor-empty:first-child]:before:pointer-events-none [&_p.is-editor-empty:first-child]:before:float-left [&_p.is-editor-empty:first-child]:before:h-0 [&_p.is-editor-empty:first-child]:before:text-muted-foreground [&_p.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]"
);

const NoteEditor = ({ initialContent, tasks, onChange, onOpenTask, onUploadImage, readOnly = false }: NoteEditorProps) => {
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onUploadRef = useRef(onUploadImage);
  onUploadRef.current = onUploadImage;
  const editorRef = useRef<Editor | null>(null);
  const imageInput = useRef<HTMLInputElement>(null);

  /** Uploads each image, then puts it at `pos` (where it was dropped) or at the cursor. */
  const insertImages = useCallback((files: File[], pos?: number) => {
    for (const file of files) {
      if (!IMAGE_TYPES.includes(file.type)) {
        toast.error(`${file.name}: images must be JPG, PNG, WebP, or GIF`);
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error(`${file.name} is over 5 MB`);
        continue;
      }
      const upload = onUploadRef.current;
      if (!upload) continue;
      const toastId = toast.loading("Uploading image…");
      upload(file)
        .then((src) => {
          toast.dismiss(toastId);
          const editor = editorRef.current;
          if (!editor || editor.isDestroyed) return;
          const image = { type: "image", attrs: { src, alt: file.name.replace(/\.[^.]+$/, "") } };
          const at = pos !== undefined ? Math.min(pos, editor.state.doc.content.size) : editor.state.selection.to;
          // A text line after the image gives the cursor somewhere normal to land.
          editor.chain().focus().insertContentAt(at, [image, { type: "paragraph" }]).run();
        })
        .catch((error: Error) => toast.error(error.message, { id: toastId }));
    }
  }, []);

  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit.configure({ link: false, heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Image,
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Write something, type / for blocks, or # to link a task" }),
      createTaskMention(() => tasksRef.current),
      createSlashCommands(() => ({ pickImage: () => imageInput.current?.click() })),
    ],
    content: initialContent,
    editorProps: {
      attributes: { class: cn(proseClass, readOnly && "min-h-0 pb-6"), "aria-label": readOnly ? "Note content (read only)" : "Note content" },
      handlePaste: (_view, event) => {
        const files = imageFiles(event.clipboardData?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        insertImages(files);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        const files = moved ? [] : imageFiles(event.dataTransfer?.files);
        if (files.length === 0) return false;
        event.preventDefault();
        insertImages(files, view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => onChangeRef.current?.(current.getJSON(), current.getText({ blockSeparator: "\n" }).trim()),
  });

  // Clicking (or pressing Enter on) a task chip opens the task.
  useEffect(() => {
    const root = editor?.view.dom;
    if (!root) return;
    const open = (event: Event) => {
      const chip = (event.target as HTMLElement).closest<HTMLElement>("[data-task-id]");
      if (!chip) return;
      if (event instanceof KeyboardEvent && event.key !== "Enter") return;
      event.preventDefault();
      onOpenTask(chip.dataset.taskId!);
    };
    root.addEventListener("click", open);
    root.addEventListener("keydown", open);
    return () => {
      root.removeEventListener("click", open);
      root.removeEventListener("keydown", open);
    };
  }, [editor, onOpenTask]);

  editorRef.current = editor;

  if (!editor) return null;

  if (readOnly) return <EditorContent editor={editor} />;

  return (
    <div>
      <Toolbar editor={editor} onPickImages={insertImages} />
      {/* Hover a block to grab it by the ⋮⋮ handle and drag it somewhere else. Mouse only: touch screens can't drag this way. */}
      <DragHandle editor={editor} nested className="[@media(pointer:coarse)]:hidden">
        <div
          aria-hidden="true"
          title="Drag to move"
          className="mr-1 flex h-7 w-5 cursor-grab items-center justify-center rounded text-muted-foreground/70 hover:bg-accent hover:text-foreground active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </div>
      </DragHandle>
      <input
        ref={imageInput}
        type="file"
        accept={IMAGE_TYPES.join(",")}
        multiple
        hidden
        onChange={(event) => {
          const files = imageFiles(event.target.files);
          event.target.value = "";
          if (files.length > 0) insertImages(files);
        }}
      />
      <EditorContent editor={editor} className="mt-5" />
    </div>
  );
};

const Toolbar = ({ editor, onPickImages }: { editor: Editor; onPickImages: (files: File[]) => void }) => {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      h2: e.isActive("heading", { level: 2 }),
      h3: e.isActive("heading", { level: 3 }),
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      tasks: e.isActive("taskList"),
      quote: e.isActive("blockquote"),
      code: e.isActive("codeBlock"),
      link: e.isActive("link"),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();

  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className="sticky top-14 z-10 -mx-1 flex flex-wrap items-center gap-0.5 border-b border-border bg-card px-1 py-1.5"
    >
      <ToolButton label="Heading" active={state.h2} onClick={() => chain().toggleHeading({ level: 2 }).run()}><Heading2 /></ToolButton>
      <ToolButton label="Subheading" active={state.h3} onClick={() => chain().toggleHeading({ level: 3 }).run()}><Heading3 /></ToolButton>
      <ToolButton label="Bold" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold /></ToolButton>
      <ToolButton label="Italic" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic /></ToolButton>
      <Divider />
      <ToolButton label="Bullet list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List /></ToolButton>
      <ToolButton label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered /></ToolButton>
      <ToolButton label="Checklist" active={state.tasks} onClick={() => chain().toggleTaskList().run()}><ListChecks /></ToolButton>
      <ToolButton label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote /></ToolButton>
      <ToolButton label="Code block" active={state.code} onClick={() => chain().toggleCodeBlock().run()}><Code /></ToolButton>
      <Divider />
      <UrlButton
        label="Link"
        icon={<Link2 />}
        active={state.link}
        placeholder="https://"
        initial={() => (editor.getAttributes("link").href as string | undefined) ?? ""}
        onSubmit={(href) =>
          href ? chain().extendMarkRange("link").setLink({ href }).run() : chain().extendMarkRange("link").unsetLink().run()
        }
      />
      <UrlButton
        label="Image"
        icon={<ImageIcon />}
        placeholder="Or paste an image link"
        onSubmit={(src) => src && chain().insertContent([{ type: "image", attrs: { src } }, { type: "paragraph" }]).run()}
        onPickFiles={onPickImages}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-8 gap-1 px-2 text-[13px] font-medium text-blue-700 hover:bg-blue-50 hover:text-blue-800"
        onClick={() => chain().insertContent(" #").run()}
        title="Link a task (or type #)"
      >
        <Hash className="size-3.5" />Task
      </Button>
      <div className="ml-auto flex items-center gap-0.5">
        <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}><Undo2 /></ToolButton>
        <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}><Redo2 /></ToolButton>
      </div>
    </div>
  );
};

const Divider = () => <span aria-hidden="true" className="mx-1 h-5 w-px bg-border" />;

type ToolButtonProps = { label: string; active?: boolean; disabled?: boolean; onClick: () => void; children: ReactNode };

const ToolButton = ({ label, active, disabled, onClick, children }: ToolButtonProps) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    aria-label={label}
    aria-pressed={active}
    title={label}
    disabled={disabled}
    onClick={onClick}
    className={cn("size-8 text-muted-foreground [&_svg]:size-4", active && "bg-accent text-foreground")}
  >
    {children}
  </Button>
);

type UrlButtonProps = {
  label: string;
  icon: ReactNode;
  active?: boolean;
  placeholder: string;
  initial?: () => string;
  onSubmit: (url: string) => void;
  /** When set, the popover also offers a file picker (used for images). */
  onPickFiles?: (files: File[]) => void;
};

const UrlButton = ({ label, icon, active, placeholder, initial, onSubmit, onPickFiles }: UrlButtonProps) => {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const url = value.trim();
    onSubmit(url && !/^[a-z]+:/i.test(url) ? `https://${url}` : url);
    setOpen(false);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) setValue(initial?.() ?? "");
        setOpen(next);
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={label}
          title={label}
          className={cn("size-8 text-muted-foreground [&_svg]:size-4", active && "bg-accent text-foreground")}
        >
          {icon}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 p-2">
        {onPickFiles && (
          <>
            <Button type="button" variant="outline" className="mb-2 h-9 w-full" onClick={() => fileInput.current?.click()}>
              <Upload /> Upload from your device
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept={IMAGE_TYPES.join(",")}
              multiple
              hidden
              onChange={(event) => {
                const files = imageFiles(event.target.files);
                event.target.value = "";
                setOpen(false);
                if (files.length > 0) onPickFiles(files);
              }}
            />
          </>
        )}
        <form onSubmit={submit} className="flex gap-2">
          <Input autoFocus={!onPickFiles} aria-label={`${label} address`} value={value} onChange={(event) => setValue(event.target.value)} placeholder={placeholder} className="h-9" />
          <Button type="submit" size="sm" className="h-9">{label === "Link" && !value.trim() ? "Remove" : "Add"}</Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};

export default NoteEditor;
