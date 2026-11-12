import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from '@/components/ui/sonner'
import { QueryClient } from '@tanstack/react-query'
import NotFound from '@/components/common/NotFound'
import PwaUpdater from '@/components/common/PwaUpdater'
import type { AuthContextType } from '@/context/authContext'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient, authContext: AuthContextType | undefined }>()({
  component: () => (
    <>
      <Toaster position='top-center' />
      <PwaUpdater />
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFound />
})
