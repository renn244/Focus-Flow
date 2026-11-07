import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/context/authContext";
import { formatDistanceToNow } from "date-fns";
import { History, Pencil, Send, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useComments, useCreateComment, useDeleteComment, useUpdateComment } from "../../../hooks/Comment/useComments";
import { useTaskActivity } from "../../../hooks/Audit/useProjectActivity";
import type { ProjectActivityItem } from "../../../types/audit";
import type { CommentPayload, TaskComment } from "../../../types/comment";
import CommentContent from "./CommentContent";
import RichTextEditor from "./RichTextEditor";
import ListLoading from "@/components/common/ListLoading";

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
  const taskActivity = useTaskActivity(taskId);
  const createComment = useCreateComment(taskId);
  const [draft, setDraft] = useState<CommentPayload>(emptyComment);
  const discussionItems = [
    ...comments.map((comment) => ({ type: "comment" as const, createdAt: comment.createdAt, item: comment })),
    ...((taskActivity.data?.pages.flatMap((page) => page.items) ?? [])
      .filter((item) => item.action !== "comment.created")
      .map((item) => ({ type: "event" as const, createdAt: item.createdAt, item }))),
  ].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

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

      {isLoading || taskActivity.isLoading ? (
        <ListLoading className="mb-5" label="Loading task activity" avatar />
      ) : isError ? (
        <p className="text-sm text-destructive">Comments could not be loaded. Please try again.</p>
      ) : discussionItems.length === 0 ? (
        <div className="mb-5 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          Start the conversation. Updates and decisions for this task live here.
        </div>
      ) : (
        <div className="mb-5 flex flex-col gap-5">
          {discussionItems.map((entry) => entry.type === "comment"
            ? <CommentCard key={entry.item._id} comment={entry.item} taskId={taskId} />
            : <ActivityEvent key={entry.item._id} item={entry.item} />)}
        </div>
      )}

      {taskActivity.hasNextPage && (
        <Button type="button" variant="outline" size="sm" className="mb-5" onClick={() => taskActivity.fetchNextPage()} disabled={taskActivity.isFetchingNextPage}>
          <History data-icon="inline-start" />
          {taskActivity.isFetchingNextPage ? "Loading…" : "Load earlier activity"}
        </Button>
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

const ActivityEvent = ({ item }: { item: ProjectActivityItem }) => (
  <article className="ml-11 py-2">
    <div className="flex items-baseline gap-3">
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{item.actor.displayName || item.actor.username}</span>{" "}
        <span className="text-muted-foreground">{item.summary}</span>
      </p>
      <time className="text-xs text-muted-foreground" dateTime={item.createdAt}>
        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
      </time>
    </div>
    {item.changes.length > 0 && (
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {item.changes.map((change) => `${change.field}: ${change.from || "—"} → ${change.to || "—"}`).join(" · ")}
      </p>
    )}
    {item.changedFields.length > 0 && item.changes.length === 0 && (
      <p className="mt-0.5 truncate text-xs text-muted-foreground">Changed: {item.changedFields.join(", ")}</p>
    )}
  </article>
);

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
