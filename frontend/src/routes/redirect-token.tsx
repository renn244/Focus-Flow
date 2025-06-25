import RedirectToken from "@/pages/RedirectToken"

export const Route = createFileRoute({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => ({
    access_token: (search.access_token || '') as string,
    refresh_token: (search.refresh_token || '') as string,
    error: (search.error || '') as string,
  })
})

function RouteComponent() {
  const { access_token, refresh_token, error } = Route.useSearch()

  return (
    <RedirectToken 
    accessToken={access_token}
    refreshToken={refresh_token}
    error={error}
    />
  )
}
