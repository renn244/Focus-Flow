import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import ProjectWorkspace from "@/pages/projects/ProjectWorkSpace/ProjectWorkspace";
import { useEffect } from "react";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (!isAuthenticated) throw redirect({ to: '/login' });
  },
})

function RouteComponent() {
  const { projectId } = Route.useParams();
  const setProjectId = useProjectIdStore((state) => state.setProjectId);

  useEffect(() => {
    if (projectId) {
      setProjectId(projectId);
    } else {
      setProjectId(null);
    }
  }, [projectId])

  if(!projectId) return null;

  return <ProjectWorkspace />
}
