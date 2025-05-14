"use client"

import * as React from "react"
import { LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import NavMenu from "@/lib/nav-menu"
import { signOutAction } from "@/api/actions"
import { User } from "@/lib/definitions"
import clsx from "clsx"
import { usePathname, useSearchParams, useRouter } from "next/navigation"

export function MobileBottomNav({ user, tab }: { user:User, tab?:string }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "nearyou"
  const activeMenu = NavMenu.find(section =>
    section.content.some(menu => menu.value === activeTab)
  ) || NavMenu[0];
  const explore = searchParams.get("explore")

  const [sheetOpen, setSheetOpen] = React.useState(false)
 
  const handleTabClick = (newMenu:string, newTab: string) => {
    // Only navigate if the tab is changing
    if (newMenu !== activeMenu.value) {
      const params = new URLSearchParams(searchParams)
      params.set("tab", newTab)
      if(newMenu == "explore" && explore){
        params.set("tab", explore)
      }
      if(activeMenu.value == "explore" && newMenu != "explore") {
        params.set("explore", activeTab)
      }
      router.push(`${pathname}?${params.toString()}`)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[56px] bg-background border-t flex items-center justify-around z-100 md:hidden">
      {NavMenu.map((menu) => (
        <Button
          key={menu.value}
          onClick={() => handleTabClick(menu.value, menu.content[0].value)}
          variant="ghost"
          size="icon"
          className={clsx(
            "h-12 w-12 rounded-none border-accent-foreground",
            activeMenu.value === menu.value && "border-b-2"
          )}
        >
          <menu.icon className="h-5 w-5" />
        </Button>
      ))}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Avatar className="h-7 w-7 rounded-lg">
            <AvatarFallback className="rounded-full">{user.username.charAt(0)}</AvatarFallback>
          </Avatar>
        </SheetTrigger>
        <SheetContent side="right" className="h-full w-full">
          <SheetHeader className="mb-6">
            <SheetTitle>Profile</SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarFallback className="text-3xl">{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{user.username}</h2>
            <form action={signOutAction}>
              <Button
                variant="destructive"
                className="mt-auto w-full max-w-xs"
                onClick={() => {
                  setSheetOpen(false)
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
