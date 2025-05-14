import Map from "@/components/map";
import { Location } from "@/lib/definitions";

export default async function MapWrapper({
  promise,
  center,
} : {
  promise?:Promise<Location[]>,
  center?: [number, number]
}) {
  let locations: Location[] = [];
  if (promise) {
    locations = await promise;
  }

  return <Map locations={locations} initialPosition={center} />
}