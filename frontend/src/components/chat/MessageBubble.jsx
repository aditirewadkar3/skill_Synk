import * as React from "react"
import { cn } from "@/lib/utils"
import { formatMessageTime } from "@/services/chatService"
import { getCurrentUser } from "@/services/api"

export function MessageBubble({ message, isOwn = false }) {
  const time = formatMessageTime(message.timestamp)

  if (message.senderId === 'system') {
    return (
      <div className="flex justify-center w-full mb-4 px-4">
        <div className="bg-muted/50 rounded-full px-4 py-1 border border-border/50">
          <p className="text-[11px] font-medium text-muted-foreground italic">
            {message.content}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex w-full mb-4 px-4",
        isOwn ? "justify-end" : "justify-start"
      )}>
      <div
        className={cn(
          "flex flex-col max-w-[75%] md:max-w-[60%]",
          isOwn ? "items-end" : "items-start"
        )}>
        {!isOwn && (message.isCommunity || !message.receiverId) && message.senderName && (
          <span className="text-[10px] font-bold text-primary mb-1 ml-1 uppercase tracking-wider">
            {message.senderName}
          </span>
        )}
        <div
          className={cn(
            "rounded-2xl px-4 py-2 shadow-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content.split(/(https?:\/\/[^\s]+)/g).map((part, i) =>
              part.match(/^https?:\/\//) ? (
                <a
                  key={i}
                  href={part}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "underline transition-colors break-all",
                    isOwn
                      ? "text-white hover:text-white/80"
                      : "text-primary hover:text-primary/80"
                  )}
                >
                  {part}
                </a>
              ) : part
            )}
          </p>
        </div>
        <span className="text-xs text-muted-foreground mt-1 px-1">
          {time}
        </span>
      </div>
    </div>
  )
}
















