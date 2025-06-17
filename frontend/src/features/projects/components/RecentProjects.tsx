import { Link } from '@tanstack/react-router';
import RecentProjectCard from './RecentProjectCard';

const RecentProjects = () => {
    return (
        <div className='py-[2px] flex flex-col gap-2'>
            <div className='flex items-center justify-between'>
                <h2 className='font-medium'>Recent Projects</h2>
                <Link 
                to='/'
                className='underline underline-offset-2'
                >
                    View all projects
                </Link>
            </div>
            <div className='flex gap-3 pb-2 overflow-y-auto'>
                {Array.from({ length: 4 }).map((_, index) => (
                    <RecentProjectCard key={index} />
                ))}
            </div>
        </div>
    )
}

export default RecentProjects