import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'

// Import the generated route tree
import { routeTree } from './routeTree.gen'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AuthProvider from './context/authContext'

const queryClient = new QueryClient();

// Create a new router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  // since we are using the `@tanstack/react-query` package, we can set the default preload stale time to 0
  // to ensure that data is always fresh when navigating between routes and when preloaded
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router,
    context: {
      queryClient: QueryClient
    }
  }
}

// Render the app
const rootElement = document.getElementById('root')!
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} context={{ queryClient }} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}