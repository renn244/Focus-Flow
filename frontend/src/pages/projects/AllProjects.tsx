import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loadingSpinner"
import Controls from "@/features/projects/components/AllProject/Controls"
import CreateProjectDialog from "@/features/projects/components/AllProject/CreateProjectDialog"
import EditProjectDialog from "@/features/projects/components/AllProject/EditProjectDialog"
import ProjectGridCard from "@/features/projects/components/AllProject/ProjectGridCard"
import ProjectListCard from "@/features/projects/components/AllProject/ProjectListCard"
import { useAllProjects } from "@/features/projects/hooks/useAllProject"
import useProjectDialogStore from "@/features/projects/store/useProjectDialog"
import useViewModeStore from "@/features/projects/store/useViewMode.store"
import { Folder, Plus } from "lucide-react"

const AllProjects = () => {
    const viewMode = useViewModeStore((state) => state.viewMode);
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const { data: projects, error, isLoading } = useAllProjects();

    if(isLoading) {
        return <LoadingSpinner />
    }

    if(error) {
        return <>Somethign went wrong</>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6">
                <Controls />

                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {projects?.map((project) => (
                            <ProjectGridCard key={project.id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {projects?.map((project) => (
                            <ProjectListCard key={project.id} project={project} />
                        ))}
                    </div>
                )}

                {projects?.length === 0 && (
                    <div className="text-center py-12">
                        <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create your first project
                        </Button>
                    </div>
                )}

                <CreateProjectDialog />

                <EditProjectDialog />
            </div>
        </div>
    )
}

export default AllProjects