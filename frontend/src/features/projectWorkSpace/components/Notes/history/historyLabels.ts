import { format, isToday, isYesterday } from "date-fns";
import type { NoteChangeCount, NoteUser, NoteVersionSummary } from "../../../types/note";

/** "You" for the signed-in person, otherwise their display name. */
export const userName = (user: NoteUser, meId?: string) => (user._id === meId ? "You" : user.displayName || user.username);

export const initials = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();

/** "Today", "Yesterday", or "Mon, Nov 3". */
export const dayLabel = (iso: string) => {
  const date = new Date(iso);
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return format(date, "EEE, MMM d");
};

/** "3:40 PM". */
export const timeLabel = (iso: string) => format(new Date(iso), "h:mm a");

/** "Today, 3:40 PM". */
export const fullLabel = (iso: string) => `${dayLabel(iso)}, ${timeLabel(iso)}`;

/** "+2 −1", or "no text changes". */
export const countLabel = ({ added, removed }: NoteChangeCount) =>
  [added > 0 && `+${added}`, removed > 0 && `−${removed}`].filter(Boolean).join(" ") || "no text changes";

/** Versions grouped under their day label, keeping newest-first order. */
export const groupByDay = (versions: NoteVersionSummary[]) => {
  const byDay = new Map<string, NoteVersionSummary[]>();
  for (const version of versions) {
    const day = dayLabel(version.savedAt);
    byDay.set(day, [...(byDay.get(day) ?? []), version]);
  }
  return [...byDay.entries()];
};
