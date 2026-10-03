import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import { CircleAlert, Search, UserPlus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useGetTeamMembersTable } from "../hooks/useGetTeamMembersTable";
import { useTeamMemberSocket } from "../hooks/useTeamMemberSocket";
import { useAddMemberDialog } from "../store/addMemberStore";
import type { TeamMemberTableSortField, TeamMemberTableSortOrder } from "../type";
import TeamMembersDataTable from "./TeamMembersDataTable";

const ProjectTeamPage = () => {
    const projectId = useProjectIdStore((state) => state.projectId);
    const setAddMemberOpen = useAddMemberDialog((state) => state.setIsOpen);
    const [searchInput, setSearchInput] = useState("");
    const [page, setPage] = useState(1);
    const [sortBy, setSortBy] = useState<TeamMemberTableSortField>('member');
    const [sortOrder, setSortOrder] = useState<TeamMemberTableSortOrder>('asc');
    const search = useDebouncedValue(searchInput.trim(), 300);
    const tableParams = useMemo(() => ({ page, limit: 10, search, sortBy, sortOrder }), [page, search, sortBy, sortOrder]);
    const { data, isLoading, isFetching, isError } = useGetTeamMembersTable(projectId || "", tableParams);

    useTeamMemberSocket(projectId);

    useEffect(() => {
        setPage(1);
    }, [search, sortBy, sortOrder]);

    useEffect(() => {
        if (data && data.totalPages > 0 && page > data.totalPages) {
            setPage(data.totalPages);
        }
    }, [data, page]);

    const handleSortChange = (nextSortBy: TeamMemberTableSortField, nextSortOrder: TeamMemberTableSortOrder) => {
        setSortBy(nextSortBy);
        setSortOrder(nextSortOrder);
    }

    const startResult = data?.total ? ((data.page - 1) * data.limit) + 1 : 0;
    const endResult = data ? Math.min(data.page * data.limit, data.total) : 0;

    return (
        <section className="min-h-[calc(100vh-4rem)] px-4 pb-10 pt-7 sm:px-6 lg:px-8" aria-label="Project team">
            <div>
                <div className="flex flex-wrap items-start justify-between gap-4 pb-5">
                    <div>
                        <h2 className="text-xl font-semibold tracking-tight text-slate-950">Team</h2>
                        <p className="mt-1 text-sm text-slate-500">Manage the people and roles in this project.</p>
                    </div>
                    <Button type="button" onClick={() => setAddMemberOpen(true)}>
                        <UserPlus data-icon="inline-start" />
                        Add member
                    </Button>
                </div>

                {isLoading && (
                    <div className="flex min-h-56 items-center justify-center">
                        <LoadingSpinner />
                    </div>
                )}

                {isError && (
                    <div className="flex min-h-56 flex-col items-center justify-center gap-2 text-center">
                        <CircleAlert className="size-5 text-destructive" />
                        <p className="font-medium text-slate-900">Couldn’t load the team.</p>
                        <p className="text-sm text-slate-500">Try refreshing the page.</p>
                    </div>
                )}

                {!isLoading && !isError && data && (
                    <div className="w-full">
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold text-slate-900">Team members</h3>
                            <div className="relative w-full sm:w-72">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    value={searchInput}
                                    onChange={(event) => setSearchInput(event.target.value)}
                                    placeholder="Search members..."
                                    aria-label="Search team members"
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <TeamMembersDataTable
                            members={data.items}
                            sortBy={sortBy}
                            sortOrder={sortOrder}
                            onSortChange={handleSortChange}
                            emptyMessage={search ? 'No members match your search.' : 'No team members yet.'}
                        />

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                            <p>{data.total ? `Showing ${startResult}-${endResult} of ${data.total} members` : 'No team members yet.'}</p>
                            <div className="flex items-center gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => setPage((currentPage) => currentPage - 1)} disabled={page <= 1 || isFetching}>
                                    Previous
                                </Button>
                                <span className="min-w-20 text-center text-xs">Page {data.totalPages ? page : 0} of {data.totalPages}</span>
                                <Button type="button" variant="outline" size="sm" onClick={() => setPage((currentPage) => currentPage + 1)} disabled={page >= data.totalPages || isFetching || data.totalPages === 0}>
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default ProjectTeamPage;
