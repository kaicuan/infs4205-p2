// components/ui/date-picker.tsx
"use client"

import { useState } from "react"
import { format, parseISO, startOfDay } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerWithRangeProps {
  className?: string
  value?: { from?: string; to?: string }
  onChange?: (range: { from?: string; to?: string }) => void
}

export function DatePickerWithRange({
  className,
  value,
  onChange
}: DatePickerWithRangeProps) {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: value?.from ? startOfDay(parseISO(value.from)) : undefined,
    to: value?.to ? startOfDay(parseISO(value.to)) : undefined
  })

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range)
    onChange?.({
      from: range?.from ? format(startOfDay(range.from), "yyyy-MM-dd") : undefined,
      to: range?.to ? format(startOfDay(range.to), "yyyy-MM-dd") : undefined
    })
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={new Date("2009-02")}
            selected={dateRange}
            onSelect={handleSelect}
            disabled={(date) =>
              date > new Date("2010-10-23") || date < new Date("2009-02-04")
            }
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}