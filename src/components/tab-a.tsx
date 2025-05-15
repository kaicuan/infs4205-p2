import { MapPin, UserRoundCheck } from "lucide-react";
import type { Location } from "@/lib/definitions";
import TabAContent from "@/components/tab-a-content";

export default async function TabA({ promise } : { promise?: Promise<Location[]> }) {
  let locations: Location[] = [];
  if (promise) {
    locations = await promise;
  }

  return (
    <TabAContent locations={locations} />
  );
}