import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectWithOwner } from "@/features/projects/type";
import Activity from "@/features/viewProject/components/Content/Activity";
import Overview from "@/features/viewProject/components/Content/Overview";
import Team from "@/features/viewProject/components/Content/Team";
import ViewProjectHeader from "@/features/viewProject/components/ViewProjectHeader";
import { BarChart3, CheckCircle2, PieChart, Users, ActivityIcon } from "lucide-react";
import { useState } from "react";

type ViewFullProjectProps = {
    project: ProjectWithOwner;
}

const ViewFullProject = ({ project }: ViewFullProjectProps) => {
    const [selectedTab, setSelectedTab] = useState("overview");

    return (
        <div className="min-h-screen">

            <ViewProjectHeader project={project} />

            <div className="p-6">
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
                    <TabsList defaultValue="overview">
                        <TabsTrigger value="overview" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <BarChart3 className="w-4 h-4 mr-2" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="tasks" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Tasks
                        </TabsTrigger>
                        <TabsTrigger value="team" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <Users className="w-4 h-4 mr-2" />
                            Team
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <ActivityIcon className="w-4 h-4 mr-2" />
                            Activity
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                            <PieChart className="w-4 h-4 mr-2" />
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        <Overview project={project} />
                    </TabsContent>

                    <TabsContent value="tasks">
                        {/* Tasks content will go here */}
                    </TabsContent>

                    <TabsContent value="team">
                        <Team />
                    </TabsContent>

                    <TabsContent value="activity">
                        <Activity />
                    </TabsContent>

                    <TabsContent value="analytics">
                        {/* Analytics content will go here */}
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}

export default ViewFullProject