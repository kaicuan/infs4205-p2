import { MapPin, UserRoundCheck } from "lucide-react";
import type { Location } from "@/lib/definitions";
import TabBContent from "@/components/tab-b-content";

export default async function TabB({ promise } : { promise?: Promise<Location[]> }) {
  let locations: Location[] = [];
  if (promise) {
    locations = await promise;
  }

  return (
    <TabBContent locations={locations} />
  );
}