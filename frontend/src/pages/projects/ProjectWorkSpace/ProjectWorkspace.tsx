import { Button } from "@/components/ui/button";
import { Calendar, Columns3, Ellipsis, Expand, Share, UserPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
import KanbanBoard from "./Board/KanbanBoard";

type ProjectWorkspaceProps = {
    projectId: string;
}

const ProjectWorkspace = () => {
    return (
        <div className="p-6 h-screen w-full">
            <div className="flex flex-col gap-1">
                <div aria-label="header" className="px-2 h-8">
                    <div className="flex justify-between items-center h-8">
                        <div className="flex items-center gap-3">
                            <h2 className="text-xl font-semibold">
                                Project Title
                            </h2>
                            <Ellipsis className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex items-center justify-between gap-2">
                            <Button variant="outline" size="icon" className="rounded-[2.5px] size-[32px]">
                                <Expand className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-[2.5px] size-[32px]">
                                <Share className="h-5 w-5" />
                            </Button>
                            <Button variant="outline" size="icon" className="rounded-[2.5px] size-[32px]">
                                <UserPlus className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
                <div aria-label="content">
                    <nav className="border-b">
                        <main className="flex items-center justify-start gap-3">
                            <Link to="/" className="flex gap-1 items-center text-muted-foreground py-1 px-1.5 border-b-3 border-primary text-primary pb-0">
                                <Columns3 className="h-5 w-5" />
                                <span className="font-medium">Board</span>
                            </Link>
                            <Link to="/" className="flex gap-1 items-center text-muted-foreground">
                                <Calendar className="h-5 w-5" />
                                <span className="font-medium">Calendar</span>
                            </Link>
                            <Link to="/" className="flex gap-1 items-center text-muted-foreground">
                                <span className="font-medium">Others</span>
                            </Link>
                        </main>
                    </nav>

                    <main>
                        {/* Content of the main */}
                        <KanbanBoard />
                    </main>
                </div>
            </div>
        </div>
    )
}

export default ProjectWorkspace