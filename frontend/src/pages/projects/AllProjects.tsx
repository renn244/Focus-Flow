import { Button } from "@/components/ui/button"
import ArchivedProjectDialog from "@/features/projects/components/AllProject/ArchivedProjectDialog"
import Controls from "@/features/projects/components/AllProject/Controls"
import CreateProjectDialog from "@/features/projects/components/AllProject/CreateProjectDialog"
import DeleteProjectDialog from "@/features/projects/components/AllProject/DeleteProjectDialog"
import EditProjectDialog from "@/features/projects/components/AllProject/EditProjectDialog"
import ProjectGridCard from "@/features/projects/components/AllProject/ProjectGridCard"
import ProjectListCard from "@/features/projects/components/AllProject/ProjectListCard"
import ProjectSkeletonLoading from "@/features/projects/components/AllProject/Skeleton/ProjectSkeletonLoading"
import ViewProjectDialog from "@/features/projects/components/AllProject/ViewProjectDialog"
import { useAllProjects } from "@/features/projects/hooks/useAllProject"
import useProjectDialogStore from "@/features/projects/store/useProjectDialog"
import useViewModeStore from "@/features/projects/store/useViewMode.store"
import { Folder, Plus } from "lucide-react"
import AppShell from "@/components/layout/AppShell"

const AllProjects = () => {
    const viewMode = useViewModeStore((state) => state.viewMode);
    const setCreateOpen = useProjectDialogStore((state) => state.setCreateOpen);
    const { data: projects, error, isLoading } = useAllProjects();

    return (
        <AppShell>
            <div className="app-content">
                <h1 className="mb-6 text-2xl font-semibold tracking-tight text-foreground">All projects</h1>
                <Controls />
                {isLoading && <ProjectSkeletonLoading />}
                {error && <p role="alert" className="py-8 text-sm text-destructive">Projects could not be loaded. Please refresh and try again.</p>}

                {!isLoading && !error && (viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {projects?.map((project) => (
                            <ProjectGridCard key={project._id} project={project} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {projects?.map((project) => (
                            <ProjectListCard key={project._id} project={project} />
                        ))}
                    </div>
                ))}

                {!isLoading && !error && projects?.length === 0 && (
                    <div className="text-center py-12">
                        <Folder className="mx-auto mb-4 size-10 text-muted-foreground" />
                        <h2 className="mb-2 text-lg font-medium text-foreground">No projects match</h2>
                        <p className="mb-4 text-muted-foreground">Change the status or priority filter, or create a new project.</p>
                        <Button onClick={() => setCreateOpen(true)}>
                            <Plus className="size-4" />
                            New project
                        </Button>
                    </div>
                )}

                <CreateProjectDialog />

                <EditProjectDialog />

                <ViewProjectDialog />
                
                <ArchivedProjectDialog />

                <DeleteProjectDialog />
            </div>
        </AppShell>
    )
}

export default AllProjects
