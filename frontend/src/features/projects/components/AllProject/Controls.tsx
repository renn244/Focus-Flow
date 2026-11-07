import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Grid3X3, List, Plus } from "lucide-react"
import useProjectDialogStore from "../../store/useProjectDialog"
import useProjectFilterStore from "../../store/useProjectFilter"
import useViewModeStore from "../../store/useViewMode.store"

const Controls = () => {
    const { viewMode, setViewMode } = useViewModeStore();
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const filterStatus = useProjectFilterStore((state) => state.filterStatus);
    const setFilterStatus = useProjectFilterStore((state) => state.setFilterStatus);
    const filterPriority = useProjectFilterStore((state) => state.filterPriority);
    const setFilterPriority = useProjectFilterStore((state) => state.setFilterPriority);

    return (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
            <div className="flex items-center gap-4">

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32 bg-card" aria-label="Filter by status">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>
                    
                    <Select value={filterPriority} onValueChange={setFilterPriority}>
                        <SelectTrigger className="w-32 bg-card" aria-label="Filter by priority">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Priority</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* DO LATER!!! */}
                    {/* <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="name">Name</SelectItem>
                            <SelectItem value="progress">Progress</SelectItem>
                            <SelectItem value="dueDate">Due Date</SelectItem>
                            <SelectItem value="lastActivity">Last Activity</SelectItem>
                        </SelectContent>
                    </Select> */}
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={() => setCreateOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                </Button>
                <Button variant={viewMode === "grid" ? "secondary" : "ghost"} size="icon" className="size-9" aria-label="Grid view" aria-pressed={viewMode === "grid"} title="Grid view" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "list" ? "secondary" : "ghost"} size="icon" className="size-9" aria-label="List view" aria-pressed={viewMode === "list"} title="List view" onClick={() => setViewMode("list")}>
                    <List className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export default Controls
