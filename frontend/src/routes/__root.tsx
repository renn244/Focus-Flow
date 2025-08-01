import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient } from '@tanstack/react-query'
import NotFound from '@/components/common/NotFound'
import type { AuthContextType } from '@/context/authContext'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient, authContext: AuthContextType | undefined }>()({
  component: () => (
    <>
      <Toaster position='top-center' />
      <Outlet />
      <ReactQueryDevtools buttonPosition='bottom-right' />
      <TanStackRouterDevtools position='bottom-right' />
    </>
  ),
  notFoundComponent: () => <NotFound />
})
