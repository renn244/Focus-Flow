import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { activityColors, activityIcons } from "../../constants/Activity"

export const mockActivities = [
    {
        type: "task",
        title: "Task Completed",
        description: "Finished implementing the login functionality.",
        timestamp: new Date("2025-08-05T10:30:00"),
        user: {
            name: "Alice Johnson",
            avatar: "/avatars/alice.jpg",
            initials: "AJ"
        },
        metadata: {
            taskName: "Login Feature",
            oldStatus: "In Progress",
            newStatus: "Completed"
        }
    },
    {
        type: "status_changed",
        title: "Status Changed",
        description: "Changed task status from Pending to In Progress.",
        timestamp: new Date("2025-08-03T09:00:00"),
        user: {
            name: "Charlie Nguyen",
            avatar: "",
            initials: "CN"
        },
        metadata: {
            taskName: "User Profile Page",
            oldStatus: "Pending",
            newStatus: "In Progress"
        }
    },
    {
        type: "milestone",
        title: "Milestone Reached",
        description: "Completed all tasks under the 'MVP Launch' milestone.",
        timestamp: new Date("2025-08-02T18:45:00"),
        user: {
            name: "Dana Lee",
            avatar: "/avatars/dana.jpg",
            initials: "DL"
        },
        metadata: {
            milestone: "MVP Launch"
        }
    },
    {
        type: "team",
        title: "New Member Added",
        description: "Invited Emma Wilson to the project team.",
        timestamp: new Date("2025-08-01T16:20:00"),
        user: {
            name: "Frank Garcia",
            avatar: "",
            initials: "FG"
        },
            metadata: {
            memberName: "Emma Wilson"
        }
    }
];

const Activity = () => {
    return (
        <>
            <div className="flex items-center justify-between mb-1">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Activity</h2>
                    <p className="text-gray-600">Complete project activity history</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter Activity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Activities</SelectItem>
                            <SelectItem value="task">Task Updates</SelectItem>
                            <SelectItem value="team">Team Changes</SelectItem>
                            <SelectItem value="milestone">Milestones</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div>
                <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
                    <CardContent className="">
                        <div className="space-y-4">
                            {mockActivities.map((activity) => (
                                <ActivityCard key={activity.title} activity={activity} />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

type ActivityCardProps = {
    activity: any;
}

const ActivityCard = ({ activity }: ActivityCardProps) => {
    const IconComponent = activityIcons[activity.type as keyof typeof activityIcons];

    return (
        <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.1 }}
        className="flex gap-4"
        >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activityColors[activity.type as keyof typeof activityColors]}`}>
                <IconComponent />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                    <span className="text-sm text-gray-500">{format(activity.timestamp, "MMM dd, yyyy HH:mm aa")}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                            <AvatarImage src={activity.user.avatar || "/placeholder.svg"} alt={activity.user.name} />
                            <AvatarFallback className="text-xs">{activity.user.initials}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-700">{activity.user.name}</span>
                    </div>
                    {activity.metadata && (
                        <div className="flex gap-2">
                            {activity.metadata.taskName && (
                                <Badge variant="secondary" className="text-xs">
                                    {activity.metadata.taskName}
                                </Badge>
                            )}
                            {activity.metadata.fileName && (
                                <Badge variant="secondary" className="text-xs">
                                    {activity.metadata.fileName}
                                </Badge>
                            )}
                            {activity.metadata.milestone && (
                                <Badge variant="secondary" className="text-xs">
                                    {activity.metadata.milestone}
                                </Badge>
                            )}
                            {activity.metadata.memberName && (
                                <Badge variant="secondary" className="text-xs">
                                    {activity.metadata.memberName}
                                </Badge>
                            )}
                            {activity.metadata.oldStatus && activity.metadata.newStatus && (
                                <Badge variant="secondary" className="text-xs">
                                    {activity.metadata.oldStatus} → {activity.metadata.newStatus}
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

export default Activity
