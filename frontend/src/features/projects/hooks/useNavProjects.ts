import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/lib/httpService";
import type { ProjectWithOwnerList } from "../type";

const getActiveProjects = async (): Promise<ProjectWithOwnerList> => {
    const response = await axiosInstance.get("/projects", { params: { status: "active", priority: "all" } });

    if (response.status >= 400) {
        throw new Error(response.data.message || "Projects could not be loaded");
    }

    return response.data;
};

/**
 * Active projects for the shell's project tabs, search and agenda lookups.
 * Shares the `allProjects` key shape with `useAllProjects`, so project
 * mutations that invalidate `["allProjects"]` refresh the tabs too.
 */
export const useNavProjects = () =>
    useQuery({
        queryKey: ["allProjects", "active", "all"],
        queryFn: getActiveProjects,
        refetchOnWindowFocus: false,
        retry: 1,
        select: (projects) =>
            [...projects].sort((a, b) => Number(b.starred) - Number(a.starred) || a.name.localeCompare(b.name)),
    });

export const projectDotClass = (color?: string) => color || "bg-blue-500";
