export type TaskAttachment = {
  _id: string;
  taskId: string;
  projectId: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  author: {
    _id: string;
    username: string;
    displayName?: string;
  };
};
