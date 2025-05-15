import { LucideIcon } from "lucide-react";
import { Compass, UsersRound } from "lucide-react"

export interface NavMenuSubItem {
  title: string;
  value: string;
  disabled?: boolean;
}

export interface NavMenuItem {
  title: string;
  value: "explore" | "social";
  icon: LucideIcon;
  content: NavMenuSubItem[];
}

const NavMenu: NavMenuItem[] = [
  {
    title: "Explore",
    value: "explore",
    icon: Compass,
    content: [
      {
        title: "Top Spots",
        value: "a",
      },
      {
        title: "Nearby Favorites",
        value: "b",
      },
      {
        title: "For you",
        value: "c"
      }
    ]
  },
  {
    title: "Social",
    value: "social",
    icon: UsersRound,
    content: [
      {
        title: "Friend",
        value: "friend",
      },
      {
        title: "Friend Request",
        value: "friereq",
        disabled: true,
      },
    ]
  },
]

export function getMenuFromTab(tab:string) {
  return NavMenu.find(menu =>
    menu.content.some(t => t.value === tab)
  ) || NavMenu[0];
}

export default NavMenu;