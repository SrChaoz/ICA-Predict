import * as React from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { Check, X, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

// eslint-disable-next-line no-unused-vars
const Select = React.forwardRef(({ className, children, ...props }, ref) => (
  <div className={cn("relative", className)}>
    {children}
  </div>
))
Select.displayName = "Select"

const SelectTrigger = React.forwardRef(({ 
  className, 
  children, 
  open, 
  onToggle,
  disabled,
  ...props 
}, ref) => (
  <Button
    variant="outline"
    ref={ref}
    className={cn(
      "w-full justify-between",
      disabled && "cursor-not-allowed opacity-50",
      className
    )}
    onClick={onToggle}
    disabled={disabled}
    {...props}
  >
    {children}
    {open ? (
      <ChevronUp className="h-4 w-4 opacity-50" />
    ) : (
      <ChevronDown className="h-4 w-4 opacity-50" />
    )}
  </Button>
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef(({ 
  className, 
  children, 
  open, 
  position = "bottom",
  ...props 
}, ref) => {
  if (!open) return null
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.15 }}
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        position === "top" && "bottom-full mb-1",
        position === "bottom" && "top-full mt-1",
        "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  )
})
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef(({ 
  className, 
  children, 
  selected,
  onSelect,
  ...props 
}, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground",
      selected && "bg-accent text-accent-foreground",
      className
    )}
    onClick={onSelect}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {selected && <Check className="h-4 w-4" />}
    </span>
    {children}
  </div>
))
SelectItem.displayName = "SelectItem"

const SelectValue = React.forwardRef(({ 
  className, 
  placeholder,
  children,
  ...props 
}, ref) => (
  <span
    ref={ref}
    className={cn(
      "block truncate",
      !children && "text-muted-foreground",
      className
    )}
    {...props}
  >
    {children || placeholder}
  </span>
))
SelectValue.displayName = "SelectValue"

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
