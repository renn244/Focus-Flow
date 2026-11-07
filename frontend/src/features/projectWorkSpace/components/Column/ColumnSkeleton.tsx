import { Skeleton } from "@/components/ui/skeleton";

const ColumnSkeleton = () => (
  <>
    {Array.from({ length: 3 }, (_, column) => (
      <section key={column} className="min-w-0 space-y-4 rounded-lg border bg-muted/30 p-4" role="status" aria-busy="true">
        <span className="sr-only">Loading board column</span>
        <div aria-hidden="true" className="space-y-4">
          <div className="flex items-center justify-between"><Skeleton className="h-5 w-28" /><Skeleton className="size-6" /></div>
          {Array.from({ length: 3 }, (_, task) => (
            <div key={task} className="space-y-3 rounded-lg border bg-card p-4">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex items-center justify-between pt-2"><Skeleton className="h-5 w-14" /><Skeleton className="size-6 rounded-full" /></div>
            </div>
          ))}
        </div>
      </section>
    ))}
  </>
);

export default ColumnSkeleton;
