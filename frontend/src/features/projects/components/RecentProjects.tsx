import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ExternalLink } from 'lucide-react';
import { useRecentProjects } from '../hooks/useRecentProjects';
import RecentProjectCard from './RecentProjectCard';
import RecentProjectSkeletonCard from './Skeleton/RecentProjectSkeletonCard';

const RecentProjects = () => {
    const { data: recentProjects = [], isLoading, isError } = useRecentProjects();

    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0" asChild>
                    <Link to="/projects/all">
                        View All
                        <ExternalLink className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <RecentProjectSkeletonCard key={index} />
                    ))
                ) : isError ? (
                    <p className="col-span-full rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                        Recent projects could not be loaded. Please refresh and try again.
                    </p>
                ) : recentProjects.length === 0 ? (
                    <div className="col-span-full rounded-lg border border-dashed bg-background p-6 text-sm text-muted-foreground">
                        No projects yet. Create a project to start organizing your work.
                    </div>
                ) : (
                    recentProjects.slice(0, 4).map((project) => (
                        <Link to='/projects/$projectId' params={{ projectId: project._id }} key={project._id}>
                            <RecentProjectCard key={project._id} project={project} />
                        </Link>
                    ))
                )}
            </div>
        </div>
    )
}

export default RecentProjects
