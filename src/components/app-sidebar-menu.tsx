"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import NavMenu, { getMenuFromTab } from "@/lib/nav-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function AppSidebarMenu() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "a"
  const activeMenu = getMenuFromTab(activeTab)
  const explore = searchParams.get("explore")
  
  const { toggleSidebar, setOpen } = useSidebar()

  const handleMenuClick = (newMenu:string, newTab: string) => {
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
      setOpen(true)
    } else {
      toggleSidebar()
    }
  }

  return (
    <SidebarMenu>
      {NavMenu.map((menu) => (
        <SidebarMenuItem key={menu.title}>
          <SidebarMenuButton
            tooltip={{ children: menu.title, hidden: false }}
            onClick={() => handleMenuClick(menu.value, menu.content[0].value)}
            isActive={activeMenu.value === menu.value}
            className="px-2.5 md:px-2"
          >
            <menu.icon />
            <span>{menu.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  )
}