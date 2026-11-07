import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuthContext } from "@/context/authContext";
import { formatDistanceToNow } from "date-fns";
import { Download, FileText, LoaderCircle, Paperclip, Trash2, Upload } from "lucide-react";
import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { downloadAttachment, getAttachmentBlob, useAttachments, useDeleteAttachment, useUploadAttachment } from "../../../hooks/Attachment/useAttachments";
import type { TaskAttachment } from "../../../types/attachment";
import ListLoading from "@/components/common/ListLoading";

const allowedFileTypes = ".pdf,.jpg,.jpeg,.png,.webp,.txt,.docx";
const maxFileSize = 5 * 1024 * 1024;

const fileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
};

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const isImage = (attachment: TaskAttachment) => attachment.mimeType.startsWith("image/");

const TaskAttachments = ({ taskId, standalone = false }: { taskId: string; standalone?: boolean }) => {
  const { data: attachments = [], isLoading, isError } = useAttachments(taskId);
  const uploadAttachment = useUploadAttachment(taskId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectFile = () => fileInputRef.current?.click();

  const uploadFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!file) return;
    if (file.size > maxFileSize) {
      toast.error("Files must be 5 MB or smaller");
      return;
    }

    try {
      await uploadAttachment.mutateAsync(file);
      toast.success(`${file.name} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload attachment");
    }
  };

  return (
    <section className={standalone ? undefined : "mt-6 border-t pt-5"}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-medium">Attachments</h3>
          <p className="mt-1 text-sm text-muted-foreground">Share supporting documents and images for this task.</p>
        </div>
        <input ref={fileInputRef} className="sr-only" type="file" accept={allowedFileTypes} onChange={uploadFile} />
        <Button type="button" size="sm" onClick={selectFile} disabled={uploadAttachment.isPending}>
          {uploadAttachment.isPending ? <LoaderCircle data-icon="inline-start" className="animate-spin" /> : <Upload data-icon="inline-start" />}
          {uploadAttachment.isPending ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {isLoading ? (
        <ListLoading className="mt-4" label="Loading attachments" rows={2} />
      ) : isError ? (
        <p className="mt-4 text-sm text-destructive">Attachments could not be loaded. Please try again.</p>
      ) : attachments.length === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
          <Paperclip className="size-4 shrink-0" />
          No attachments yet.
        </div>
      ) : (
        <div className="mt-4 flex flex-col divide-y rounded-md border">
          {attachments.map((attachment) => <AttachmentRow key={attachment._id} attachment={attachment} taskId={taskId} />)}
        </div>
      )}
    </section>
  );
};

const AttachmentRow = ({ attachment, taskId }: { attachment: TaskAttachment; taskId: string }) => {
  const { user } = useAuthContext();
  const removeAttachment = useDeleteAttachment(taskId);
  const [isDownloading, setIsDownloading] = useState(false);
  const isAuthor = user?._id === attachment.author._id;
  const authorName = attachment.author.displayName || attachment.author.username;

  const download = async () => {
    try {
      setIsDownloading(true);
      await downloadAttachment(attachment);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to download attachment");
    } finally {
      setIsDownloading(false);
    }
  };

  const remove = async () => {
    try {
      await removeAttachment.mutateAsync(attachment._id);
      toast.success("Attachment removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove attachment");
    }
  };

  return (
    <article className="flex items-start gap-3 p-3">
      {isImage(attachment) ? (
        <AttachmentImagePreview attachment={attachment} />
      ) : (
        <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <FileText className="size-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium" title={attachment.originalName}>{attachment.originalName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span>{fileSize(attachment.size)}</span>
          <span>•</span>
          <Avatar className="size-4">
            <AvatarFallback className="text-[8px]">{initials(authorName)}</AvatarFallback>
          </Avatar>
          <span>{authorName}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button type="button" variant="ghost" size="icon" className="size-8" aria-label={`Download ${attachment.originalName}`} title="Download" disabled={isDownloading} onClick={download}>
          {isDownloading ? <LoaderCircle className="animate-spin" /> : <Download />}
        </Button>
        {isAuthor && (
          <Button type="button" variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" aria-label={`Remove ${attachment.originalName}`} title="Remove" disabled={removeAttachment.isPending} onClick={remove}>
            <Trash2 />
          </Button>
        )}
      </div>
    </article>
  );
};

const AttachmentImagePreview = ({ attachment }: { attachment: TaskAttachment }) => {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    let objectUrl: string | undefined;
    let isCurrent = true;

    getAttachmentBlob(attachment._id)
      .then((file) => {
        objectUrl = URL.createObjectURL(file);
        if (isCurrent) setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (isCurrent) setPreviewUrl(undefined);
      });

    return () => {
      isCurrent = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [attachment._id]);

  if (!previewUrl) {
    return (
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <LoaderCircle className="size-4 animate-spin" />
      </div>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="size-16 shrink-0 overflow-hidden rounded-md border bg-muted" aria-label={`Preview ${attachment.originalName}`}>
          <img src={previewUrl} alt="" className="size-full object-cover" loading="lazy" decoding="async" />
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="truncate pr-8">{attachment.originalName}</DialogTitle>
        </DialogHeader>
        <img src={previewUrl} alt={attachment.originalName} className="max-h-[70vh] w-full rounded-md object-contain" />
      </DialogContent>
    </Dialog>
  );
};

export default TaskAttachments;
