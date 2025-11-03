import { ChevronRight } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

function getUserRole() {
  try {
    const cuStr = localStorage.getItem("currentUser")
    if (cuStr) {
      const cu = JSON.parse(cuStr)
      if (cu && cu.role) return cu.role
    }
  } catch {}
  const r = localStorage.getItem("role")
  return r || "entrepreneur"
}

export function NavMain({
  items,
  onNavigate
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Platform</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
          const isActive = pathname === item.url
          const role = getUserRole()
          const themeClass = isActive
            ? (role === 'freelancer' ? 'theme-freelancer' : role === 'investor' ? 'theme-investor' : 'theme-entrepreneur')
            : undefined
          return (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={item.title} asChild isActive={isActive} className={themeClass}>
                  <a
                    href={item.url}
                    onClick={(e) => {
                      if (onNavigate && item.url && item.url.startsWith('/')) {
                        e.preventDefault()
                        onNavigate(item.url)
                      }
                    }} aria-current={isActive ? 'page' : undefined}>
                    {item.icon && <item.icon className="size-4 text-foreground" />}
                    <span>{item.title}</span>
                    {/* <ChevronRight
                      className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" /> */}
                  </a>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                {/* <SidebarMenuSub>
                  {item.items?.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton asChild>
                        <a href={subItem.url}>
                          <span>{subItem.title}</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub> */}
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
