import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Folder, Star } from "lucide-react"
import type { Project } from "../type"

const RecentProjectCard = ({ project }: { project: Project }) => {
    return (
        <Card className="h-full cursor-pointer border bg-card py-1 transition-shadow hover:shadow-md">
            <CardContent className="p-4">
                <div className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex size-8 items-center justify-center rounded bg-primary/10 text-primary">
                                <Folder className="size-4" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">{project.name}</h3>
                                <p className="mt-1 line-clamp-2 min-h-10 text-sm text-muted-foreground">
                                    {project.description || "No description yet."}
                                </p>
                            </div>
                        </div>
                        {project.starred && <Star className="size-4 shrink-0 fill-current text-amber-500" />}
                    </div>
                    <div>
                        <Badge variant="secondary" className="capitalize">{project.status}</Badge>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default RecentProjectCard
