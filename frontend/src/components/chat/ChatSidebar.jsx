import * as React from "react"
import { Search } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { formatTime } from "@/services/chatService"

export function ChatSidebar({
  users,
  selectedUserId,
  onSelectUser,
  isLoading = false,
  className,
}) {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [roleFilter, setRoleFilter] = React.useState("All")

  const filteredUsers = React.useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return (users || []).filter((user) => {
      const matchesQuery = !q || (user?.name || "").toLowerCase().includes(q)
      const role = (user?.role || "").toString().toLowerCase()
      const filter = roleFilter.toLowerCase()
      const matchesRole = filter === "all" || role === filter
      return matchesQuery && matchesRole
    })
  }, [users, searchQuery, roleFilter])

  // Group users by role for segregated sections
  const groupedByRole = React.useMemo(() => {
    const groups = { Entrepreneur: [], Investor: [], Freelancer: [], Other: [] }
    for (const u of filteredUsers) {
      // Normalize role: trim whitespace, convert to lowercase for comparison
      const r = (u?.role || '').toString().trim().toLowerCase()
      
      // More robust role matching
      if (r === 'entrepreneur' || r === 'entrepreneurs') {
        groups.Entrepreneur.push(u)
      } else if (r === 'investor' || r === 'investors') {
        groups.Investor.push(u)
      } else if (r === 'freelancer' || r === 'freelancers') {
        groups.Freelancer.push(u)
      } else {
        // For debugging - log unexpected roles
        if (r && r !== '') {
          console.log('Unmatched role:', r, 'for user:', u?.name)
        }
        groups.Other.push(u)
      }
    }
    return groups
  }, [filteredUsers])

  return (
    <div className={cn("flex flex-col h-full border-r bg-background", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            { label: "All" },
            { label: "Entrepreneur" },
            { label: "Freelancer" },
            { label: "Investor" },
          ].map((r) => (
            <Badge
              key={r.label}
              variant={roleFilter === r.label ? "default" : "secondary"}
              className="cursor-pointer select-none"
              onClick={() => setRoleFilter(r.label)}>
              {r.label}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* Users List - Segregated by role */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex items-center justify-center h-full p-8">
            <p className="text-sm text-muted-foreground text-center">
              {searchQuery
                ? "No users found"
                : "No users available"}
            </p>
          </div>
        ) : (
          <div className="p-2 space-y-4">
            {Object.entries(groupedByRole).map(([groupTitle, groupUsers]) => (
              groupUsers.length > 0 && (
                <div key={groupTitle}>
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {groupTitle}
                  </div>
                  <div className="mt-1 space-y-1">
                    {groupUsers.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => onSelectUser(user)}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-accent text-left",
                          selectedUserId === user.id && "bg-accent"
                        )}>
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={user.isCommunity ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}` : user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {!user.isCommunity && (
                            <Badge
                              variant={user.status === "online" ? "default" : "secondary"}
                              className={cn(
                                "absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-background p-0",
                                user.status === "online" ? "bg-green-500" : "bg-gray-400"
                              )}>
                              <span className="sr-only">{user.status}</span>
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 min-w-0">
                              <h3 className="font-medium truncate">{user.name}</h3>
                                {user.isCommunity ? (
                                  <Badge variant="default" className="bg-blue-600 text-[10px] px-1.5 py-0 h-5 shrink-0 font-bold uppercase">
                                    Community
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="text-xs px-1.5 py-0 h-5 shrink-0">
                                    {user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : 'User'}
                                  </Badge>
                                )}
                              </div>
                              {user.isCommunity && (
                                <span className="text-[10px] bg-muted px-1 rounded text-muted-foreground ml-1">
                                  {user.memberCount || 2} members
                                </span>
                              )}
                            {user.lastMessageTime && (
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatTime(user.lastMessageTime)}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm text-muted-foreground truncate">
                              {user.lastMessage || "No messages yet"}
                            </p>
                            {user.unreadCount > 0 && (
                              <Badge
                                variant="default"
                                className="h-5 min-w-5 flex items-center justify-center px-1.5 rounded-full text-xs">
                                {user.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

