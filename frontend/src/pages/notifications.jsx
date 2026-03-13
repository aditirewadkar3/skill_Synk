import * as React from "react"
import { communityAPI } from "@/services/api"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Bell, Users, Check, X, Clock } from "lucide-react"

export default function NotificationsPage() {
  const [notifications, setNotifications] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(null)

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const data = await communityAPI.getNotifications()
      setNotifications(data)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchNotifications()
  }, [])

  const handleRespond = async (requestId, action) => {
    try {
      setActionLoading(requestId)
      const res = await communityAPI.respond(requestId, action)
      if (res.success) {
        setNotifications(prev => prev.filter(n => n.id !== requestId))
      }
    } catch (error) {
      alert(error.message || `Failed to ${action} request`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
            <p className="text-muted-foreground">Manage your community requests and alerts.</p>
          </div>
        </div>

        <Card className="rounded-2xl border shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Community Requests
            </CardTitle>
            <CardDescription>
              Other freelancers wanting to join your professional circle.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-muted-foreground">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="inline-flex p-3 bg-muted rounded-full">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No pending community requests.</p>
              </div>
            ) : (
              <div className="divide-y border rounded-xl overflow-hidden">
                {notifications.map((notification) => (
                  <div key={notification.id} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10 border">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${notification.senderUid}`} />
                        <AvatarFallback>{notification.senderName?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">
                          <span className="font-bold">{notification.senderName}</span> sent you a community request
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="default"
                        className="h-8 gap-1"
                        disabled={actionLoading === notification.id}
                        onClick={() => handleRespond(notification.id, 'accept')}
                      >
                        <Check className="h-4 w-4" />
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="h-8 gap-1"
                        disabled={actionLoading === notification.id}
                        onClick={() => handleRespond(notification.id, 'decline')}
                      >
                        <X className="h-4 w-4" />
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
