import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Info, MoveRight, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useGetColumnByBoardId } from "../../hooks/useGetColumnByBoardId"
import { useGetColumnById } from "../../hooks/useGetColumnById"
import { useRemoveColumnMutation } from "../../hooks/useRemoveColumnMutation"
import useColumnDialogStore from "../../store/useColumnDialog"
import useSelectBoardStore from "../../store/useSelectBoard"
import type { Column } from "../../type"

const RemoveColumnDialog = () => {
    const isRemoveOpen = useColumnDialogStore((state) => state.isRemoveOpen);
    const setRemoveOpen = useColumnDialogStore((state) => state.setRemoveOpen);
    const removeColumnId = useColumnDialogStore((state) => state.removeColumnId);

    const { data: columnToRemove, isLoading, error } = useGetColumnById(removeColumnId);

    if(isRemoveOpen === false || !removeColumnId) {
        return null;
    }

    return (
        <Dialog open={isRemoveOpen} onOpenChange={setRemoveOpen}>
            <DialogContent className="max-w-lg gap-0">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <>Something went wrong</>
                )}
                {(!columnToRemove && !isLoading && !error) && (
                    <>Not Found</>
                )}
                {columnToRemove && (
                    <RemoveColumn 
                    columnToRemove={columnToRemove}
                    />
                )}
            </DialogContent>
        </Dialog>
    )
}

type RemoveColumnProps = {
    columnToRemove: Column
}

const RemoveColumn = ({
    columnToRemove,
}: RemoveColumnProps) => {
    const [selectedMoveToColumn, setSelectedMoveToColumn] = useState("");
    const removeColumnId = useColumnDialogStore((state) => state.removeColumnId);
    const setRemoveOpen = useColumnDialogStore((state) => state.setRemoveOpen);

    const selectBoardId = useSelectBoardStore((state) => state.selectedBoardId);

    const { data: columns } = useGetColumnByBoardId(selectBoardId || "");
    const { mutateAsync: removeColumn, isPending: isRemoving } = useRemoveColumnMutation(removeColumnId || "");

    const selectedColumn = useMemo(() => {
        return columns?.find((c) => c._id === selectedMoveToColumn);
    }, [selectedMoveToColumn, columns]);

    return (
        <>
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
                                <div className={`w-4 h-4 rounded ${columnToRemove?.color}`} />
                                <div>
                                    <h5 className="font-medium text-gray-900">{columnToRemove?.title}</h5>
                                    <p className="text-sm text-gray-600">
                                        {columnToRemove.tasks.length} {columnToRemove.tasks.length === 1 ? "task" : "tasks"}
                                    </p>
                                </div>
                            </div>
                            <Badge variant="destructive" className="bg-red-100 text-red-800">
                                Will be deleted
                            </Badge>
                        </div>
                    </div>
                </div>

                {columnToRemove.tasks.length > 0 && (
                    <>
                        <Separator />
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Info className="w-4 h-4 text-blue-600 mt-1 flex-shrink-0" />
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">Move existing tasks</h4>
                                    <p className="text-sm text-gray-600">
                                        Select a destination column for the {columnToRemove.tasks.length}{" "}
                                        {columnToRemove.tasks.length === 1 ? "task" : "tasks"} currently in "{columnToRemove.title}".
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
                                        {columns
                                        ?.filter((col) => col._id !== columnToRemove._id)
                                        .map((column) => (
                                            <SelectItem key={column._id} value={column._id}>
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-3 h-3 rounded ${column.color}`} />
                                                    <span>{column.title}</span>
                                                    <span className="text-xs text-gray-500">({column.tasks.length} tasks)</span>
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
                                            <span className="text-gray-600">({columnToRemove.tasks.length} tasks)</span>
                                        </div>
                                        <MoveRight className="w-4 h-4 text-blue-600" />
                                        <div className="flex items-center gap-2">
                                            <div style={{ backgroundColor: selectedColumn.color }} className={`w-3 h-3 rounded`} />
                                            <span className="font-medium">{selectedColumn.title}</span>
                                            <span className="text-gray-600">
                                                ({selectedColumn.tasks.length + columnToRemove.tasks.length} tasks after move)
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {columnToRemove.tasks.length === 0 && (
                    <div className="bg-green-50 rounded-lg p-1.5 border border-green-200">
                        <div className="flex items-start gap-1 text-sm text-green-800">
                            <Info className="w-4 h-4 mt-0.5" />
                            <span>This column is empty and can be safely removed without affecting any tasks.</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <Button variant="outline" onClick={() => setRemoveOpen(false)} disabled={isRemoving} className="flex-1 bg-transparent">
                        Cancel
                    </Button>
                    <Button
                    onClick={() => removeColumn()}
                    disabled={isRemoving || (columnToRemove.tasks.length > 0 && !selectedMoveToColumn)}
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
        </>
    )
}

export default RemoveColumnDialog