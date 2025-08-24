import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MoreHorizontal } from "lucide-react"

const TeamMemberCardSkeleton = () => {
    return (
        <Card className="py-2 bg-white/80 backdrop-blur-sm border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="py-0 px-2">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Skeleton className="w-12 h-12 rounded-full" />
                        </div>
                        <div>
                            <Skeleton className="h-5 my-0.5 w-[130px] rounded-sm" />
                            <Skeleton className="h-4 my-0.5 w-[70px] rounded-sm" />
                            <Skeleton className="h-4 w-[165px] rounded-sm" />
                        </div>
                    </div>
                    <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default TeamMemberCardSkeleton