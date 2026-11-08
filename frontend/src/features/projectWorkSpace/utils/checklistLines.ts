/** Splits pasted text into one checklist item per non-empty line, dropping list markers like "-", "*", "•" or "[ ]". */
export const toChecklistLines = (text: string) =>
  text.split(/\r?\n/).map((line) => line.replace(/^\s*(?:[-*•]|\[[ xX]?\])\s*/, "").trim()).filter(Boolean);
