import UserSettings from "@/pages/UserSettings";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
  beforeLoad: ({ context: { authContext } }) => {
    if (!authContext?.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: UserSettings,
});
