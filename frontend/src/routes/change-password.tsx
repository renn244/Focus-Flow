import ChangePassword from "@/pages/ChangePassword";
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/change-password')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (isAuthenticated) throw redirect({ to: '/' });
  },
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token || '') as string,
      email: (search.email || '') as string,
    }
  }
})

function RouteComponent() {
    const { token, email } = Route.useSearch();

    return <ChangePassword token={token} email={email} />
}
