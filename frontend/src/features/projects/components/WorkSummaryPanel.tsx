import { Zap } from "lucide-react"

const WorkSummaryPanel = () => {
    return (
        <div>
            <div className="border-b-1">
                <div className="px-2 flex gap-3 items-center justify-baseline cursor-pointer">
                    <h2 className="py-1.5 text-sm font-medium text-muted-foreground">
                        Worked on
                    </h2>
                    <h2 className="py-1.5 text-sm font-medium text-muted-foreground text-primary border-b-[3px] border-b-primary">
                        Assigned to me
                    </h2>
                    <h2 className="py-1.5 text-sm font-medium text-muted-foreground">
                        Sprint overview
                    </h2>
                </div>
            </div>
            <div className="pb-1.5 px-2">
                <div className="flex flex-col mt-4">
                    <h3 className="text-xs font-bold uppercase text-muted-foreground">TO DO</h3>

                    {/* current card for all for now */}
                    {/* do individual cards later, it's just small adjustments */}
                    <div className="p-2 flex items-center hover:bg-muted rounded-sm cursor-pointer">
                        <div className="flex items-center justify-center" aria-label="icon">
                            <Zap className="h-6 w-6 text-blue-700" />
                        </div>
                        <div className="flex-1 flex flex-col mx-2" aria-label="content">
                            <h4 className="text-sm">Project Name</h4>
                            <p className="text-xs font-thin text-muted-foreground">
                                <span>Task Name</span>
                                <span className="mx-1">·</span>
                                <span>Project Name</span>
                            </p>
                        </div>
                        <div aria-label="extra-info">
                            <span className="pr-4 text-xs text-muted-foreground">To do</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default WorkSummaryPanel