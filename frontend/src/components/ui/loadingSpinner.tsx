import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

type LoadingSpinnerProps = {
    className?: string;
} & ComponentProps<"div">; 

const LoadingSpinner = ({
    className,
    ...props
}: LoadingSpinnerProps) => {
    return (
        <div role="status" aria-label="Loading" {...props} className="flex items-center justify-center">
            <svg className={cn("spinner size-5", className)} viewBox="0 0 44 44" aria-hidden="true">
                <circle className="path" cx="22" cy="22" r="20" fill="none" strokeWidth="4" stroke="currentColor"></circle>
            </svg>
        </div>
    )
}

export default LoadingSpinner
