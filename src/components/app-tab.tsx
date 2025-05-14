"use client"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import NavMenu from "@/lib/nav-menu"
import { TabSocialSkeleton } from "./tab-social-skeleton"

export function AppTab({
  tab,
  children,
}: { 
  tab:string,
  children: React.ReactNode,
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeMenu = NavMenu.find(section =>
    section.content.some(item => item.value === tab)
  )!;

  const handleTabClick = (newtab: string) => {
    if (newtab !== tab) {
      const params = new URLSearchParams(searchParams)
      params.set("tab", newtab)
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <Tabs value={tab} onValueChange={handleTabClick} className="mt-4 md:mt-0 px-6 md:px-2">
      <div className="relative">
        <ScrollArea className="whitespace-nowrap">
          <TabsList className="min-w-full !flex h-10 items-center rounded-md bg-muted p-1 text-muted-foreground">
            {activeMenu.content.map(item => (
              <TabsTrigger
                className="flex-1"
                key={item.value}
                value={item.value}
                disabled={item.disabled}
              >
                {item.title}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
      <TabsContent key={tab} value={tab}>
        {children}
      </TabsContent>
      {/* {activeMenu.content.map(item => (
        <TabsContent key={item.value} value={item.value}>
          {item.value === tab ? children : <TabSocialSkeleton />}
        </TabsContent>
      ))} */}
    </Tabs>
  )
}
