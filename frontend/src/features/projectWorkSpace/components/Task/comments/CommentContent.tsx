import Link from "@tiptap/extension-link";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const CommentContent = ({ content }: { content: JSONContent }) => {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: true })],
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: "text-sm leading-relaxed outline-none [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
  });

  return editor ? <EditorContent editor={editor} /> : null;
};

export default CommentContent;
