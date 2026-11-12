import MultiFactor from "@/pages/MultiFactor"
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/multi-factor')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (isAuthenticated) throw redirect({ to: '/' });
  }
})

function RouteComponent() {
  return <MultiFactor />
}
