import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import clsx from "clsx"
import { getFriendList } from "@/lib/data"

export async function TabSocial() {
  const friendList = await getFriendList()
  return (
    <div className="bg-white px-6">
      {friendList.map((friend, i) => {
        return (
          <div
            key={friend.user_id}
            className={clsx(
              'flex flex-row items-center justify-between py-4',
              {
                'border-t': i !== 0,
              },
            )}
          >
            <div className="flex items-center">
            <Avatar className="h-10 w-10 mr-3 rounded-lg">
              <AvatarFallback className="rounded-lg">{friend.username[0]}</AvatarFallback>
            </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold md:text-base">
                  {friend.username}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  )
}
