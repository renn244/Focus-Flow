import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/context/authContext";
import { demoAttachments, demoAuth, demoComments, demoFocusTask, demoMyTasks, demoProjects, demoTaskActivity } from "./demoData";

/**
 * A query cache that already holds the sample workspace and never fetches,
 * so the real components render sample data without touching the API.
 */
const createDemoClient = () => {
    const client = new QueryClient({
        defaultOptions: {
            queries: { enabled: false, staleTime: Infinity, gcTime: Infinity, retry: false, refetchOnMount: false, refetchOnWindowFocus: false },
        },
    });
    client.setQueryData(["tasks", "mine"], demoMyTasks);
    client.setQueryData(["allProjects", "active", "all"], demoProjects);
    client.setQueryData(["comments", demoFocusTask._id], demoComments);
    client.setQueryData(["attachments", demoFocusTask._id], demoAttachments);
    client.setQueryData(["task-activity", demoFocusTask._id], {
        pages: [{ items: demoTaskActivity, nextCursor: null }],
        pageParams: [undefined],
    });
    return client;
};

/** Signs the sample user in and serves the sample workspace to everything inside. */
const DemoProviders = ({ children }: { children: ReactNode }) => {
    const [client] = useState(createDemoClient);
    return (
        <QueryClientProvider client={client}>
            <AuthContext.Provider value={demoAuth}>{children}</AuthContext.Provider>
        </QueryClientProvider>
    );
};

export default DemoProviders;
