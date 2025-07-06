import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

const ProjectSkeletonListCard = () => {
    return (
        <Card className="hover:shadow-md transition-all duration-200 cursor-pointer group bg-white border border-gray-200 py-0.5 rounded-sm">
            <CardContent className="p-2">
                <div className="flex items-center gap-2">

                    <div className="w-8 h-8 rounded flex items-center-safe gap-1">
                        <Skeleton className="w-8 h-8 rounded" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-0.5">
                            <Skeleton className="w-[300px] h-5.5" />
                        </div>
                        <Skeleton className="w-[700px] h-5" />
                    </div>

                    <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <Skeleton className="w-13 h-5.5" />
                            <Skeleton className="w-9.5 h-5.5" />
                        </div>

                        <div className="w-24">
                            <div className="flex items-center justify-between mb-1">
                                <Skeleton className="w-[58.95px] h-5" />
                                <Skeleton className="w-[31px] h-5" />
                            </div>
                            <Skeleton className="w-full h-1 rounded-full" />
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="w-2 h-4.5" />
                                </div>
                                <div className="flex items-center gap-1">
                                    <Skeleton className="w-4 h-4 rounded-full" />
                                    <Skeleton className="w-2 h-4.5" />
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            {/* Code for the team skeletons */}
                        </div>

                        <Skeleton className="w-20 h-4" />

                        <span className="opacity-0 h-9 w-8">.</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectSkeletonListCard