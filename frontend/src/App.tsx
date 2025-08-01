import { RouterProvider } from '@tanstack/react-router';
import { Suspense } from 'react';
import { useAuthContext } from './context/authContext';
import { queryClient, router } from './main';

function App() {
  const authContext = useAuthContext();

  return (
    <Suspense fallback={null}>
      <RouterProvider router={router} context={{ queryClient, authContext }} />
    </Suspense>
  )
}

export default App
