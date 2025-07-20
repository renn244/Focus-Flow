import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import { Separator } from "@/components/ui/separator"
import { AlertTriangle, Database, FileX, Trash2, Users, X } from "lucide-react"
import useProjectDialogStore from "../../store/useProjectDialog"
import { useGetProjectById } from "../../hooks/useGetProjectById"
import { useState } from "react"
import { useDeleteProjectMutation } from "../../hooks/useDeleteProjectMutation"
import type { ProjectWithOwner } from "../../type"
import SomethingWentWrongDialog from "@/components/common/Dialog/SomethingWentWrong-Dialog"
import NotFoundDialog from "@/components/common/Dialog/NotFound-Dialog"


const DeleteProjectDialog = () => {
    const isDeleteOpen = useProjectDialogStore((state) => state.isDeleteOpen);
    const deleteProjectId = useProjectDialogStore((state) => state.deleteProjectId);
    const setDeleteOpen = useProjectDialogStore((state) => state.setDeleteOpen);

    const { data: project, isLoading, error, refetch, isRefetching } = useGetProjectById(deleteProjectId || "");

    return (
        <Dialog open={isDeleteOpen} onOpenChange={setDeleteOpen}>
            <DialogContent className="sm:max-w-[600px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <SomethingWentWrongDialog
                    onBack={() => setDeleteOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    />
                )}
                {(!project && !isLoading && !error) && (
                    <NotFoundDialog
                    onBack={() => setDeleteOpen(false)}
                    onRetry={refetch} retryLoading={isRefetching}
                    title="Project Not Found"
                    />
                )}
                {project && (
                    <DeleteProject project={project} />
                )}
            </DialogContent>
        </Dialog>
    )
}

const DeleteProject = ({ project }: { project: ProjectWithOwner }) => {
    const setDeleteOpen = useProjectDialogStore((state) => state.setDeleteOpen);
    const [confirmationText, setConfirmationText] = useState("");

    const { mutate: onConfirm, isPending: isDeleting } = useDeleteProjectMutation(project._id);
    const isConfirmationValid = confirmationText === project.name;

    return (
        <>
            <DialogHeader>
                <DialogTitle>Delete Project</DialogTitle>
            </DialogHeader>
            
            <div className="w-full max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 p-3 rounded-lg bg-red-100 flex items-center justify-center">
                        <Trash2 className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Delete Project</h2>
                        <p className="text-sm text-gray-600">Permanently remove project and all data</p>
                    </div>
                </div>

                <Alert className="mb-4 border-red-200 bg-red-50">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-red-600" />
                    <AlertDescription className="text-red-800">
                        <strong>Warning:</strong> This action cannot be undone. All project data, files, and history will be
                        permanently deleted.
                    </AlertDescription>
                </Alert>

                <div className="bg-gray-50 rounded-lg p-2 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded ${project.color} flex items-center justify-center`}>
                            <Trash2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{project.name}</h3>
                            <p className="text-sm text-gray-600 line-clamp-1">{project.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs">
                            {project.completedTasks}/{project.totalTasks} tasks
                        </Badge>
                        {/* <Badge variant="outline" className="text-xs">
                            {project.team.length} members
                        </Badge> */}
                        <Badge variant="outline" className="text-xs capitalize">
                            {project.priority} priority
                        </Badge>
                    </div>
                </div>

                <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">What will be permanently deleted:</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <Database className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">All project data</p>
                                <p className="text-xs text-gray-600">Tasks, comments, attachments, and project history</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <FileX className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">All uploaded files</p>
                                <p className="text-xs text-gray-600">Documents, images, and other project assets</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 text-sm">
                            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
                                <Users className="w-4 h-4 text-red-600" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-900">Team access and permissions</p>
                                <p className="text-xs text-gray-600">All team members will lose access immediately</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* {project.team.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Team Members Who Will Lose Access ({project.team.length})
                        </h4>
                        <div className="flex items-center gap-2">
                            <div className="flex -space-x-2">
                                {project.team.slice(0, 5).map((member, index) => (
                                    <Avatar key={index} className="w-6 h-6 border-2 border-white">
                                        <AvatarImage src={member.avatar || "/placeholder.svg"} alt={member.name} />
                                        <AvatarFallback className="text-xs">{member.initials}</AvatarFallback>
                                    </Avatar>
                                ))}
                                {project.team.length > 5 && (
                                    <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                                    +{project.team.length - 5}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs text-gray-600">
                                {project.team
                                    .slice(0, 2)
                                    .map((m) => m.name)
                                    .join(", ")}
                                {project.team.length > 2 && ` and ${project.team.length - 2} others`}
                            </span>
                        </div>
                    </div>
                )} */}

                <Separator className="my-4" />

                <div className="mb-4">
                    <Label htmlFor="confirmation" className="text-sm font-medium text-gray-900">
                        Type <span className="font-mono bg-gray-100 px-1 rounded">{project.name}</span> to confirm deletion:
                    </Label>
                    <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={`Type "${project.name}" here`}
                    className="mt-2"
                    disabled={isDeleting}
                    />
                    {confirmationText && !isConfirmationValid && (
                        <p className="text-xs text-red-600 mt-1">Project name doesn't match</p>
                    )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                        <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm text-red-800">
                            <p className="font-medium">This action is irreversible</p>
                            <p className="text-xs mt-1">
                                Once deleted, you will not be able to recover this project, its data, or any associated files. Consider
                                archiving instead if you might need this data later.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting} className="flex-1 bg-transparent">
                        Cancel
                    </Button>
                    <Button
                    onClick={() => onConfirm()}
                    disabled={isDeleting || !isConfirmationValid}
                    variant="destructive"
                    className="flex-1"
                    >
                        {isDeleting ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Forever
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default DeleteProjectDialog