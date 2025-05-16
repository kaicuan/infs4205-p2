import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"

export function TabExplore() {

  return (
    <Tabs defaultValue="friends" className="mt-4 md:mt-0 px-6 md:px-2">
      <div className="relative">
        <ScrollArea className="whitespace-nowrap">
          <TabsList className="min-w-full !flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground">
            <TabsTrigger value="a" className="flex-1">Near You</TabsTrigger>
            <TabsTrigger value="a" className="flex-1">For You</TabsTrigger>
            <TabsTrigger value="b" className="flex-1">Advanced</TabsTrigger>
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <TabsContent value="a">
        {/* Create a UI for Near You. This should show the list of spots near the user*/}
      </TabsContent>
    </Tabs>
  )
}
