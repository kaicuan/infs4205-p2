import type { User } from "@/lib/definitions"
import { getFriendList, getLastPosition, getPopularSpots, getRecommendedSpots, getSpotByProximity } from "@/lib/data"
import { AppSidebar } from "@/components/app-sidebar"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { MobileDrawer } from "@/components/mobile-drawer"
import { SidebarProvider } from "@/components/ui/sidebar"
import { auth } from "@/auth"
import { TabSocial } from "@/components/tab-social"
import { Suspense } from "react"
import { TabSocialSkeleton } from "@/components/tab-social-skeleton"
import TabA from "@/components/tab-a"
import TabB from "@/components/tab-b"
import MapWrapper from "@/components/map-wrapper"
import NavMenu from "@/lib/nav-menu"
import TabC from "@/components/tab-c"

const tabComponentMap = {
  a: {
    Component: TabA,
    fetcher: (c?:string, bb?: string, k?: string, n?: string, start_date?: string, end_date?: string, friend_only?: string) => getPopularSpots(bb, k, start_date, end_date, friend_only),
  },
  b: {
    Component: TabB,
    fetcher: (c?:string, bb?: string, k?: string, n?: string, start_date?: string, end_date?: string, friend_only?: string) => getSpotByProximity(c, k, n, start_date, end_date, friend_only)
  },
  c: {
    Component: TabC,
    fetcher: (c?:string, bb?: string, k?: string, n?: string, start_date?: string, end_date?: string, friend_only?: string) => getRecommendedSpots(k, start_date, end_date, friend_only),
  },
  friend: {
    Component: TabSocial,
    fetcher: () => getFriendList(),
  },
} as const;

type TabKey = keyof typeof tabComponentMap

export default async function Home(props: {
  searchParams?: Promise<{
    c?: string
    z?: number
    bb?: string
    tab?: string
    explore?: string
    k?: string
    n?: string
    start_date?: string
    end_date?: string
    friend_only?: string
  }>
}) {
  const session = await auth()
  const user = session?.user as User

  const searchParams = await props.searchParams || {}
  let { tab, explore } = searchParams;
  const { c, bb, k, n, start_date, end_date, friend_only } = searchParams;

  tab = tab || "a"
  const menu = NavMenu.find(section =>
    section.content.some(menu => menu.value === tab)
  ) || NavMenu[0];
  explore = explore || "a"

  const TabConfig = tabComponentMap[tab as TabKey] || tabComponentMap.a

  // Determine promises
  let mapPromise: Promise<any> | undefined
  let contentPromise: Promise<any> | undefined
  

  
  if (menu.value === "explore") {
    contentPromise = TabConfig.fetcher(c, bb, k, n, start_date, end_date, friend_only)
    mapPromise = contentPromise
  } else {
    contentPromise = TabConfig.fetcher()
    mapPromise = tabComponentMap[explore as TabKey].fetcher(c, bb, k, n, start_date, end_date, friend_only)
  }

  const content = (
    <Suspense fallback={<TabSocialSkeleton />}>
      <TabConfig.Component promise={contentPromise} />
    </Suspense>
  )

  // Determine map center
  let center: [number, number] | undefined
  if (!c) {
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