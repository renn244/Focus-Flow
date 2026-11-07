import useViewModeStore from "../../../store/useViewMode.store";
import ProjectSkeletonGridCard from "./ProjectSkeletonGridCard";
import ProjectSkeletonListCard from "./ProjectSkeletonListCard";

const ProjectSkeletonLoading = () => {
    const viewMode = useViewModeStore((state) => state.viewMode);

    return (
        <div role="status" aria-busy="true">
            <span className="sr-only">Loading projects</span>
            <div aria-hidden="true">
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, index) => (
                            <ProjectSkeletonGridCard key={index} />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {[...Array(8)].map((_, index) => (
                            <ProjectSkeletonListCard key={index} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

export default ProjectSkeletonLoading
