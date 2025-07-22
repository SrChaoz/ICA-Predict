import * as React from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

const ParameterCard = ({ 
  parameter, 
  value, 
  unit, 
  description, 
  variant = "default",
  trend,
  className 
}) => {
  const variants = {
    default: "border-border",
    excellent: "border-green-500 bg-green-50",
    good: "border-green-300 bg-green-25",
    regular: "border-yellow-300 bg-yellow-25",
    bad: "border-orange-400 bg-orange-25",
    poor: "border-red-500 bg-red-50"
  }

  const formatValue = (val) => {
    if (typeof val === "number") {
      return val.toFixed(2)
    }
    return val
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "rounded-lg border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        variants[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">
            {parameter}
          </p>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold">
              {formatValue(value)}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground">
              {description}
            </p>
          )}
        </div>
        {trend && (
          <div className="text-right">
            <div className={cn(
              "text-xs font-medium",
              trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"
            )}>
              {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"} {Math.abs(trend)}%
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

export { ParameterCard }
