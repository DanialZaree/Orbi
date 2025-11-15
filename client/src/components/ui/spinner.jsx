import { LoaderIcon } from "lucide-react"

import { cn } from "@/lib/utils"

// Remove the TypeScript type annotation from the function props
function Spinner({ className, ...props }) {
  return (
    <LoaderIcon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export function SpinnerCustom() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className={"size-6"}/>
    </div>
  )
}