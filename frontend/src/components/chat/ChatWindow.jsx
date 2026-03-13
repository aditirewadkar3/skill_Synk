import * as React from "react"
import { ArrowLeft, Video, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { TypingIndicator } from "./TypingIndicator"
import { cn } from "@/lib/utils"
import { getCurrentUser, meetingsAPI } from "@/services/api"
import { CommunityManagement } from "./CommunityManagement"

export function ChatWindow({
  user,
  messages,
  onSendMessage,
  onBack,
  isTyping = false,
  connectionStatus = "connected",
  onUpdateCommunityName,
  className,
}) {
  const [scheduleOpen, setScheduleOpen] = React.useState(false)
  const [meetingLoading, setMeetingLoading] = React.useState(false)
  const [meetingLink, setMeetingLink] = React.useState(null)
  const [communitySettingsOpen, setCommunitySettingsOpen] = React.useState(false)
  const getUserRole = React.useCallback(() => {
    try {
      const cuStr = localStorage.getItem("currentUser")
      if (cuStr) {
        const cu = JSON.parse(cuStr)
        if (cu && cu.role) return cu.role
      }
    } catch {}
    const r = localStorage.getItem("role")
    return r || "entrepreneur"
  }, [])
  const role = getUserRole()
  const roleLabel = role ? role.charAt(0).toUpperCase() + role.slice(1) : ""
  const messagesEndRef = React.useRef(null)
  const scrollAreaRef = React.useRef(null)

  const scrollToBottom = React.useCallback(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector(
        '[data-radix-scroll-area-viewport]'
      )
      if (viewport) {
        setTimeout(() => {
          viewport.scrollTop = viewport.scrollHeight
        }, 100)
      }
    }
  }, [])

  // Auto-scroll to bottom when new messages arrive
  React.useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping, scrollToBottom])

  if (!user) {
    return (
      <div
        className={cn(
          "flex flex-col h-full min-h-0 overflow-hidden items-center justify-center text-center p-8",
          className
        )}>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">No chat selected</h3>
          <p className="text-sm text-muted-foreground">
            Select a user from the sidebar to start a conversation
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col h-full min-h-0 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center gap-4 border-b bg-background p-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold truncate">{user.name}</h2>
            <Badge
              variant={user.status === "online" ? "default" : "secondary"}
              className={cn(
                "h-2 w-2 rounded-full p-0",
                user.status === "online" ? "bg-green-500" : "bg-gray-400"
              )}>
              <span className="sr-only">{user.status}</span>
            </Badge>
            
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {user.status}
          </p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Start video call" onClick={() => setScheduleOpen(true)}>
          <Video className="h-5 w-5" />
        </Button>
        {user.isCommunity && (
          <Button 
            variant="ghost" 
            size="icon" 
            aria-label="Community settings" 
            onClick={() => setCommunitySettingsOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </Button>
        )}
        <Badge
          variant={connectionStatus === "connected" ? "default" : "secondary"}
          className="text-xs">
          {connectionStatus === "connected" ? "Connected" : "Disconnected"}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          {roleLabel}
        </Badge>
      </div>

      <Separator />

      {/* Schedule Meeting Popup */}
      <Sheet open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <SheetContent side="right" className="w-full sm:w-[380px]">
          <SheetHeader>
            <SheetTitle>Schedule a meeting</SheetTitle>
            <SheetDescription>
              Send a quick invite to {user?.name}.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4 space-y-4">
            {!meetingLink ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Create a LiveKit meeting and share the invite link.</p>
                <Button disabled={meetingLoading} onClick={async () => {
                  try {
                    setMeetingLoading(true)
                    const res = await meetingsAPI.schedule({ participantId: user?.id, participantName: user?.name })
                    if (res?.success && res?.token && res?.roomName) {
                      const link = `${window.location.origin}/meeting/${res.roomName}?token=${res.token}`;
                      setMeetingLink(link);
                    } else {
                      setMeetingLink(res?.links?.host || null)
                    }
                  } catch (e) {
                    console.error('Schedule meeting failed', e)
                  } finally {
                    setMeetingLoading(false)
                  }
                }}>{meetingLoading ? 'Creating…' : 'Create meeting now'}</Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Your join link</label>
                  <Input readOnly value={meetingLink} onFocus={(e) => e.target.select()} />
                </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <Button className="w-full" onClick={() => {
                      const cleanLink = meetingLink.split('?')[0];
                      onSendMessage(`📅 Scheduled a LiveKit meeting. Join here: ${cleanLink}`);
                      window.open(meetingLink, '_blank');
                      setScheduleOpen(false);
                      setMeetingLink(null);
                    }}>Join & Share to Chat</Button>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(meetingLink)}>Copy Link</Button>
                      <Button variant="ghost" className="flex-1" onClick={() => setMeetingLink(null)}>Cancel</Button>
                    </div>
                  </div>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Community Settings */}
      {user.isCommunity && (
        <CommunityManagement
          chatId={user.id}
          communityName={user.name}
          open={communitySettingsOpen}
          onOpenChange={setCommunitySettingsOpen}
          onUpdateName={(newName) => {
             // Update the current user object in state and global state
             if (onUpdateCommunityName) {
               onUpdateCommunityName(user.id, newName);
             }
             setCommunitySettingsOpen(false);
          }}
          onLeave={() => {
            onBack();
            if (window.location) window.location.reload();
          }}
        />
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 min-h-0" ref={scrollAreaRef}>
        <div className="py-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-8">
              <p className="text-sm text-muted-foreground">
                No messages yet. Start the conversation!
              </p>
            </div>
          ) : (
            messages.map((message) => {
              const currentUser = getCurrentUser()
              const currentUserId = localStorage.getItem('uid')
              const isOwn = message.senderId === currentUserId || message.senderId === currentUser?.uid
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                />
              )
            })
          )}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="mt-auto border-t bg-background">
        <MessageInput
          onSend={onSendMessage}
          disabled={connectionStatus !== "connected"}
        />
      </div>
    </div>
  )
}

