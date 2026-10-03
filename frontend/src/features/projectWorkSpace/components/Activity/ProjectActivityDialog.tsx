import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { formatDistanceToNow } from "date-fns";
import { FileText, FolderKanban, History, MessageSquareText, UsersRound } from "lucide-react";
import { useState } from "react";
import { useProjectIdStore } from "../../store/useProjectId";
import { useProjectActivity } from "../../hooks/Audit/useProjectActivity";
import type { ProjectActivityItem } from "../../types/audit";

const activityIcon = {
  project: FolderKanban,
  team_member: UsersRound,
  task: History,
  comment: MessageSquareText,
  attachment: FileText,
} as const;

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const ProjectActivityDialog = () => {
  const projectId = useProjectIdStore((state) => state.projectId);
  const [open, setOpen] = useState(false);
  const activity = useProjectActivity(open ? projectId : null);
  const items = activity.data?.pages.flatMap((page) => page.items) ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="ghost" size="sm" className="text-slate-600" onClick={() => setOpen(true)}>
        <History className="size-4" />
        Activity
      </Button>
      <DialogContent className="max-h-[80vh] max-w-2xl gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-5">
          <DialogTitle>Project activity</DialogTitle>
          <DialogDescription>Changes made by project members, newest first.</DialogDescription>
        </DialogHeader>

        <div className="max-h-[calc(80vh-8rem)] overflow-y-auto px-6 py-2">
          {activity.isLoading ? (
            <div className="flex h-40 items-center justify-center"><LoadingSpinner /></div>
          ) : activity.isError ? (
            <p className="py-8 text-sm text-destructive">Activity could not be loaded. Please try again.</p>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <History className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">No activity yet</p>
              <p className="mt-1 text-sm text-muted-foreground">Project changes will appear here.</p>
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item) => <ActivityRow key={item._id} item={item} />)}
            </div>
          )}

          {activity.hasNextPage && (
            <div className="py-4 text-center">
              <Button variant="outline" size="sm" onClick={() => activity.fetchNextPage()} disabled={activity.isFetchingNextPage}>
                {activity.isFetchingNextPage ? "Loading…" : "Load older activity"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ActivityRow = ({ item }: { item: ProjectActivityItem }) => {
  const Icon = activityIcon[item.entityType];
  const actorName = item.actor.displayName || item.actor.username;

  return (
    <article className="flex gap-3 py-4">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-sm font-medium">{item.summary}</p>
          <time className="shrink-0 text-xs text-muted-foreground" dateTime={item.createdAt}>
            {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
          </time>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Avatar className="size-5">
            <AvatarImage src={item.actor.avatarUrl} alt="" />
            <AvatarFallback className="text-[8px]">{initials(actorName)}</AvatarFallback>
          </Avatar>
          <span>{actorName}</span>
          {item.changedFields.length > 0 && item.changes.length === 0 && (
            <Badge variant="secondary" className="font-normal">Changed: {item.changedFields.join(", ")}</Badge>
          )}
        </div>
        {item.changes.length > 0 && (
          <dl className="mt-2 space-y-1 text-xs text-muted-foreground">
            {item.changes.map((change) => (
              <div key={change.field} className="flex flex-wrap gap-x-1.5">
                <dt className="font-medium text-foreground">{change.field}:</dt>
                <dd>{change.from || "—"} <span aria-hidden="true">→</span> {change.to || "—"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </article>
  );
};

export default ProjectActivityDialog;
