import RecentProjects from "@/features/projects/components/RecentProjects"
import WorkSummaryPanel from "@/features/projects/components/WorkSummaryPanel"

const ProjectsDashboard = () => {
    return (
        <div className="p-6 px-10 h-screen">
            <div className="flex flex-col gap-6">
                <RecentProjects />

                <WorkSummaryPanel />
            </div>
        </div>
    )
}

export default ProjectsDashboard