import * as React from "react"
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion"
import { Calendar, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Input } from "./input"

const DatePicker = React.forwardRef(({
  className,
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled,
  ...props
}, ref) => {
  // eslint-disable-next-line no-unused-vars
  const [isOpen, setIsOpen] = React.useState(false)
  
  // eslint-disable-next-line no-unused-vars
  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const handleDateChange = (e) => {
    const newDate = e.target.value
    onChange?.(newDate)
    setIsOpen(false)
  }

  const clearDate = () => {
    onChange?.("")
  }

  return (
    <div className={cn("relative", className)} ref={ref}>
      <div className="relative">
        <Input
          type="date"
          value={value || ""}
          onChange={handleDateChange}
          disabled={disabled}
          className="pr-16 cursor-pointer"
          placeholder={placeholder}
          {...props}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-full px-2 hover:bg-transparent"
              onClick={clearDate}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center justify-center px-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </div>
  )
})
DatePicker.displayName = "DatePicker"

const DateRangePicker = React.forwardRef(({
  className,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  disabled,
  ...props
}, ref) => {
  return (
    <div className={cn("flex items-center space-x-2", className)} ref={ref} {...props}>
      <DatePicker
        value={startDate}
        onChange={onStartDateChange}
        placeholder="Fecha inicio"
        disabled={disabled}
        className="flex-1"
      />
      <span className="text-muted-foreground">hasta</span>
      <DatePicker
        value={endDate}
        onChange={onEndDateChange}
        placeholder="Fecha fin"
        disabled={disabled}
        className="flex-1"
        min={startDate}
      />
    </div>
  )
})
DateRangePicker.displayName = "DateRangePicker"

export { DatePicker, DateRangePicker }
