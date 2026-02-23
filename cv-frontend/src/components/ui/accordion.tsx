"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const AccordionContext = React.createContext<{
  value?: string | string[]
  onValueChange?: (value: string | string[]) => void
}>({})

const AccordionItemContext = React.createContext<string>("")

const Accordion = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    type: "single" | "multiple"
    collapsible?: boolean
    value?: string | string[]
    defaultValue?: string | string[]
    onValueChange?: (value: string | string[]) => void
  }
>(({ children, className, value: controlledValue, defaultValue, onValueChange, ...props }, ref) => {
  const [internalValue, setInternalValue] = React.useState<string | string[]>(defaultValue || "")
  
  const value = controlledValue !== undefined ? controlledValue : internalValue
  
  const handleValueChange = (newValue: string | string[]) => {
    // If collapsible and clicking same item, close it (set to empty)
    // Note: This is a simplified logic for "single" type.
    const finalValue = (props.collapsible && value === newValue) ? "" : newValue;
    
    setInternalValue(finalValue)
    onValueChange?.(finalValue)
  }

  return (
    <AccordionContext.Provider value={{ value, onValueChange: handleValueChange }}>
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
})
Accordion.displayName = "Accordion"

const AccordionItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string }
>(({ className, value, ...props }, ref) => (
  <AccordionItemContext.Provider value={value}>
    <div ref={ref} className={cn("border-b", className)} {...props} />
  </AccordionItemContext.Provider>
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, children, onClick, ...props }, ref) => {
  const { value, onValueChange } = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue

  return (
    <div className="flex">
      <button
        ref={ref}
        type="button"
        onClick={(e) => {
             if (Array.isArray(value)) {
               // Multiple mode: toggle item in array
               const newValue = value.includes(itemValue) 
                 ? value.filter(v => v !== itemValue)
                 : [...value, itemValue];
               onValueChange?.(newValue);
             } else {
               // Single mode
               onValueChange?.(itemValue);
             }
             onClick?.(e)
        }}
        className={cn(
          "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
          className
        )}
        data-state={isOpen ? "open" : "closed"}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
      </button>
    </div>
  )
})
AccordionTrigger.displayName = "AccordionTrigger"

const AccordionContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  const { value } = React.useContext(AccordionContext)
  const itemValue = React.useContext(AccordionItemContext)
  const isOpen = Array.isArray(value) ? value.includes(itemValue) : value === itemValue

  if (!isOpen) return null

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden text-sm transition-all animate-accordion-down",
        className
      )}
      {...props}
    >
      <div className="pb-4 pt-0">{children}</div>
    </div>
  )
})
AccordionContent.displayName = "AccordionContent"

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
