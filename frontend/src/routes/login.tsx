import Login from "@/pages/Login";
import { createFileRoute, redirect } from '@tanstack/react-router';
 
export const Route = createFileRoute('/login')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (isAuthenticated) throw redirect({ to: '/' });
  }
})

function RouteComponent() {
  return <Login />
}
