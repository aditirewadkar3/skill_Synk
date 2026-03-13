import React from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

export default function PostForm({ onSuccess, onClose }) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [mediaType, setMediaType] = React.useState("none")
  const [imageFile, setImageFile] = React.useState(null)
  const [imagePreview, setImagePreview] = React.useState(null)
  const [youtubeUrl, setYoutubeUrl] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const authorId = currentUser?.uid || localStorage.getItem('uid') || "anon"
  const authorName = currentUser?.name || currentUser?.email?.split('@')[0] || "User"
  const role = currentUser?.role || localStorage.getItem('role') || "entrepreneur"

  const handleImageChange = (e) => {
    const file = e.target.files?.[0] || null
    setImageFile(file)
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setImagePreview(ev.target.result)
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError("")
    if (!title.trim() || !description.trim()) {
      setError("Title and description are required.")
      return
    }
    if (mediaType === 'image' && !imageFile) {
      setError("Please select an image file, or choose 'No attachment' below.")
      return
    }
    if (mediaType === 'youtube' && !youtubeUrl.trim()) {
      setError("Please enter a YouTube URL.")
      return
    }

    setIsSubmitting(true)
    try {
      let res
      if (mediaType === 'image') {
        const fd = new FormData()
        fd.append('authorId', authorId)
        fd.append('authorName', authorName)
        fd.append('role', role)
        fd.append('title', title.trim())
        fd.append('description', description.trim())
        fd.append('mediaType', 'image')
        fd.append('image', imageFile)
        res = await fetch('http://localhost:3001/api/posts', { method: 'POST', body: fd })
      } else {
        const body = {
          authorId, authorName, role,
          title: title.trim(),
          description: description.trim(),
          ...(mediaType === 'youtube' ? { mediaType: 'youtube', youtubeUrl: youtubeUrl.trim() } : {}),
        }
        res = await fetch('http://localhost:3001/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
      }
      const data = await res.json()
      if (!res.ok || !data?.success) throw new Error(data?.error || data?.message || 'Failed to create post')
      onSuccess && onSuccess(data.post)
      onClose && onClose()
      setTitle(""); setDescription(""); setImageFile(null); setImagePreview(null); setYoutubeUrl(""); setMediaType("none")
    } catch (err) {
      console.error('Post submit error:', err)
      setError(err.message || 'Failed to create post. Check that the backend is running.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What's new?" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="desc">Description *</Label>
        <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Share more details..." rows={5} required />
      </div>

      <div className="space-y-2">
        <Label>Attachment</Label>
        <div className="flex flex-wrap items-center gap-4">
          {[
            { value: 'none', label: '📝 No attachment' },
            { value: 'image', label: '🖼️ Image' },
            { value: 'youtube', label: '▶️ YouTube link' },
          ].map(opt => (
            <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="radio" name="mediaType" value={opt.value} checked={mediaType === opt.value} onChange={() => { setMediaType(opt.value); setImageFile(null); setImagePreview(null); setYoutubeUrl(""); setError("") }} />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {mediaType === 'image' && (
        <div className="space-y-2">
          <Label htmlFor="image">Image file</Label>
          <Input id="image" type="file" accept="image/png,image/jpeg,image/gif,image/webp" onChange={handleImageChange} />
          <p className="text-xs text-muted-foreground">PNG, JPG, GIF, WebP — up to 10 MB.</p>
          {imagePreview && (
            <div className="mt-2 overflow-hidden rounded-lg border">
              <img src={imagePreview} alt="preview" className="max-h-48 w-full object-cover" />
            </div>
          )}
        </div>
      )}

      {mediaType === 'youtube' && (
        <div className="space-y-2">
          <Label htmlFor="yt">YouTube URL</Label>
          <Input id="yt" type="url" placeholder="https://youtu.be/VIDEO_ID or https://youtube.com/watch?v=..." value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
          <p className="text-xs text-muted-foreground">Paste a public YouTube link for your pitch deck or demo.</p>
        </div>
      )}

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Posting…
            </span>
          ) : 'Post'}
        </Button>
      </div>
    </form>
  )
}
