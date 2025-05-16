import type { Location } from "@/lib/definitions";
import TabCContent from "@/components/tab-c-content";

export default async function TabC({ promise } : { promise?: Promise<Location[]> }) {
  let locations: Location[] = [];
  if (promise) {
    locations = await promise;
  }

  return (
    <TabCContent locations={locations} />
  );
}