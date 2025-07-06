export const Route = createFileRoute({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/projects/view/$projectId"!</div>
}
