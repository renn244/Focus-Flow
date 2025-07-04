import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Archive, Info } from "lucide-react";
import { useGetProjectById } from "../../hooks/useGetProjectById";
import useProjectDialogStore from "../../store/useProjectDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ArchivedProjectDialog = () => {
    const isArchiveOpen = useProjectDialogStore((state) => state.isArchiveOpen);
    const archiveProjectId = useProjectDialogStore((state) => state.archiveProjectId);
    const setArchiveOpen = useProjectDialogStore((state) => state.setArchiveOpen);

    const { data: project, isLoading, error } = useGetProjectById(archiveProjectId || "");

    return (
        <Dialog open={isArchiveOpen} onOpenChange={setArchiveOpen}>
            <DialogContent className="sm:max-w-[600px]">
                {isLoading && (
                    <div className="flex items-center justify-center h-64">
                        <LoadingSpinner />
                    </div>
                )}
                {error && (
                    <>Somethign went wrong</>
                )}
                {(!project && !isLoading && !error) && (
                    <>Not Found</>
                )}
                {project && (
                    <ArchivedProject project={project} />
                )}
            </DialogContent>
        </Dialog>
    )
}

const ArchivedProject = ({ project }: { project: any }) => {
    const setArchiveOpen = useProjectDialogStore((state) => state.setArchiveOpen);
    // put the proper hook here

    const archiveDate = new Date();
    const day30 = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    const deletionDate = new Date(archiveDate.getTime() + day30); // 30 days from now

    const onConfirm = () => undefined
    const isArchiving = false; // Replace with actual state if needed

    return (
        <>
            <DialogHeader>
                <DialogTitle>Archive Project</DialogTitle>
            </DialogHeader>
            <div className="w-full max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 p-3 rounded-lg bg-orange-100 flex items-center justify-center">
                        <Archive className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Archive Project</h2>
                        <p className="text-sm text-gray-600">Move project to archive</p>
                    </div>
                </div>

                <div className="bg-gray-50 rounded-md p-2 mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded ${project.color} flex items-center justify-center`}>
                            <Archive className="w-5 h-5 text-white" />
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

                <Alert className="mb-4 border-orange-200 bg-orange-50">
                    <AlertTriangle className="h-5 w-5 mt-0.5 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <strong>Important:</strong> Archived projects will be automatically deleted after 30 days and cannot be
                        recovered.
                    </AlertDescription>
                </Alert>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Archive Date:</span>
                        <span className="font-medium">
                            {archiveDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Automatic Deletion:</span>
                        <span className="font-medium text-red-600">
                            {deletionDate.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                            })}
                        </span>
                    </div>

                    <Separator />

                    <div className="bg-blue-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">What happens when you archive:</p>
                                <ul className="space-y-1 text-xs">
                                    <li>• Project becomes read-only</li>
                                    <li>• Team members lose access</li>
                                    <li>• Project is hidden from active lists</li>
                                    <li>• All data is preserved for 30 days</li>
                                    <li>• You can restore it anytime within 30 days</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Implement later once we have a team feature */}
                {/* {project.team.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Affected Team Members ({project.team.length})</h4>
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
                            <span className="text-xs text-gray-600">will lose access to this project</span>
                        </div>
                    </div>
                )} */}

                <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setArchiveOpen(false)} disabled={isArchiving} className="flex-1 bg-transparent">
                        Cancel
                    </Button>
                    <Button onClick={onConfirm} disabled={isArchiving} className="flex-1 bg-orange-600 hover:bg-orange-700">
                        {isArchiving ? (
                            <LoadingSpinner />
                        ) : (
                            <>
                                <Archive className="w-4 h-4 mr-2" />
                                Archive Project
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </>
    )
}

export default ArchivedProjectDialog