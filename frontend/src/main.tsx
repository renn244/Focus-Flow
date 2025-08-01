import { createRouter } from '@tanstack/react-router'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

// Import the generated route tree
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App'
import AuthProvider, { type AuthContextType } from './context/authContext'
import { routeTree } from './routeTree.gen'

export const queryClient = new QueryClient();

// Create a new router instance
export const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  // since we are using the `@tanstack/react-query` package, we can set the default preload stale time to 0
  // to ensure that data is always fresh when navigating between routes and when preloaded
  defaultPreloadStaleTime: 0,
  scrollRestoration: true,
  context: {
    queryClient, authContext: undefined
  }
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router,
    context: {
      queryClient: QueryClient,
      authContext: AuthContextType | undefined 
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
          <App />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  )
}