export const Route = createFileRoute({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      access_token: search.access_token || '' as string | undefined,
      refresh_token: search.refresh_token || '' as string | undefined,
      error: search.error || '' as string | undefined,
    }
  }
})

function RouteComponent() {
  return <div></div>
}
