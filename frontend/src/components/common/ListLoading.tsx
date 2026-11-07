import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type ListLoadingProps = {
  label: string;
  rows?: number;
  avatar?: boolean;
  className?: string;
};

const ListLoading = ({ label, rows = 3, avatar = false, className }: ListLoadingProps) => (
  <div role="status" aria-busy="true" className={cn("divide-y rounded-lg border bg-card", className)}>
    <span className="sr-only">{label}</span>
    <div aria-hidden="true">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex min-h-20 items-center gap-3 border-b p-4 last:border-b-0">
          {avatar && <Skeleton className="size-9 shrink-0 rounded-full" />}
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 max-w-64" />
            <Skeleton className="h-3 w-1/2 max-w-48" />
          </div>
          <Skeleton className="h-5 w-12 shrink-0" />
        </div>
      ))}
    </div>
  </div>
);

export default ListLoading;
