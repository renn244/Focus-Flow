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

export type NoteChangeCount = { added: number; removed: number };

export type NoteVersionSummary = NoteChangeCount & {
  _id: string;
  savedBy: NoteUser;
  savedAt: string;
};

export type NoteVersionList = {
  /** How the live note differs from the newest version. */
  current: NoteChangeCount;
  /** Newest first. */
  versions: NoteVersionSummary[];
};

export type NoteVersionContent = { title: string; content: JSONContent };

export type NoteVersion = NoteVersionContent & {
  _id: string;
  savedBy: NoteUser;
  savedAt: string;
  /** The version before this one, to compare against; null for the oldest. */
  previous: NoteVersionContent | null;
};
