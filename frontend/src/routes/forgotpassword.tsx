import ForgotPassword from "@/pages/ForgotPassword"
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/forgotpassword')({
  component: RouteComponent,
  beforeLoad: async ({ context: { authContext } }) => {
    const isAuthenticated = authContext?.isAuthenticated || false;

    if (isAuthenticated) throw redirect({ to: '/' });
  }
})

function RouteComponent() {
    return <ForgotPassword />
}
 