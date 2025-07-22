import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

const LoadingSpinner = ({ className, size = "default" }) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6",
    lg: "h-8 w-8"
  }

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-current border-t-transparent",
        sizeClasses[size],
        className
      )}
    />
  )
}

const LoadingButton = ({ children, isLoading, ...props }) => {
  return (
    <Button disabled={isLoading} {...props}>
      {isLoading && <LoadingSpinner size="sm" className="mr-2" />}
      {children}
    </Button>
  )
}

export { LoadingSpinner, LoadingButton }
