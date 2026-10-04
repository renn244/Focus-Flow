import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  beforeLoad: ({ context: { authContext }, params }) => {
    if (!authContext?.isAuthenticated) {
      throw redirect({ to: "/login" });
    }

    throw redirect({
      to: "/projects/$projectId",
      params: { projectId: params.projectId },
    });
  },
})
