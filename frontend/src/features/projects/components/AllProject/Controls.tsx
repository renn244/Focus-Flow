import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Archive, Download, Grid3X3, List, Plus } from "lucide-react"
import useViewModeStore from "../../store/useViewMode.store"
import useSelectedProjectStore from "../../store/useSelectedProject.store"
import useProjectFilterStore from "../../store/useProjectFilter"
import useProjectDialogStore from "../../store/useProjectDialog"

const Controls = () => {
    const { viewMode, setViewMode } = useViewModeStore();
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const filterStatus = useProjectFilterStore((state) => state.filterStatus);
    const setFilterStatus = useProjectFilterStore((state) => state.setFilterStatus);
    const selectedProjects = useSelectedProjectStore((state) => state.selectedProjects);

    return (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                {selectedProjects.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{selectedProjects.length} selected</span>
                        <Button variant="outline" size="sm">
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                        </Button>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                    </div>
                )}

                {/* Filters */}
                <div className="flex items-center gap-2">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                        <SelectTrigger className="w-32">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="on-hold">On Hold</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
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
                <Button variant={viewMode === "grid" ? "default" : "outline"} size="sm" onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button variant={viewMode === "list" ? "default" : "outline"} size="sm" onClick={() => setViewMode("list")}>
                    <List className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

export default Controls