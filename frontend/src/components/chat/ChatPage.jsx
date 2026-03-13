import * as React from "react"
import { io } from "socket.io-client"
import { ChatSidebar } from "./ChatSidebar"
import { ChatWindow } from "./ChatWindow"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { chatAPI } from "@/services/api"
import { getAuthToken, setAuthToken } from "@/services/api"
import { getAuth } from "firebase/auth"

const SOCKET_URL = "http://localhost:3001"

export function ChatPage({ className }) {
  const [selectedUserId, setSelectedUserId] = React.useState(null)
  const [messages, setMessages] = React.useState([])
  const [users, setUsers] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isTyping, setIsTyping] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected")
  const [socket, setSocket] = React.useState(null)
  const { toast } = useToast()
  const currentUserId = React.useMemo(() => localStorage.getItem('uid'), [])

  // Load conversations from database
  React.useEffect(() => {
    const loadConversations = async () => {
      try {
        setIsLoading(true)
        // Ensure we have a fresh Firebase ID token
        try {
          const auth = getAuth()
          if (auth?.currentUser) {
            const fresh = await auth.currentUser.getIdToken(true)
            if (fresh) setAuthToken(fresh)
          }
        } catch {}
        const conversations = await chatAPI.getConversations()
        
        // Transform and de-duplicate users list
        const usersMap = new Map()
        conversations.forEach(conv => {
          if (!usersMap.has(conv.otherUserId)) {
            usersMap.set(conv.otherUserId, {
              id: conv.otherUserId,
              name: conv.otherUser?.name || conv.otherUserId?.substring(0, 8) || 'User',
              avatar: conv.otherUser?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(conv.otherUser?.name || conv.otherUserId)}`,
              status: 'online',
              lastMessage: conv.lastMessage || '',
              lastMessageTime: new Date(conv.lastMessageTime),
              unreadCount: conv.unreadCount || 0,
              role: conv.otherUser?.role || '',
              isCommunity: !!conv.isCommunity,
            })
          }
        })
        const usersList = Array.from(usersMap.values())
        setUsers(usersList)

        // Check if there's a target user from URL
        const params = new URLSearchParams(window.location.search)
        const targetUid = params.get('with') || localStorage.getItem('chatTargetUid')
        if (targetUid) {
          // If target user not in conversations, fetch their info
          if (!usersList.find(u => u.id === targetUid)) {
            try {
              const res = await fetch('http://localhost:3001/api/auth/get-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid: targetUid })
              })
              if (res.ok) {
                const data = await res.json()
                const name = data?.user?.name || (data?.user?.email ? data.user.email.split('@')[0] : 'User')
                const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
                setUsers(prev => [{ 
                  id: targetUid, 
                  name, 
                  avatar, 
                  status: 'online', 
                  unreadCount: 0,
                  role: data?.user?.role || ''
                }, ...prev])
              }
            } catch (err) {
              console.error('Error fetching target user:', err)
            }
          }
          setSelectedUserId(targetUid)
          localStorage.removeItem('chatTargetUid')
        }
      } catch (error) {
        console.error('Error loading conversations:', error)
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (currentUserId) {
      loadConversations()
    }
  }, [currentUserId, toast])

  // Initialize Socket.IO connection
  React.useEffect(() => {
    if (!currentUserId) return

    const token = getAuthToken()
    if (!token) {
      console.error('No auth token available for Socket.IO')
      return
    }

    const socketOptions = {
      auth: { token: token },
      // Add reconnection parameters
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    }

    const newSocket = io(SOCKET_URL, socketOptions)

    newSocket.on('connect', () => {
      console.log('Socket.IO connected')
      setConnectionStatus("connected")
    })

    newSocket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason)
      setConnectionStatus("disconnected")
    })

    newSocket.on('error', (error) => {
      console.error('Socket error:', error)
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [currentUserId]) // Remove selectedUserId from dependencies

  // Handle incoming messages and typing separately to avoid reconnections
  React.useEffect(() => {
    if (!socket) return

    const handleMessage = (message) => {
      // Logic for message handling
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        const isForCurrentChat = (message.senderId === selectedUserId || message.receiverId === selectedUserId)
        if (!isForCurrentChat && message.receiverId === currentUserId) {
          // Message for a different chat - sidebar will update but messages won't
        }
        if (isForCurrentChat) {
          return [...prev, {
            ...message,
            timestamp: new Date(message.timestamp),
          }].sort((a, b) => {
            const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
            const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
            return timeA - timeB
          })
        }
        return prev
      })

      // Update user's last message in sidebar
      setUsers(prev => prev.map(u => 
        (u.id === message.senderId || u.id === message.receiverId) ? {
          ...u,
          lastMessage: message.content,
          lastMessageTime: new Date(message.timestamp),
          unreadCount: (message.senderId !== currentUserId && message.senderId !== selectedUserId) ? (u.unreadCount + 1) : u.unreadCount
        } : u
      ))
    }

    const handleMessageSent = (message) => {
      setMessages(prev => {
        if (prev.find(m => m.id === message.id)) return prev
        return [...prev, {
          ...message,
          timestamp: new Date(message.timestamp),
        }].sort((a, b) => {
          const timeA = a.timestamp?.getTime?.() || new Date(a.timestamp).getTime()
          const timeB = b.timestamp?.getTime?.() || new Date(b.timestamp).getTime()
          return timeA - timeB
        })
      })
    }

    const handleTyping = (data) => {
      if (data.userId === selectedUserId) {
        setIsTyping(data.isTyping)
      }
    }

    socket.on('message', handleMessage)
    socket.on('message-sent', handleMessageSent)
    socket.on('typing', handleTyping)

    return () => {
      socket.off('message', handleMessage)
      socket.off('message-sent', handleMessageSent)
      socket.off('typing', handleTyping)
    }
  }, [socket, selectedUserId, currentUserId])

  // Reconnect socket when token is refreshed
  React.useEffect(() => {
    const onRefreshed = (e) => {
      const newToken = e?.detail?.token
      if (!newToken) return
      if (socket) {
        try { socket.disconnect() } catch {}
      }
      const newSocket = io(SOCKET_URL, { auth: { token: newToken } })
      setSocket(newSocket)
    }
    window.addEventListener('auth:token-refreshed', onRefreshed)
    return () => window.removeEventListener('auth:token-refreshed', onRefreshed)
  }, [socket])

  // Load messages when user is selected
  React.useEffect(() => {
    const loadMessages = async () => {
      if (!selectedUserId || !currentUserId) {
        setMessages([])
        return
      }

      try {
        const messagesData = await chatAPI.getMessages(selectedUserId)
        // Transform timestamps (backend sends ISO strings)
        const transformedMessages = messagesData.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
        setMessages(transformedMessages)

        // Mark messages as read and update sidebar
        setUsers(prevUsers =>
          prevUsers.map((user) =>
            user.id === selectedUserId ? { ...user, unreadCount: 0 } : user
          )
        )
      } catch (error) {
        console.error('Error loading messages:', error)
        toast({
          title: "Error",
          description: "Failed to load messages",
          variant: "destructive",
        })
      }
    }

    loadMessages()
  }, [selectedUserId, currentUserId, toast])

  // Handle sending a message
  const handleSendMessage = React.useCallback(
    async (content) => {
      if (!selectedUserId || !content.trim() || !currentUserId) return

      try {
        // Send via API
        const response = await chatAPI.sendMessage(selectedUserId, content.trim())
        
        if (response.success && response.message) {
          const newMessage = {
            ...response.message,
            timestamp: new Date(response.message.timestamp),
          }

          // Optimistically update UI (check for duplicates)
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev
            return [...prev, newMessage]
          })

          // Don't emit to socket - the API already saves it and Socket.IO will notify receiver automatically
          // The backend Socket.IO handler will notify the receiver

          // Update user's last message in sidebar
          setUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === selectedUserId
                ? {
                    ...user,
                    lastMessage: content.trim(),
                    lastMessageTime: newMessage.timestamp,
                  }
                : user
            )
          )
        }
      } catch (error) {
        console.error('Error sending message:', error)
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        })
      }
    },
    [selectedUserId, socket, currentUserId, toast]
  )

  // Handle user selection
  const handleSelectUser = React.useCallback((user) => {
    setSelectedUserId(user.id)
    setIsTyping(false)
  }, [])

  // Handle community name update
  const handleUpdateCommunityName = React.useCallback((chatId, newName) => {
    setUsers(prev => prev.map(u => 
      u.id === chatId ? { ...u, name: newName } : u
    ))
  }, [])

  // Get selected user object from current list
  const selectedUser = selectedUserId
    ? users.find(u => u.id === selectedUserId) || null
    : null

  return (
    <div className={cn("flex h-full w-full overflow-hidden min-h-0", className)}>
      <div className="hidden md:flex md:w-80 lg:w-96 flex-shrink-0">
        <ChatSidebar
          users={users}
          selectedUserId={selectedUserId}
          onSelectUser={handleSelectUser}
          isLoading={isLoading}
        />
      </div>

      {/* Mobile: Show sidebar or chat window */}
      <div className="flex-1 flex min-h-0">
        {selectedUserId ? (
          <div className="flex-1 flex flex-col">
            <ChatWindow
              user={selectedUser}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedUserId(null)}
              isTyping={isTyping}
              connectionStatus={connectionStatus}
              onUpdateCommunityName={handleUpdateCommunityName}
            />
          </div>
        ) : (
          <div className="flex-1 md:hidden">
            <ChatSidebar
              users={users}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <Toaster />
    </div>
  )
}

