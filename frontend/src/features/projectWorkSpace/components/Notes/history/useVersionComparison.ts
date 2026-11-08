import { useMemo } from "react";
import { useNoteVersion } from "../../../hooks/Note/useNoteVersions";
import type { Note, NoteVersionContent, NoteVersionSummary } from "../../../types/note";
import { diffNotes, diffText } from "../../../utils/noteDiff";

/** Picker value for the live note, as opposed to a saved version's id. */
export const CURRENT = "current";

/**
 * Works out what to show for the picked entry and what to compare it with:
 * the live note against the newest version, or a version against the one before it.
 */
export const useVersionComparison = (note: Note, versions: NoteVersionSummary[], selected: string) => {
  const isCurrent = selected === CURRENT;
  const picked = versions.find((version) => version._id === selected);
  const { data: version, isLoading } = useNoteVersion(note._id, isCurrent ? versions[0]?._id ?? null : selected);

  const shown: NoteVersionContent | undefined = isCurrent
    ? { title: note.title, content: note.content }
    : version && { title: version.title, content: version.content };
  const baseline: NoteVersionContent | undefined = isCurrent
    ? version && { title: version.title, content: version.content }
    : version?.previous ?? undefined;

  const shownContent = shown?.content;
  const baselineContent = baseline?.content;
  const diff = useMemo(
    () => (shownContent && baselineContent ? diffNotes(baselineContent, shownContent) : null),
    [shownContent, baselineContent]
  );
  const titleParts = shown && baseline && shown.title !== baseline.title ? diffText(baseline.title, shown.title) : null;
  const nothingChanged = diff !== null && !titleParts && diff.every((block) => block.type === "same");

  return { isCurrent, picked, shown, baseline, diff, titleParts, nothingChanged, isLoading };
};
