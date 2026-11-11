import { Button } from "@/components/ui/button"
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react"
import type { ComponentProps } from "react";

type SomethingWentWrongDialogProps = {
  title?: string;
  message?: string;
  customActions?: React.ReactNode;
  className?: string;

  onBack: () => void;
  backLoading?: boolean;

  onRetry: () => void;
  retryLoading: boolean;
} & ComponentProps<'div'>;

const SomethingWentWrongDialog = ({
  title = "Something Went Wrong",
  message = "An unexpected error occurred. Please try again later.",
  customActions,
  className,
  onBack, backLoading = false,
  onRetry, retryLoading = false,
  ...props
}: SomethingWentWrongDialogProps) => {

  return (
    <div className={cn("p-2 text-center w-full max-w-md mx-auto", className)} {...props}>
      <div className="mb-4">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
      </div>

      <h2 className="text-xl font-bold text-red-600 mb-1.5">{title}</h2>
      <p className="text-gray-600 mb-5 leading-relaxed text-sm">{message}</p>

      <div className="space-y-1.5">
        {customActions ? (
          customActions
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {onBack && (
              <Button variant="outline" onClick={onBack} className="text-gray-700 bg-transparent">
                {backLoading ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <ArrowLeft className="w-4 h-4" />
                    Go Back
                  </>
                )}
              </Button>
            )}
          
            <Button onClick={onRetry} className="w-full bg-blue-600 hover:bg-blue-700">
              {retryLoading ? (
                <>
                  <LoadingSpinner />
                  Trying Again
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SomethingWentWrongDialog