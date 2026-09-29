import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { formatDistanceToNow } from "date-fns";
import { Pencil, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "../../../hooks/Comment/useComments";
import type { CommentPayload, TaskComment } from "../../../types/comment";
import CommentContent from "./CommentContent";
import RichTextEditor from "./RichTextEditor";

const emptyComment: CommentPayload = {
  content: { type: "doc", content: [{ type: "paragraph" }] },
  contentText: "",
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const TaskComments = ({ taskId, standalone = false }: { taskId: string; standalone?: boolean }) => {
  const { data: comments = [], isLoading, isError } = useComments(taskId);
  const createComment = useCreateComment(taskId);
  const [draft, setDraft] = useState<CommentPayload>(emptyComment);

  const submitComment = async () => {
    if (!draft.contentText) return;

    try {
      await createComment.mutateAsync(draft);
      setDraft(emptyComment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to add comment");
    }
  };

  return (
    <section className={standalone ? undefined : "mt-6 border-t pt-5"}>
      <div className="mb-4">
        <h3 className="font-medium">Activity</h3>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading comments…</p>
      ) : isError ? (
        <p className="text-sm text-destructive">Comments could not be loaded. Please try again.</p>
      ) : comments.length === 0 ? (
        <div className="mb-5 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Start the conversation. Updates and decisions for this task live here.
        </div>
      ) : (
        <div className="mb-5 flex flex-col gap-5">
          {comments.map((comment) => <CommentCard key={comment._id} comment={comment} taskId={taskId} />)}
        </div>
      )}

      <div>
        <RichTextEditor
          key="new-comment"
          placeholder="Write a comment…"
          onChange={(content, contentText) => setDraft({ content, contentText })}
        />
        <div className="mt-3 flex justify-end">
          <Button type="button" size="sm" disabled={!draft.contentText || createComment.isPending} onClick={submitComment}>
            <Send data-icon="inline-start" />
            {createComment.isPending ? "Posting…" : "Comment"}
          </Button>
        </div>
      </div>
    </section>
  );
};

const CommentCard = ({ comment, taskId }: { comment: TaskComment; taskId: string }) => {
  const { user } = useAuthContext();
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<CommentPayload>({ content: comment.content, contentText: comment.contentText });
  const isAuthor = user?._id === comment.author._id;
  const wasEdited = new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 1000;

  const saveComment = async () => {
    if (!draft.contentText) return;

    try {
      await updateComment.mutateAsync({ commentId: comment._id, payload: draft });
      setIsEditing(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update comment");
    }
  };

  const removeComment = async () => {
    try {
      await deleteComment.mutateAsync(comment._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete comment");
    }
  };

  return (
    <article className="flex gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">{initials(comment.author.displayName || comment.author.username)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-medium">{comment.author.displayName || comment.author.username}</span>
          <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
          {wasEdited && <span className="text-xs text-muted-foreground">edited</span>}
          {isAuthor && !isEditing && (
            <div className="ml-auto flex gap-1">
              <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Edit comment" title="Edit comment" onClick={() => setIsEditing(true)}>
                <Pencil />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="size-7" aria-label="Delete comment" title="Delete comment" disabled={deleteComment.isPending} onClick={removeComment}>
                <Trash2 />
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div>
            <RichTextEditor
              key={comment._id}
              initialContent={comment.content}
              placeholder="Edit your comment…"
              onChange={(content, contentText) => setDraft({ content, contentText })}
            />
            <div className="mt-3 flex justify-end gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button type="button" size="sm" disabled={!draft.contentText || updateComment.isPending} onClick={saveComment}>
                {updateComment.isPending ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        ) : (
          <CommentContent key={comment.updatedAt} content={comment.content} />
        )}
      </div>
    </article>
  );
};

export default TaskComments;
