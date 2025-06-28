import ConfirmationVerifyEmail from "@/pages/ConfirmationVerifyEmail"

export const Route = createFileRoute({
  component: RouteComponent,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: (search.token || '') as string,
      email: (search.email || '') as string,
    }
  }
})

function RouteComponent() {
  const { token, email } = Route.useSearch();

  return <ConfirmationVerifyEmail token={token} email={email} />
}
