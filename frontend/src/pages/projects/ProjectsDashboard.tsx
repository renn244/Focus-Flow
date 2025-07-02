import RecentProjects from "@/features/projects/components/RecentProjects"
import WorkSummaryPanel from "@/features/projects/components/WorkSummaryPanel"

const ProjectsDashboard = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="p-6">
                <RecentProjects />

                <WorkSummaryPanel />
            </div>
        </div>
    )
}

export default ProjectsDashboard