import { RouterProvider } from '@tanstack/react-router';
import { Suspense, useEffect } from 'react';
import { useAuthContext } from './context/authContext';
import { queryClient, router } from './main';
import ScreenLoading from './components/common/ScreenLoading';

function App() {
  const authContext = useAuthContext();

  useEffect(() => {
    // Re-run route guards after the provider commits the new authentication state.
    void router.invalidate();
  }, [authContext.isAuthenticated]);

  return (
    <Suspense fallback={<ScreenLoading />}>
      <RouterProvider router={router} context={{ queryClient, authContext }} />
    </Suspense>
  )
}

export default App
