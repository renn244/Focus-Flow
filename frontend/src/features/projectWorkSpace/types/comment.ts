import type { JSONContent } from "@tiptap/core";

export type TaskComment = {
  _id: string;
  taskId: string;
  content: JSONContent;
  contentText: string;
  author: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type CommentPayload = {
  content: JSONContent;
  contentText: string;
};
