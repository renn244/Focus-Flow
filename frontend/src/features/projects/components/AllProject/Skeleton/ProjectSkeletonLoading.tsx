import { Skeleton } from "@/components/ui/skeleton";
import useViewModeStore from "../../../store/useViewMode.store";
import ProjectSkeletonGridCard from "./ProjectSkeletonGridCard";
import ProjectSkeletonListCard from "./ProjectSkeletonListCard";

const ProjectSkeletonLoading = () => {
    const viewMode = useViewModeStore((state) => state.viewMode);

    return (
        <div className="min-h-screen">
            <div className="p-6">

                {/* Control Skeleton */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-[138px] h-9" />
                            <Skeleton className="w-[118px] h-9" />
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="w-[145.5px] h-8" />

                        <Skeleton className="w-9 h-8" />

                        <Skeleton className="w-8 h-8" />
                    </div>
                </div>

                {/* Project Cards Skeleton */}
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