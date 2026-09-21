import { redirect } from "@tanstack/react-router"
import LandingPage from "@/pages/LandingPage"

export const Route = createFileRoute({
  beforeLoad: ({ context: { authContext } }) => {
    if (authContext?.isAuthenticated) {
      throw redirect({ to: "/projects" })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <LandingPage />
}
