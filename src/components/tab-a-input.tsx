'use client'

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-picker"
import { ListFilter } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function TabAInput() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Get initial values from URL
  const initialFriendOnly = searchParams.get('friend_only') === 'true'
  const initialK = searchParams.get('k') ? parseInt(searchParams.get('k')!) : 30
  const initialStartDate = searchParams.get('start_date') || undefined
  const initialEndDate = searchParams.get('end_date') || undefined

  // State management
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({
    from: initialStartDate,
    to: initialEndDate
  })
  const [friendOnly, setFriendOnly] = useState(initialFriendOnly)
  const [kValue, setKValue] = useState(initialK)
  const [sliderValue, setSliderValue] = useState([initialK])

  // Check for changes whenever state updates
  useEffect(() => {
    const changesExist = (
      dateRange.from !== initialStartDate ||
      dateRange.to !== initialEndDate ||
      friendOnly !== initialFriendOnly ||
      kValue !== initialK
    )
    setHasChanges(changesExist)
  }, [dateRange, friendOnly, kValue, initialStartDate, initialEndDate, initialFriendOnly, initialK])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    
    const newParams = new URLSearchParams(searchParams.toString())

    // Update date params
    if (dateRange.from) {
      newParams.set('start_date', dateRange.from)
    } else {
      newParams.delete('start_date')
    }
    
    if (dateRange.to) {
      newParams.set('end_date', dateRange.to)
    } else {
      newParams.delete('end_date')
    }

    // Update friend_only param
    if (friendOnly) {
      newParams.set('friend_only', 'true')
    } else {
      newParams.delete('friend_only')
    }

    // Update K param
    if (kValue !== 30) {
      newParams.set('k', kValue.toString())
    } else {
      newParams.delete('k')
    }

    router.replace(`?${newParams.toString()}`)
    setHasChanges(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
    setKValue(value)
    setSliderValue([value])
  }

  const handleSliderChange = (value: number[]) => {
    const newValue = value[0]
    setKValue(newValue)
    setSliderValue([newValue])
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-4 rounded-lg"
    >
      <form onSubmit={handleSubmit}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full flex justify-between items-center bg-gray-100 hover:bg-gray-200"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">Filters{hasChanges && " *"}</span>
            </div>
            <ListFilter className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="CollapsibleContent">
          <div className="space-y-4 p-4">
            {/* Number of Spot Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Spot</label>
              <div className="flex gap-4 items-center">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  min={1}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Input
                  value={kValue}
                  onChange={handleInputChange}
                  type="number"
                  min={1}
                  max={100}
                  className="w-20"
                />
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <DatePickerWithRange 
                value={dateRange}
                onChange={setDateRange}
              />
            </div>

            {/* Friends Only Switch */}
            <div className="flex justify-between items-center space-x-2">
              <label htmlFor="friend-only" className="text-sm font-medium">
                Friends Only
              </label>
              <Switch 
                id="friend-only" 
                checked={friendOnly} 
                onCheckedChange={setFriendOnly}
              />
            </div>

            {/* Submit Button */}
            <div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={!hasChanges}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </form>
    </Collapsible>
  )
}