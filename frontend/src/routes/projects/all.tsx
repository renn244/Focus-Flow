import AllProjects from "@/pages/projects/AllProjects"
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/projects/all')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (!isAuthenticated) throw redirect({ to: '/login' });
  }
})

function RouteComponent() {
  return <AllProjects />
}
