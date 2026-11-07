export type AuditActor = {
  _id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};

export type ProjectActivityItem = {
  _id: string;
  projectId: string;
  action: string;
  entityType: "project" | "team_member" | "task" | "comment" | "attachment" | "note";
  entityId: string;
  taskId?: string;
  summary: string;
  changedFields: string[];
  changes: Array<{
    field: string;
    from?: string;
    to?: string;
  }>;
  createdAt: string;
  actor: AuditActor;
};

export type ProjectActivityPage = {
  items: ProjectActivityItem[];
  nextCursor: string | null;
};
