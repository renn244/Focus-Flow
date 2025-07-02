import RecentProjectCard from './RecentProjectCard';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

const projects = [
    {
        id: "1",
        name: "E-commerce Platform",
        description: "Team-managed software",
        type: "scrum",
        status: "active",
        progress: 75,
        totalTasks: 24,
        completedTasks: 18,
        openTasks: 6,
        team: [
            { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32", initials: "SC" },
            { name: "Alex Rodriguez", avatar: "/placeholder.svg?height=32&width=32", initials: "AR" },
            { name: "Mike Johnson", avatar: "/placeholder.svg?height=32&width=32", initials: "MJ" },
        ],
        lastActivity: "2 hours ago",
        dueDate: "2024-02-15",
        priority: "high",
        color: "bg-blue-500",
        starred: true,
        boardCount: 3,
    },
    {
        id: "2",
        name: "Mobile App Redesign",
        description: "Team-managed software",
        type: "kanban",
        status: "active",
        progress: 45,
        totalTasks: 16,
        completedTasks: 7,
        openTasks: 9,
        team: [
            { name: "Emma Wilson", avatar: "/placeholder.svg?height=32&width=32", initials: "EW" },
            { name: "David Kim", avatar: "/placeholder.svg?height=32&width=32", initials: "DK" },
        ],
        lastActivity: "1 day ago",
        dueDate: "2024-01-30",
        priority: "medium",
        color: "bg-purple-500",
        starred: false,
        boardCount: 2,
    },
    {
        id: "3",
        name: "API Integration",
        description: "Team-managed software",
        type: "scrum",
        status: "active",
        progress: 90,
        totalTasks: 12,
        completedTasks: 11,
        openTasks: 1,
        team: [
            { name: "Lisa Park", avatar: "/placeholder.svg?height=32&width=32", initials: "LP" },
            { name: "Tom Wilson", avatar: "/placeholder.svg?height=32&width=32", initials: "TW" },
            { name: "Anna Davis", avatar: "/placeholder.svg?height=32&width=32", initials: "AD" },
        ],
        lastActivity: "3 hours ago",
        dueDate: "2024-01-25",
        priority: "high",
        color: "bg-green-500",
        starred: true,
        boardCount: 1,
    },
    {
        id: "4",
        name: "Marketing Website",
        description: "Team-managed software",
        type: "waterfall",
        status: "completed",
        progress: 100,
        totalTasks: 20,
        completedTasks: 20,
        openTasks: 0,
        team: [
            { name: "Rachel Green", avatar: "/placeholder.svg?height=32&width=32", initials: "RG" },
            { name: "John Smith", avatar: "/placeholder.svg?height=32&width=32", initials: "JS" },
        ],
        lastActivity: "1 week ago",
        dueDate: "2024-01-10",
        priority: "low",
        color: "bg-orange-500",
        starred: false,
        boardCount: 1,
    },
]

const RecentProjects = () => {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
                <Button variant="link" className="text-blue-600 hover:text-blue-700 p-0">
                    View all projects
                    <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {projects.map((project) => (
                    <RecentProjectCard key={project.id} project={project} />
                ))}
            </div>
        </div>
    )
}

export default RecentProjects