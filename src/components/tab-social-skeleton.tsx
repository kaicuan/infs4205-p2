import { Skeleton } from "@/components/ui/skeleton"

export function TabSocialSkeleton() {
  return (
    <div className="bg-white px-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className={`flex flex-row items-center justify-between py-4 ${i !== 0 ? "border-t" : ""}`}>
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <div className="min-w-0 space-y-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="hidden h-3 w-16 sm:block" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
