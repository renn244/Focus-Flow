export const Route = createFileRoute({
    component: RouteComponent,
    validateSearch: (search: Record<string, unknown>) => ({
        email: (search.email || '') as string,
        displayName: (search.displayName || '') as string,
    })
})

function RouteComponent() {
    const { email, displayName }= Route.useSearch();
    
    return <div>
        {/* Make a card here that notify user to verify their email */}
    </div>
}
