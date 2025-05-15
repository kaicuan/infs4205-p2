import { MapPin, UserRoundCheck } from "lucide-react";
import type { Location } from "@/lib/definitions";
import TabAInput from "@/components/tab-a-input";

export default function TabAContent({ locations } : { locations : Location[] }) {

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400 italic px-2 text-justify">
      Retrieves the most frequently checked-in spots within the current map view, with optional filters for date range and friend-only check-ins
      </p>
      
      <div className="space-y-2">
        <TabAInput />
        {locations.map((location) => (
          <div 
            key={location.location_id}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-gray-100">
                  ID: {location.location_id}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {location.geom.coordinates[0].toFixed(4)}, {location.geom.coordinates[1].toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-full">
              <UserRoundCheck className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="font-medium text-gray-900 dark:text-gray-100">
                {location.checkin_count}
              </span>
            </div>
          </div>
        ))}
      </div>

      {locations.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          No nearby locations found
        </div>
      )}
    </div>
  );
}