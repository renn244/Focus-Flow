import ListLoading from "@/components/common/ListLoading";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectCalendarSkeleton = ({ agenda = false }: { agenda?: boolean }) => (
  <section className="app-content min-h-[calc(100vh-8rem)]" role="status" aria-busy="true">
    <span className="sr-only">Loading project calendar</span>
    <div aria-hidden="true">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-7 w-44" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-9 w-52" />
          <Skeleton className="h-9 w-14" />
          <Skeleton className="h-9 w-16" />
        </div>
      </div>
      {agenda ? (
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <ListLoading label="" rows={4} avatar />
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-card">
          <div className="grid grid-cols-7 border-b">
            {Array.from({ length: 7 }, (_, day) => (
              <div key={day} className="flex h-10 items-center justify-center"><Skeleton className="h-3 w-7" /></div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: 35 }, (_, day) => (
              <div key={day} className="min-h-24 border-b border-r p-2 sm:min-h-32">
                <Skeleton className="ml-auto size-4" />
                {day % 5 === 2 && <Skeleton className="mt-4 h-5 w-full" />}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </section>
);

export default ProjectCalendarSkeleton;
