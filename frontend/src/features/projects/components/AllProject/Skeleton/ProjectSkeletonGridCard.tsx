import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectSkeletonGridCard = () => {
    return (
        <Card className="h-full min-w-0 bg-card py-0">
            <CardContent className="p-5">
                <div className="space-y-4">

                    <div className="flex items-start justify-between">
                        <div className="flex min-w-0 w-full items-start gap-3">
                            <div className="flex flex-col items-center-safe gap-1">
                                <Skeleton className="size-9 shrink-0 rounded" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="w-3/4 h-6" />
                                </div>
                                <Skeleton className="w-full max-w-[326px] h-4.5 my-0.5" />
                                <Skeleton className="w-full max-w-[250px] h-4.5" />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Skeleton className="w-13 h-5.5" />
                        <Skeleton className="w-9.5 h-5.5" />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <Skeleton className="w-[58.95px] h-5" />
                            <Skeleton className="w-[31px] h-5" />
                        </div>
                        <Skeleton className="w-full h-2 rounded-full" />
                    </div>

                    <div className="flex items-center justify-between text-sm">
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
                        <div className="flex items-center gap-1">
                            <Skeleton className="w-4 h-4 rounded-[2px]" />
                            <Skeleton className="w-[85px] h-4.5" />
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                            {/* Code for the team skeletons */}
                        </div>
                        <div className="flex items-center gap-1">
                            <Skeleton className="w-[76px] h-3.75 rounded-full" />
                            <Skeleton className="w-[74px] h-3.75 rounded-full" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProjectSkeletonGridCard
