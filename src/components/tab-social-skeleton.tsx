import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"

export function TabSocialSkeleton() {
  return (
    // <Tabs defaultValue="friends" className="mt-4 md:mt-0 px-6 md:px-2">
    //   <div className="relative">
    //     <ScrollArea className="whitespace-nowrap">
    //       <TabsList className="min-w-full !flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground">
    //         <TabsTrigger value="friends" className="flex-1">
    //           Friends
    //         </TabsTrigger>
    //         <TabsTrigger value="friereq" className="flex-1">
    //           Friend Request
    //         </TabsTrigger>
    //       </TabsList>
    //       <ScrollBar orientation="horizontal" />
    //     </ScrollArea>
    //   </div>
    //   <TabsContent value="friends">
        <div className="bg-white px-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className={`flex flex-row items-center justify-between py-4 ${i !== 0 ? "border-t" : ""}`}>
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <div className="min-w-0 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="hidden h-3 w-16 sm:block" />
                </div>
              </div>
            </div>
          ))}
        </div>
    //   </TabsContent>
    //   <TabsContent value="friereq">
    //     <div className="space-y-4 p-4">
    //       <Skeleton className="h-8 w-full" />
    //       <Skeleton className="h-20 w-full" />
    //     </div>
    //   </TabsContent>
    // </Tabs>
  )
}
