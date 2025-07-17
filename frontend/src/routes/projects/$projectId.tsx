import { useProjectIdStore } from "@/features/projectWorkSpace/store/useProjectId";
import ProjectWorkspace from "@/pages/projects/ProjectWorkSpace/ProjectWorkspace";
import { useEffect } from "react";

export const Route = createFileRoute({
  component: RouteComponent,
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
