import { Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const Brand = ({ className }: { className?: string }) => (
  <span className={cn("inline-flex shrink-0 items-center gap-2.5 font-semibold", className)}>
    <span className="flex size-8 items-center justify-center rounded-lg bg-blue-600 text-white">
      <Leaf className="size-4" aria-hidden="true" />
    </span>
    <span className="text-lg">FocusFlow</span>
  </span>
);

export default Brand;
