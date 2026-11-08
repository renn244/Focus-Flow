import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { NoteUser, NoteVersionSummary } from "../../../types/note";
import { countLabel, fullLabel, userName } from "./historyLabels";
import { CURRENT } from "./useVersionComparison";

type Props = {
  versions: NoteVersionSummary[];
  currentBy: NoteUser;
  selected: string;
  meId?: string;
  onSelect: (id: string) => void;
};

/** On narrow screens the version list becomes this menu above the note. */
const VersionSelect = ({ versions, currentBy, selected, meId, onSelect }: Props) => (
  <div className="mb-3 @4xl:hidden">
    <Select value={selected} onValueChange={onSelect}>
      <SelectTrigger className="w-full bg-card" aria-label="Version">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={CURRENT}>Current version · {userName(currentBy, meId)}</SelectItem>
        {versions.map((item) => (
          <SelectItem key={item._id} value={item._id}>
            {fullLabel(item.savedAt)} · {userName(item.savedBy, meId)} · {countLabel(item)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default VersionSelect;
