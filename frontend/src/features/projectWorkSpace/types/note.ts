import type { JSONContent } from "@tiptap/core";

export type NoteUser = {
  _id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
};

export type NoteSummary = {
  _id: string;
  projectId: string;
  title: string;
  excerpt: string;
  pinned: boolean;
  taskIds: string[];
  createdBy: NoteUser;
  updatedBy: NoteUser;
  createdAt: string;
  updatedAt: string;
};

export type Note = NoteSummary & {
  content: JSONContent;
  canDelete: boolean;
};

export type NoteUpdatePayload = {
  title?: string;
  content?: JSONContent;
  contentText?: string;
  pinned?: boolean;
};

export type TaskNoteRef = {
  _id: string;
  title: string;
  updatedAt: string;
};
