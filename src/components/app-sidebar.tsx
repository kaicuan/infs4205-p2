import { Command } from "lucide-react"
import NavMenu from "@/lib/nav-menu"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AppSidebarMenu } from "@/components/app-sidebar-menu"
import { AppTab } from "@/components/app-tab"
import { User } from "@/lib/definitions"

interface AppSidebarProps {
  tab: string,
  user: User,
  children?: React.ReactNode
}

export async function AppSidebar({ tab, user, children }: AppSidebarProps) {
  const activeMenu = NavMenu.find(section =>
    section.content.some(item => item.value === tab)
  )!;

  return (
    <Sidebar
      collapsible="icon"
      className="overflow-hidden [&>[data-sidebar=sidebar]]:flex-row"
    >
      {/* This is the first sidebar */}
      {/* We disable collapsible and adjust width to icon. */}
      {/* This will make the sidebar appear as icons. */}
      <Sidebar
        collapsible="none"
        className="!w-[calc(var(--sidebar-width-icon)_+_1px)] border-r"
      >
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" asChild className="md:h-8 md:p-0">
                <a href="#">
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Command className="size-4" />
                  </div>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent className="px-1.5 md:px-0">
             <AppSidebarMenu />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <NavUser user={user} />
        </SidebarFooter>
      </Sidebar>

      {/* This is the second sidebar */}
      {/* We disable collapsible and let it fill remaining space */}
      <Sidebar collapsible="none" className="hidden flex-1 md:flex max-w-[334px]">
        <SidebarHeader className="gap-3.5 border-b p-4 mb-3">
          <div className="flex w-full items-center gap-2">
            <div className="text-base font-medium text-foreground">
              {activeMenu?.title}
            </div>
            <SidebarTrigger className="ml-auto" />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <AppTab tab={tab}>
            {children}
          </AppTab>
        </SidebarContent>
      </Sidebar>
    </Sidebar>
  )
}
