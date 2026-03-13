import * as React from "react"
import { Bell, Users, Check, X } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { communityAPI, getCurrentUser } from "@/services/api"
import { cn } from "@/lib/utils"

export function NotificationPopover() {
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(false)
  const [actionLoading, setActionLoading] = React.useState(null)
  
  const user = getCurrentUser()
  const isFreelancer = user?.role === 'freelancer'

  const fetchNotifications = React.useCallback(async () => {
    if (!isFreelancer) return
    try {
      const data = await communityAPI.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }, [isFreelancer])

  React.useEffect(() => {
    fetchNotifications()
    
    // Listen for real-time notifications via global event
    const handleNotification = (e) => {
      console.log("Popover received notification event:", e.detail)
      fetchNotifications()
    }
    window.addEventListener('app:notification', handleNotification)
    
    // Poll for notifications every 30 seconds as fallback
    const interval = setInterval(fetchNotifications, 30000)
    
    return () => {
      window.removeEventListener('app:notification', handleNotification)
      clearInterval(interval)
    }
  }, [fetchNotifications])

  const handleRespond = async (e, requestId, action) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setActionLoading(requestId)
      const res = await communityAPI.respond(requestId, action)
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== requestId))
      }
    } catch (error) {
      console.error(`Failed to ${action} request:`, error)
    } finally {
      setActionLoading(null)
    }
  }

  const handleMarkRead = async (e, notificationId) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setActionLoading(notificationId)
      const res = await communityAPI.markRead(notificationId)
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    } finally {
      setActionLoading(null)
    }
  }

  if (!isFreelancer) return null

  const unreadCount = notifications.length

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-destructive text-destructive-foreground border-2 border-background"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 overflow-hidden">
        <DropdownMenuLabel className="p-4 flex items-center justify-between">
          <span className="font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="font-normal text-xs">
              {unreadCount} new
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <div className="inline-flex p-3 bg-muted rounded-full mb-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">All caught up!</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div 
                key={notification.id} 
                className="p-4 flex flex-col gap-3 hover:bg-muted/50 transition-colors border-b last:border-0"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.senderUid || notification.targetUid}`} />
                    <AvatarFallback>{(notification.senderName || notification.targetName)?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-none mb-1">
                      <span className="font-bold">{notification.senderName || notification.targetName}</span>
                    </p>
                    <p className="text-[13px] text-muted-foreground line-clamp-2">
                      {notification.isRequest 
                        ? "sent you a community invite" 
                        : (notification.message || "updated your request status")}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {notification.isRequest ? (
                    <>
                      <Button 
                        size="sm" 
                        className="flex-1 h-7 text-[11px] gap-1"
                        disabled={actionLoading === notification.id}
                        onClick={(e) => handleRespond(e, notification.id, 'accept')}
                      >
                        <Check className="h-3 w-3" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 h-7 text-[11px] gap-1"
                        disabled={actionLoading === notification.id}
                        onClick={(e) => handleRespond(e, notification.id, 'decline')}
                      >
                        <X className="h-3 w-3" />
                        Decline
                      </Button>
                    </>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="w-full h-7 text-[11px] hover:bg-muted"
                      disabled={actionLoading === notification.id}
                      onClick={(e) => handleMarkRead(e, notification.id)}
                    >
                      Dismiss
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <DropdownMenuItem 
          className="p-3 justify-center text-xs text-primary font-medium cursor-pointer rounded-none"
          onClick={() => {
            window.history.pushState({}, '', '/notifications')
            window.dispatchEvent(new Event('app:navigate'))
          }}
        >
          View all notifications
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
