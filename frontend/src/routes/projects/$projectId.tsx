import ProjectWorkspace from "@/pages/projects/ProjectWorkSpace/ProjectWorkspace";

export const Route = createFileRoute({
  component: RouteComponent,
  
})

function RouteComponent() {
    const { projectId } = Route.useParams();

    return <ProjectWorkspace />
}
