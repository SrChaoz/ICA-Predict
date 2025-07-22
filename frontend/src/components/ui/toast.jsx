import * as React from "react"
import { CheckCircle, AlertCircle, X } from "lucide-react"
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

const toastVariants = {
  success: "border-green-200 bg-green-50 text-green-800",
  error: "border-red-200 bg-red-50 text-red-800",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
}

const Toast = ({ 
  variant = "info", 
  title, 
  description, 
  isVisible, 
  onClose,
  className 
}) => {
  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: AlertCircle,
  }[variant]

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.95 }}
          className={cn(
            "fixed top-4 right-4 z-50 flex items-start space-x-3 rounded-lg border p-4 shadow-lg",
            toastVariants[variant],
            className
          )}
        >
          <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-1">
            <h4 className="font-medium">{title}</h4>
            {description && (
              <p className="text-sm opacity-90">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export { Toast }
