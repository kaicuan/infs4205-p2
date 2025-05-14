import Map from "@/components/map"
import type { Location, User } from "@/lib/definitions"
import { getFriendList, getLastPosition, getNearbySpot, getSpotRecommendation } from "@/api/data"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileDrawer } from "@/components/mobile-drawer"
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { TabSocial } from "@/components/tab-social"
import { Suspense } from "react"
import { TabSocialSkeleton } from "@/components/tab-social-skeleton"
import TabNearYou from "@/components/tab-nearyou"
import MapWrapper from "@/components/map-wrapper"
import NavMenu from "@/lib/nav-menu"

const tabComponentMap = {
  nearyou: {
    Component: TabNearYou,
    fetcher: (bb?: string) => getNearbySpot(bb),
  },
  foryou: {
    Component: TabNearYou,
    fetcher: (bb?: string) => getNearbySpot(bb),
  },
  advanced: {
    Component: TabNearYou,
    fetcher: (bb?: string) => getNearbySpot(bb),
  },
  friend: {
    Component: TabSocial,
    fetcher: () => getFriendList(),
  },
} as const;

type TabKey = keyof typeof tabComponentMap

export default async function Home(props: {
  searchParams?: {
    c?: string
    z?: number
    bb?: string
    tab?: string
    explore?: string
  }
}) {
  const session = await auth()
  const user = session?.user as User

  const searchParams = await props.searchParams || {}

  const tab = searchParams.tab || "nearyou"
  const menu = NavMenu.find(section =>
    section.content.some(menu => menu.value === tab)
  ) || NavMenu[0];
  const explore = searchParams.explore || "nearyou"

  const TabConfig = tabComponentMap[tab as TabKey] || tabComponentMap.nearyou

  // Determine promises
  let mapPromise: Promise<any> | undefined
  let contentPromise: Promise<any> | undefined
  
  if (menu.value === "explore") {
    contentPromise = TabConfig.fetcher(searchParams.bb)
    mapPromise = contentPromise
  } else {
    contentPromise = TabConfig.fetcher()
    mapPromise = tabComponentMap[explore as TabKey].fetcher(searchParams.bb)
  }

  const content = (
    <Suspense fallback={<TabSocialSkeleton />}>
      <TabConfig.Component promise={contentPromise} />
    </Suspense>
  )

  // Determine map center
  let center: [number, number] | undefined
  if (!searchParams.c) {
    const lastPos = await getLastPosition()
    if (lastPos[0]) {
      center = lastPos[0].geom.coordinates
    }
  }

  return (
    <div className="h-screen w-screen flex">
      <SidebarProvider>
        <AppSidebar 
          tab={tab}
          user={user}
        >
          {content}
        </AppSidebar>
        
        <MobileBottomNav 
          tab={tab}
          user={user} 
        />
        
        <MobileDrawer tab={tab}>
          {content}
        </MobileDrawer>
        
        <Suspense>
          <MapWrapper promise={mapPromise} center={center} />
        </Suspense>
      </SidebarProvider>
    </div>
  )
}