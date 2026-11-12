import UserSettings from "@/pages/UserSettings";
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/settings')({
  beforeLoad: ({ context: { authContext } }) => {
    if (!authContext?.isAuthenticated) {
      throw redirect({ to: "/login" });
    }
  },
  component: UserSettings,
});
