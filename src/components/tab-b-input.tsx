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
  const initialN = searchParams.get('n') ? parseInt(searchParams.get('n')!) : 50
  const initialK = searchParams.get('k') ? parseInt(searchParams.get('k')!) : 30
  const initialStartDate = searchParams.get('start_date') || undefined
  const initialEndDate = searchParams.get('end_date') || undefined

  // State management
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({
    from: initialStartDate,
    to: initialEndDate
  })
  const [friendOnly, setFriendOnly] = useState(initialFriendOnly)
  const [nValue, setNValue] = useState(initialN)
  const [kValue, setKValue] = useState(initialK)
  const [nSliderValue, setNSliderValue] = useState([initialN])
  const [sliderValue, setSliderValue] = useState([initialK])

  // Check for changes whenever state updates
  useEffect(() => {
    const changesExist = (
      dateRange.from !== initialStartDate ||
      dateRange.to !== initialEndDate ||
      friendOnly !== initialFriendOnly ||
      kValue !== initialK ||
      nValue !== initialN
    )
    console.log(nValue, " = ", initialN)
    setHasChanges(changesExist)
  }, [dateRange, friendOnly, kValue, nValue, initialStartDate, initialEndDate, initialFriendOnly, initialK, initialN])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasChanges) return
    
    const newParams = new URLSearchParams(searchParams.toString())

    // Update params
    /* eslint-disable @typescript-eslint/no-unused-expressions */
    dateRange.from ? newParams.set('start_date', dateRange.from) : newParams.delete('start_date')
    dateRange.to ? newParams.set('end_date', dateRange.to) : newParams.delete('end_date')
    friendOnly ? newParams.set('friend_only', 'true') : newParams.delete('friend_only')
    nValue !== 50 ? newParams.set('n', nValue.toString()) : newParams.delete('n')
    kValue !== 30 ? newParams.set('k', kValue.toString()) : newParams.delete('k')
    /* eslint-enable @typescript-eslint/no-unused-expressions */

    router.replace(`?${newParams.toString()}`)
    setHasChanges(false)
  }

  const handleNInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(5000, Math.max(50, parseInt(e.target.value) || 50))
    setNValue(value)
    setNSliderValue([value])
  }

  const handleNSliderChange = (value: number[]) => {
    const newValue = value[0]
    setNValue(newValue)
    setNSliderValue([newValue])
  }

  const handleKInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(100, Math.max(1, parseInt(e.target.value) || 1))
    setKValue(value)
    setSliderValue([value])
  }

  const handleKSliderChange = (value: number[]) => {
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
            {/* Minimum Number of Checkins */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Minimum Number of Checkins</label>
              <div className="flex gap-4 items-center">
                <Slider
                  value={nSliderValue}
                  onValueChange={handleNSliderChange}
                  min={50}
                  max={5000}
                  step={50}
                  className="flex-1"
                />
                <Input
                  value={nValue}
                  onChange={handleNInputChange}
                  type="number"
                  min={50}
                  max={5000}
                  className="w-20"
                />
              </div>
            </div>
            {/* Number of Spot Slider */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Spot</label>
              <div className="flex gap-4 items-center">
                <Slider
                  value={sliderValue}
                  onValueChange={handleKSliderChange}
                  min={1}
                  max={100}
                  step={1}
                  className="flex-1"
                />
                <Input
                  value={kValue}
                  onChange={handleKInputChange}
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