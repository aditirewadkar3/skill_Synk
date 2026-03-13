import * as React from "react"
import { io } from "socket.io-client"
import { ChatWindow } from "./ChatWindow"
import { chatAPI } from "@/services/api"
import { getAuthToken } from "@/services/api"

const SOCKET_URL = "http://localhost:3001"

export function ProjectChat({ projectId, communityChatId, projectName }) {
  const [messages, setMessages] = React.useState([])
  const [isTyping, setIsTyping] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState("disconnected")
  const [socket, setSocket] = React.useState(null)
  const currentUserId = React.useMemo(() => localStorage.getItem('uid'), [])

  const chatUser = React.useMemo(() => ({
    id: communityChatId,
    name: projectName + " Community",
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(communityChatId)}`,
    isCommunity: true,
    status: 'online'
  }), [communityChatId, projectName])

  // Load messages
  React.useEffect(() => {
    const loadMessages = async () => {
      if (!communityChatId) return
      try {
        const messagesData = await chatAPI.getMessages(communityChatId)
        setMessages(messagesData.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })))
      } catch (error) {
        console.error('Error loading messages:', error)
      }
    }
    loadMessages()
  }, [communityChatId])

  // Initialize Socket
  React.useEffect(() => {
    if (!currentUserId || !communityChatId) return

    const token = getAuthToken()
    if (!token) return

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => setConnectionStatus("connected"))
    newSocket.on('disconnect', () => setConnectionStatus("disconnected"))
    
    newSocket.on('message', (message) => {
      if (message.chatId === communityChatId) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, { ...message, timestamp: new Date(message.timestamp) }]
            .sort((a, b) => a.timestamp - b.timestamp)
        })
      }
    })

    newSocket.on('message-sent', (message) => {
      if (message.chatId === communityChatId) {
        setMessages(prev => {
          if (prev.find(m => m.id === message.id)) return prev
          return [...prev, { ...message, timestamp: new Date(message.timestamp) }]
            .sort((a, b) => a.timestamp - b.timestamp)
        })
      }
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [currentUserId, communityChatId])

  const handleSendMessage = async (content) => {
    if (!communityChatId || !content.trim()) return
    try {
      const response = await chatAPI.sendMessage(communityChatId, content.trim())
      if (response.success && response.message) {
        // Optimistic update is handled by 'message-sent' event usually, 
        // but we can add it here if needed if socket is slow
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  return (
    <div className="h-full border-l bg-background flex flex-col">
      <ChatWindow
        user={chatUser}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBack={() => {}} // No back button needed here as it's side-by-side
        isTyping={isTyping}
        connectionStatus={connectionStatus}
      />
    </div>
  )
}
