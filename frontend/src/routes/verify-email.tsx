import VerifyEmail from "@/pages/VerifyEmail";
import { redirect } from "@tanstack/react-router";

export const Route = createFileRoute({
    component: RouteComponent,
    beforeLoad: async ({ context: { authContext } }) => {
        const isAuthenticated = authContext?.isAuthenticated || false;

        if (isAuthenticated) throw redirect({ to: '/' });
    },
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email || '') as string,
    })
})

function RouteComponent() {
    const { email }= Route.useSearch();
    
    return <VerifyEmail email={email} />
}
