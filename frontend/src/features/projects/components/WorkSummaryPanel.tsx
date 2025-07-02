import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import TaskItem from "./TaskItem"
import { useState } from "react"

const recentTasks = [
    {
        id: "TASK-1",
        title: "Design new user dashboard",
        projectName: "E-commerce Platform",
        status: "in-progress",
        priority: "high",
        dueDate: "2024-01-20",
        assignee: { name: "Sarah Chen", avatar: "/placeholder.svg?height=32&width=32", initials: "SC" },
    },
    {
        id: "TASK-2",
        title: "Implement payment gateway",
        projectName: "E-commerce Platform",
        status: "todo",
        priority: "high",
        dueDate: "2024-01-22",
        assignee: { name: "Alex Rodriguez", avatar: "/placeholder.svg?height=32&width=32", initials: "AR" },
    },
]

const WorkSummaryPanel = () => {
    const [activeTab, setActiveTab] = useState("worked-on")

    return (
        <>
            <div className="mb-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-white border border-gray-200">
                        <TabsTrigger
                        value="worked-on"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                            Worked on
                        </TabsTrigger>
                        <TabsTrigger
                        value="assigned-to-me"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                            Assigned to me
                        </TabsTrigger>
                        <TabsTrigger
                        value="sprint-overview"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700"
                        >
                            Sprint overview
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">TO DO</h3>
                </div>

                <div className="space-y-3">
                    {recentTasks.map((task) => (
                        <TaskItem key={task.id} task={task} />
                    ))}
                </div>
            </div>
        </>
    )
}

export default WorkSummaryPanel