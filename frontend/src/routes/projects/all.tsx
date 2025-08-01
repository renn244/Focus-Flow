import AllProjects from "@/pages/projects/AllProjects"
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (!isAuthenticated) throw redirect({ to: '/login' });
  }
})

function RouteComponent() {
  return <AllProjects />
}
