import {
  BadgeCheck,
  ChevronsUpDown,
  LogOut,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({ user, onNavigate }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-xl p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-all duration-300 hover:bg-primary/5 hover:text-primary active:scale-[0.98] [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 data-[state=open]:bg-primary/10 data-[state=open]:text-primary data-[state=open]:shadow-inner"
          >
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg">CN</AvatarFallback>
            </Avatar>

            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>

            <ChevronsUpDown className="ml-auto size-4" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="z-[100] w-[var(--radix-dropdown-menu-trigger-width)] min-w-56 rounded-xl premium-card"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault()
                  onNavigate && onNavigate("/profile")
                }}
              >
                <BadgeCheck />
                <span>Account</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={(e) => {
                e.preventDefault()
                onNavigate && onNavigate("/login")
              }}
            >
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}