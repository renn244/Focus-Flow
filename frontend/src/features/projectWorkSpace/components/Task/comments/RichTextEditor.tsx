import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Italic, List, ListOrdered, Quote, Redo2, Undo2 } from "lucide-react";

type RichTextEditorProps = {
  initialContent?: JSONContent;
  placeholder: string;
  onChange: (content: JSONContent, contentText: string) => void;
  className?: string;
};

const RichTextEditor = ({ initialContent, placeholder, onChange, className }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: false }),
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "min-h-28 px-3 py-2 text-sm outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_h2]:mt-3 [&_h2]:text-lg [&_h3]:mt-2 [&_h3]:font-medium [&_p]:mb-2 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON(), currentEditor.getText().trim()),
  });

  if (!editor) {
    return null;
  }

  const toolbarItems = [
    { label: "Bold", icon: Bold, active: editor.isActive("bold"), action: () => editor.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: editor.isActive("italic"), action: () => editor.chain().focus().toggleItalic().run() },
    { label: "Bullet list", icon: List, active: editor.isActive("bulletList"), action: () => editor.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: editor.isActive("orderedList"), action: () => editor.chain().focus().toggleOrderedList().run() },
    { label: "Quote", icon: Quote, active: editor.isActive("blockquote"), action: () => editor.chain().focus().toggleBlockquote().run() },
    { label: "Code block", icon: Code, active: editor.isActive("codeBlock"), action: () => editor.chain().focus().toggleCodeBlock().run() },
  ];

  return (
    <div className={cn("overflow-hidden rounded-md border bg-background", className)}>
      <div className="flex flex-wrap items-center gap-1 border-b p-1.5">
        {toolbarItems.map(({ label, icon: Icon, active, action }) => (
          <Button
            key={label}
            type="button"
            variant={active ? "secondary" : "ghost"}
            size="icon"
            className="size-7"
            aria-label={label}
            title={label}
            onClick={action}
          >
            <Icon />
          </Button>
        ))}
        <Separator orientation="vertical" className="mx-1 h-5" />
        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Undo" title="Undo" onClick={() => editor.chain().focus().undo().run()}>
          <Undo2 />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Redo" title="Redo" onClick={() => editor.chain().focus().redo().run()}>
          <Redo2 />
        </Button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};

export default RichTextEditor;
