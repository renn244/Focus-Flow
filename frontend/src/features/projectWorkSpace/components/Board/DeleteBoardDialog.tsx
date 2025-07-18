import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { AlertTriangle, Calendar, FileText, Target, Trash2, Users } from "lucide-react"
import { useState } from "react"
import useBoardDialogStore from "../../store/useBoardDialog"
import { useDeleteBoardMutation } from "../../hooks/Board/useDeleteBoardMutation" 
import { useGetBoardById } from "../../hooks/Board/useGetBoardById" 
import type { BoardWithColumns } from "../../type"
import { format } from "date-fns"

const DeleteBoardDialog = () => {
    const isDeleteOpen = useBoardDialogStore((state) => state.isDeleteOpen);
    const setDeleteOpen = useBoardDialogStore((state) => state.setDeleteOpen);
    const deleteBoardId = useBoardDialogStore((state) => state.deleteBoardId);

    const { data: boardToDelete, isLoading, error } = useGetBoardById(deleteBoardId || "");

    return (
        <Dialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="md:max-w-2xl w-[700px] max-h-[90vh] overflow-y-auto">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <>Something went wrong</>
                )}
                {(!boardToDelete && !isLoading && !error) && (
                    <>Not Found</>
                )}
                {boardToDelete && (
                    <DeleteBoard boardToDelete={boardToDelete} />
                )}
            </DialogContent>
        </Dialog>
    )
}

type DeleteBoardProps = {
    boardToDelete: BoardWithColumns;
}

export const DeleteBoard = ({
    boardToDelete,
}: DeleteBoardProps) => {
    const [confirmationText, setConfirmationText] = useState("");
    const setDeleteOpen = useBoardDialogStore((state) => state.setDeleteOpen);
    const deleteBoardId = useBoardDialogStore((state) => state.deleteBoardId);

    const { mutateAsync, isPending } = useDeleteBoardMutation(deleteBoardId || "");

    const isConfirmationValid = confirmationText === boardToDelete?.name
    const canProceed = isConfirmationValid // Add any additional conditions if needed
    
    const tasksCount = boardToDelete.columns.reduce((count, column) => count + column.tasks.length, 0)
    const columnCount = boardToDelete.columns.length;

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-700">
                    <Trash2 className="h-5 w-5" />
                    Delete Board
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="font-semibold text-red-800 mb-1">This action cannot be undone</h3>
                            <p className="text-sm text-red-700">
                                Deleting this board will permanently remove all associated data. Choose carefully how to handle
                                existing content.
                            </p>
                        </div>
                    </div>
                </div>

                <Card className="border-red-200 py-0">
                    <CardContent className="p-2">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                <Target className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 mb-1">{boardToDelete.name}</h3>
                                <p className="text-sm text-gray-600 mb-3">{boardToDelete.description}</p>
                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <FileText className="w-4 h-4" />
                                        <span>{tasksCount || 0} tasks</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Target className="w-4 h-4" />
                                        <span>{columnCount || 0} columns</span>
                                    </div>
                                    {/* <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>{boardToDelete.teamMembers || 0} members</span>
                                    </div> */}
                                    {boardToDelete.createdAt && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Created {format(new Date(boardToDelete.createdAt), 'MMM dd, yyyy')}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900">What should happen to existing tasks and data?</h4>
                    <RadioGroup value={selectedAction} onValueChange={(value: "move" | "delete") => setSelectedAction(value)}>
                    
                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="move" id="move" />
                        <Label htmlFor="move" className="font-medium">
                            Move all content to another board
                        </Label>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Recommended
                        </Badge>
                        </div>
                        {selectedAction === "move" && (
                        <div className="ml-6 space-y-3">
                            <p className="text-sm text-gray-600">
                            All tasks, columns, and settings will be transferred to the selected board. This preserves all
                            your work.
                            </p>
                            <div>
                            <Label htmlFor="target-board">Select destination board:</Label>
                            <Select value={targetBoardId} onValueChange={setTargetBoardId}>
                                <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Choose a board..." />
                                </SelectTrigger>
                                <SelectContent>
                                {otherBoards.map((board) => (
                                    <SelectItem key={board.id} value={board.id}>
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                        <div className="font-medium">{board.name}</div>
                                        <div className="text-xs text-gray-500">{board.description}</div>
                                        </div>
                                        <div className="text-xs text-gray-400 ml-4">{board.taskCount || 0} tasks</div>
                                    </div>
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                            </div>
                            {selectedTargetBoard && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <Badge variant="outline" className="bg-red-50 text-red-700">
                                    {boardToDelete.name}
                                    </Badge>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                    <Badge variant="outline" className="bg-green-50 text-green-700">
                                    {selectedTargetBoard.name}
                                    </Badge>
                                </div>
                                </div>
                                <p className="text-xs text-blue-700 mt-2">
                                {boardToDelete.taskCount || 0} tasks and {boardToDelete.columnCount || 0} columns will be
                                moved to "{selectedTargetBoard.name}"
                                </p>
                            </div>
                            )}
                        </div>
                        )}
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                        <RadioGroupItem value="delete" id="delete" />
                        <Label htmlFor="delete" className="font-medium text-red-700">
                            Delete everything permanently
                        </Label>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Destructive
                        </Badge>
                        </div>
                        {selectedAction === "delete" && (
                        <div className="ml-6">
                            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-sm text-red-700 mb-2">
                                <strong>This will permanently delete:</strong>
                            </p>
                            <ul className="text-sm text-red-700 space-y-1">
                                <li>• All {boardToDelete.taskCount || 0} tasks and their data</li>
                                <li>• All {boardToDelete.columnCount || 0} columns and configurations</li>
                                <li>• All comments, attachments, and history</li>
                                <li>• All team member assignments and permissions</li>
                                <li>• All board settings and customizations</li>
                            </ul>
                            </div>
                        </div>
                        )}
                    </div>
                    
                    </RadioGroup>
                </div> */}

                {/* {otherBoards.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h4 className="font-medium text-yellow-800">No other boards available</h4>
                                <p className="text-sm text-yellow-700 mt-1">
                                    This is the only board in your project. Deleting it will remove all tasks and data permanently.
                                    Consider creating a new board first if you want to preserve your work.
                                </p>
                            </div>
                        </div>
                    </div>
                )} */}

                <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-900">
                        Type <span className="font-mono bg-gray-100 px-1 rounded">{boardToDelete.name}</span> to confirm:
                    </h4>
                    <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Enter board name"
                    className={`${
                        confirmationText && !isConfirmationValid ? "border-red-300 focus:border-red-500 focus:ring-red-500" : ""
                    }`}
                    />
                    {confirmationText && !isConfirmationValid && (
                        <p className="text-sm text-red-600">Board name doesn't match</p>
                    )}
                </div>

                {/* {canProceed && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Summary of changes:</h4>
                        <div className="text-sm text-gray-700 space-y-1">
                            {selectedAction === "move" && selectedTargetBoard ? (
                                <>
                                    <p>Board "{boardToDelete.name}" will be deleted</p>
                                    <p>
                                        All {boardToDelete.taskCount || 0} tasks will be moved to "{selectedTargetBoard.name}"
                                    </p>
                                    <p>All {boardToDelete.columnCount || 0} columns will be transferred</p>
                                    <p>Team member access will be preserved</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-red-700">Board "{boardToDelete.name}" will be permanently deleted</p>
                                    <p className="text-red-700">All {boardToDelete.taskCount || 0} tasks will be lost forever</p>
                                    <p className="text-red-700">All data and history will be permanently removed</p>
                                </>
                            )}
                        </div>
                    </div>
                )} */}

                <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setDeleteOpen(false)} 
                    className="flex-1 bg-transparent" 
                    disabled={isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive"
                    onClick={() => mutateAsync()}
                    disabled={!canProceed || isPending}
                    className={`flex-1 disabled:opacity-50`}
                    >
                        {isPending ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4" />
                                Delete
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default DeleteBoardDialog