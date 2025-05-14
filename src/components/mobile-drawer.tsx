"use client"

import { Drawer, DrawerTitle, DrawerContent } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import { AppTab } from "@/components/app-tab"


interface MobileDrawerProps {
  tab: string;
  children?: React.ReactNode;
}

const snapPoints = ['84px', 0.4, 0.8];

export function MobileDrawer({ tab, children }: MobileDrawerProps) {
  const [snap, setSnap] = useState<number | string | null>(snapPoints[1]);
  return (
    <Drawer
      open={true}
      modal={false}
      dismissible={false}
      snapPoints={snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      snapToSequentialPoint
    >
      <DrawerContent
        className="md:hidden h-[100vh]"
        data-testid="content"
        >
          <DrawerTitle className="hidden">Explore</DrawerTitle>
          <ScrollArea className="h-[78vh] pb-14 max-w-[400px] mx-auto w-full">
            <AppTab tab={tab}>
              {children}
            </AppTab>
          </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}
