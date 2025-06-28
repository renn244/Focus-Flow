import VerifyEmail from "@/pages/VerifyEmail";

export const Route = createFileRoute({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email || '') as string,
    })
})

function RouteComponent() {
    const { email }= Route.useSearch();
    
    return <VerifyEmail email={email} />
}
