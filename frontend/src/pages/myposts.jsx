import React, { useState } from "react"
import Feed from "@/components/feed/Feed"
import PostForm from "@/components/posts/PostForm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Rocket, FileText, TrendingUp, PenLine } from "lucide-react"

export default function MyPostsPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isPostSheetOpen, setIsPostSheetOpen] = useState(false)

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem("currentUser")) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem("uid") || null

  React.useEffect(() => {
    const handleRefresh = () => setRefreshKey((prev) => prev + 1)
    window.addEventListener("app:post-created", handleRefresh)
    return () => window.removeEventListener("app:post-created", handleRefresh)
  }, [])

  return (
    <div className="h-full overflow-y-auto bg-background">
      {/* Page Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">My Posts</h1>
              <p className="text-xs text-muted-foreground">Manage and track your published content</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats badge */}
            <Badge variant="secondary" className="gap-1.5 px-3 py-1.5 text-xs hidden sm:flex">
              <TrendingUp className="h-3 w-3" />
              Your Content
            </Badge>

            {/* New Post Sheet */}
            <Sheet open={isPostSheetOpen} onOpenChange={setIsPostSheetOpen}>
              <SheetTrigger asChild>
                <Button
                  className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md"
                >
                  <Rocket className="h-4 w-4" />
                  New Post
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-lg p-0 bg-background">
                <SheetHeader className="p-6 border-b border-border">
                  <SheetTitle className="flex items-center gap-2">
                    <PenLine className="h-5 w-5 text-primary" />
                    Create a New Post
                  </SheetTitle>
                </SheetHeader>
                <div className="p-6">
                  <PostForm
                    onSuccess={() => {
                      setIsPostSheetOpen(false)
                      setRefreshKey((prev) => prev + 1)
                      window.dispatchEvent(new CustomEvent("app:post-created"))
                    }}
                    onClose={() => setIsPostSheetOpen(false)}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Empty state hint */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
          <span>Showing posts authored by you</span>
          <Separator orientation="vertical" className="h-4" />
          <span className="text-primary cursor-pointer hover:underline" onClick={() => setIsPostSheetOpen(true)}>
            + Write something new
          </span>
        </div>

        <Feed
          key={refreshKey}
          filterAuthorId={uid}
          filterMode="only"
        />
      </div>
    </div>
  )
}
