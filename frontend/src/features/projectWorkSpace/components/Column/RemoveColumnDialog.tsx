import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Info, MoveRight, Trash2, X } from "lucide-react"
import { useMemo, useState } from "react"

const RemoveColumnDialog = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedMoveToColumn, setSelectedMoveToColumn] = useState("");
    const [isRemoving, setIsRemoving] = useState(false);

    const exampleColumnToRemove = {
        id: "col-1",
        title: "In Progress",
        color: "bg-yellow-400",
        taskCount: 3,
    };

    const exampleAvailableColumns = [
        {
            id: "col-1",
            title: "In Progress",
            color: "bg-yellow-400",
            taskCount: 3,
        },
        {
            id: "col-2",
            title: "Done",
            color: "bg-green-400",
            taskCount: 5,
        },
        {
            id: "col-3",
            title: "Backlog",
            color: "bg-gray-400",
            taskCount: 2,
        },
    ];

    const columnToRemove = exampleColumnToRemove;
    const availableColumns = exampleAvailableColumns;

    const selectedColumn = useMemo(() => {
        return availableColumns.find((c) => c.id === selectedMoveToColumn);
    }, [selectedMoveToColumn, availableColumns]);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="max-w-lg gap-0">
                <DialogHeader className="pb-4">
                    <DialogTitle className="flex items-center gap-2 text-red-700">
                        Remove Column
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">

                    <Alert className="border-red-200 bg-red-50 p-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 text-red-600" />
                        <AlertDescription className="text-red-800">
                            <strong>Warning:</strong> This action cannot be undone. The column will be permanently removed from your
                            board.
                        </AlertDescription>
                    </Alert>

                    <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">Column to be removed:</h4>
                        <div className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-4 h-4 rounded ${columnToRemove.color}`} />
                                    <div>
                                        <h5 className="font-medium text-gray-900">{columnToRemove.title}</h5>
                                        <p className="text-sm text-gray-600">
                                            {columnToRemove.taskCount} {columnToRemove.taskCount === 1 ? "task" : "tasks"}
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="destructive" className="bg-red-100 text-red-800">
                                    Will be deleted
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {columnToRemove.taskCount > 0 && (
                        <>
                            <Separator />
                            <div className="space-y-4">
                                <div className="flex items-start gap-2">
                                    <Info className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-1">Move existing tasks</h4>
                                        <p className="text-sm text-gray-600">
                                            Select a destination column for the {columnToRemove.taskCount}{" "}
                                            {columnToRemove.taskCount === 1 ? "task" : "tasks"} currently in "{columnToRemove.title}".
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label htmlFor="move-to-column" className="text-sm font-medium text-gray-700">
                                        Move tasks to:
                                    </label>
                                    <Select value={selectedMoveToColumn} onValueChange={setSelectedMoveToColumn}>
                                        <SelectTrigger id="move-to-column">
                                            <SelectValue placeholder="Select destination column" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableColumns
                                            .filter((col) => col.id !== columnToRemove.id)
                                            .map((column) => (
                                                <SelectItem key={column.id} value={column.id}>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-3 h-3 rounded ${column.color}`} />
                                                        <span>{column.title}</span>
                                                        <span className="text-xs text-gray-500">({column.taskCount} tasks)</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {selectedColumn && (
                                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                                        <div className="flex items-center gap-2 text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded ${columnToRemove.color}`} />
                                                <span className="font-medium">{columnToRemove.title}</span>
                                                <span className="text-gray-600">({columnToRemove.taskCount} tasks)</span>
                                            </div>
                                            <MoveRight className="w-4 h-4 text-blue-600" />
                                            <div className="flex items-center gap-2">
                                                <div className={`w-3 h-3 rounded ${selectedColumn.color}`} />
                                                <span className="font-medium">{selectedColumn.title}</span>
                                                <span className="text-gray-600">
                                                    ({selectedColumn.taskCount + columnToRemove.taskCount} tasks after move)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {columnToRemove.taskCount === 0 && (
                        <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 text-sm text-green-800">
                                <Info className="w-4 h-4" />
                                <span>This column is empty and can be safely removed without affecting any tasks.</span>
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isRemoving} className="flex-1 bg-transparent">
                            Cancel
                        </Button>
                        <Button
                        onClick={() => undefined}
                        disabled={isRemoving || (columnToRemove.taskCount > 0 && !selectedMoveToColumn)}
                        variant="destructive"
                        className="flex-1"
                        >
                            {isRemoving ? (
                                <LoadingSpinner />
                            ) : (
                                <>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Remove Column
                                </>
                            )}
                        </Button>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    )
}

export default RemoveColumnDialog