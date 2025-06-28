import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient } from '@tanstack/react-query'
import NotFound from '@/components/common/NotFound'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <Toaster />
      <Outlet />
      <ReactQueryDevtools buttonPosition='bottom-right' />
      <TanStackRouterDevtools position='bottom-right' />
    </>
  ),
  notFoundComponent: () => <NotFound />
})
