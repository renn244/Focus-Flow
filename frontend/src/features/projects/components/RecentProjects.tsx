import RecentProjectCard from './RecentProjectCard';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { useRecentProjects } from '../hooks/useRecentProjects';
import LoadingSpinner from '@/components/ui/loadingSpinner';

const RecentProjects = () => {
    const { data: recentProjects, isLoading } = useRecentProjects();

    if(isLoading) {
        return <LoadingSpinner />
    }

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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recentProjects?.slice(0, 4).map((project) => (
                    <Link to='/projects/$projectId' params={{ projectId: project._id }} key={project._id}>
                        <RecentProjectCard key={project._id} project={project} />
                    </Link>
                ))}
            </div>
        </div>
    )
}

export default RecentProjects