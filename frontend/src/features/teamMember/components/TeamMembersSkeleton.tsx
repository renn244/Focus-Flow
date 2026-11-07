import { Skeleton } from "@/components/ui/skeleton";

const TeamMembersSkeleton = () => (
  <div role="status" aria-busy="true">
    <span className="sr-only">Loading team members</span>
    <div aria-hidden="true">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-full sm:w-72" />
      </div>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex h-10 items-center gap-6 border-b bg-muted/50 px-4">
          <Skeleton className="h-3 w-24" /><Skeleton className="ml-auto h-3 w-16" />
        </div>
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex h-20 items-center gap-3 border-b px-4 last:border-b-0">
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 max-w-44" />
              <Skeleton className="h-3 w-3/4 max-w-60" />
            </div>
            <Skeleton className="hidden h-4 w-24 md:block" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="size-8" />
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap justify-between gap-3">
        <Skeleton className="h-4 w-44" /><Skeleton className="h-8 w-60" />
      </div>
    </div>
  </div>
);

export default TeamMembersSkeleton;
