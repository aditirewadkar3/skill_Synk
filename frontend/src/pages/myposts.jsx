import React from "react"
import Feed from "@/components/feed/Feed"

export default function MyPostsPage() {
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem('uid') || null

  return (
    <div className="h-full overflow-y-auto p-8 bg-background/50">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">My Posts</h1>
        <Feed filterAuthorId={uid} filterMode="only" />
      </div>
    </div>
  )
}


