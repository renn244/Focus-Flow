import { Skeleton } from "@/components/ui/skeleton"

const TaskItemSkeleton = () => {
    return (
        <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 bg-white">
            <div className="flex items-center gap-3">
                <Skeleton className="w-6 h-6 rounded" />

                <div>
                    <Skeleton className="h-4 my-0.5 w-[220px]" />
                    <Skeleton className="h-3.5 w-3/4" />
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-[50px]" />

                <Skeleton className="h-6 w-6" />
            </div>
        </div>
    ) 
}

export default TaskItemSkeleton