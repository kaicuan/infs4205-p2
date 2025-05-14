import { TabSocial } from "@/components/tab-social"
import { getFriendList } from "@/api/data"
import { Suspense } from "react"
import { TabSocialSkeleton } from "@/components/tab-social-skeleton"

export default async function TabSocialContainer() {
  const friendList = await getFriendList()

  return <TabSocial friendList={friendList} />
}

export function TabSocialWithSuspense() {
  return (
    <Suspense fallback={<TabSocialSkeleton />}>
      <TabSocialContainer />
    </Suspense>
  )
}