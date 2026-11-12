import SignUp from "@/pages/SignUp"
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/sign-up')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (isAuthenticated) throw redirect({ to: '/' });
  }
})

function RouteComponent() {
  return <SignUp />
}
