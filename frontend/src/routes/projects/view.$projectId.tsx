import NotFound from "@/components/common/NotFound";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjectByIdQueryOptions } from "@/features/projects/hooks/useGetProjectById";
import { queryClient } from "@/main";
import ViewFullProject from "@/pages/projects/view/ViewFullProject";
import { useSuspenseQuery } from "@tanstack/react-query";
import { notFound, redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: () => {
    const { projectId } = Route.useParams();
    const { data: project } = useSuspenseQuery(getProjectByIdQueryOptions(projectId, 'suspense'));

    if(!project) throw notFound();

    return <ViewFullProject project={project} />
  },
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (!isAuthenticated) throw redirect({ to: '/login' });
  },
  loader: async ({ params }) => queryClient.ensureQueryData(getProjectByIdQueryOptions(params.projectId)),
  notFoundComponent: () => <NotFound />,
  pendingComponent: () => {
    return <div className="flex items-center justify-center min-h-screen">
      <Skeleton className="w-10 h-20" />
    </div>
  },
})
