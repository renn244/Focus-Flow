import LoadingSpinner from '../ui/loadingSpinner'

const ScreenLoading = () => {
  return (
    <div role="status" aria-busy="true" className="flex min-h-svh items-center justify-center bg-background">
        <span className="sr-only">Loading FocusFlow</span>
        <LoadingSpinner className="size-6 text-primary" />
    </div>
  )
}

export default ScreenLoading
