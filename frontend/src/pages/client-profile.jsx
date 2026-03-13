import * as React from "react"
<<<<<<< HEAD
import { authAPI, getCurrentUser } from "@/services/api"
import { Card, CardContent } from "@/components/ui/card"
=======
import { getCurrentUser, communityAPI } from "@/services/api"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
>>>>>>> 47e5b265ea47e8e332fc5dbfd67896045ce186b8
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  Link2,
  CheckCircle2,
  Eye,
  Briefcase,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
  ArrowLeft,
  Plus,
  X,
  Pencil,
  Check,
  Loader2,
} from "lucide-react"
import Feed from "@/components/feed/Feed"

export default function ClientProfilePage() {
  const [profile, setProfile] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    role: "",
    bio: "",
    rate: "",
    skills: [],
    linkedin: "",
    github: "",
    portfolio: "",
  })
  const [requestLoading, setRequestLoading] = React.useState(false)

  const [targetUid, setTargetUid] = React.useState(null)
  const [isOwnProfile, setIsOwnProfile] = React.useState(false)
  const [loading, setLoading] = React.useState(true)

  // Skills editing state
  const [editingSkills, setEditingSkills] = React.useState(false)
  const [newSkill, setNewSkill] = React.useState("")
  const [localSkills, setLocalSkills] = React.useState([])
  const [savingSkills, setSavingSkills] = React.useState(false)
  const [skillSaveMsg, setSkillSaveMsg] = React.useState("")

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const uid = params.get("uid")
    const currentUser = getCurrentUser()
    const currentUid = currentUser?.uid || localStorage.getItem("uid")

    setTargetUid(uid || currentUid)
    setIsOwnProfile(!uid || uid === currentUid)

    const loadProfile = async (id) => {
      try {
        setLoading(true)
        const res = await fetch("http://localhost:3001/api/auth/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: id }),
        })
        if (!res.ok) return
        const data = await res.json()
        const u = data?.user || {}
        const merged = {
          fullName: u.name || currentUser?.name || "",
          email: u.email || currentUser?.email || "",
          phone: u.phone || "",
          location: u.location || "",
          role: u.role || "",
          bio: u.bio || "",
          rate: u.rate || "",
          skills: Array.isArray(u.skills) ? u.skills : [],
          linkedin: u.linkedin || "",
          github: u.github || "",
          portfolio: u.portfolio || "",
        }
        setProfile(merged)
        setLocalSkills(Array.isArray(u.skills) ? u.skills : [])
      } catch {
        // Fallback to currentUser data
        if (currentUser) {
          setProfile((p) => ({ ...p, fullName: currentUser.name || "", email: currentUser.email || "", role: currentUser.role || "" }))
        }
      } finally {
        setLoading(false)
      }
    }

    loadProfile(uid || currentUid)
  }, [])

  // ── Skills handlers ───────────────────────────────────────────────────────
  const handleAddSkill = () => {
    const trimmed = newSkill.trim()
    if (!trimmed || localSkills.includes(trimmed)) return
    setLocalSkills((prev) => [...prev, trimmed])
    setNewSkill("")
  }

  const handleRemoveSkill = (skill) => {
    setLocalSkills((prev) => prev.filter((s) => s !== skill))
  }

  const handleSaveSkills = async () => {
    try {
      setSavingSkills(true)
      setSkillSaveMsg("")
      await authAPI.updateProfile({ skills: localSkills })
      setProfile((p) => ({ ...p, skills: localSkills }))
      setEditingSkills(false)
      setSkillSaveMsg("Skills saved!")
      setTimeout(() => setSkillSaveMsg(""), 3000)
    } catch (err) {
      setSkillSaveMsg("Failed to save. Try again.")
    } finally {
      setSavingSkills(false)
    }
  }

  const handleCancelSkillEdit = () => {
    setLocalSkills(profile.skills)
    setNewSkill("")
    setEditingSkills(false)
  }

  // ── Navigation helpers ────────────────────────────────────────────────────
  const handleStartChat = () => {
    if (!targetUid) return
<<<<<<< HEAD
    window.history.pushState({}, "", `/chat?with=${targetUid}`)
    window.dispatchEvent(new Event("app:navigate"))
=======
    try { localStorage.setItem('chatTargetUid', targetUid) } catch {}
    window.dispatchEvent(new Event('app:navigate'))
>>>>>>> 47e5b265ea47e8e332fc5dbfd67896045ce186b8
  }

  const handleJoinCommunity = async () => {
    if (!targetUid) return
    try {
      setRequestLoading(true)
      const res = await communityAPI.request(targetUid)
      if (res.success) {
        alert("Community request sent successfully!")
      }
    } catch (error) {
      alert(error.message || "Failed to send community request")
    } finally {
      setRequestLoading(false)
    }
  }

  const handleHireOrFund = () => {
    if (!targetUid) return
<<<<<<< HEAD
    window.history.pushState({}, "", `/proposal?uid=${targetUid}`)
    window.dispatchEvent(new Event("app:navigate"))
=======
    window.history.pushState({}, '', `/proposal?uid=${targetUid}`)
>>>>>>> 47e5b265ea47e8e332fc5dbfd67896045ce186b8
  }

  const getInitials = (name) =>
    (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)

  const getActionLabel = () => {
    const r = (profile.role || "").toLowerCase()
    if (r === "freelancer") return "Hire Me"
    if (r === "entrepreneur") return "Fund This Project"
    if (r === "investor") return "Request Funding"
    return "Partner With Me"
  }

  const getActionIcon = () => {
    const r = (profile.role || "").toLowerCase()
    if (r === "freelancer") return <Briefcase className="h-4 w-4 mr-2" />
    if (r === "entrepreneur") return <TrendingUp className="h-4 w-4 mr-2" />
    return <MessageSquare className="h-4 w-4 mr-2" />
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="container max-w-6xl mx-auto px-4 py-6">

        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          className="mb-5 gap-2 -ml-2 hover:bg-muted"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* ── Profile Header ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-6 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-5">
            <div className="relative shrink-0">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.fullName || profile.email || "User")}`}
                  alt={profile.fullName || "User"}
                />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                  {getInitials(profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 h-5 w-5 rounded-full border-4 border-card" title="Online" />
            </div>

            <div className="text-center md:text-left space-y-1.5">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{profile.fullName || "User"}</h1>
                <ShieldCheck className="h-5 w-5 text-blue-500" title="Verified" />
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                {profile.role && (
                  <Badge variant="outline" className="text-xs px-2.5 py-0.5 font-semibold bg-primary/5">
                    {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                  </Badge>
                )}
                {profile.rate && (
                  <span className="text-xs text-muted-foreground font-medium">{profile.rate}</span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{profile.bio}</p>
              )}
            </div>
          </div>

<<<<<<< HEAD
          {!isOwnProfile && (
            <div className="flex items-center gap-3 shrink-0">
              <Button variant="outline" size="sm" className="gap-2" onClick={handleStartChat}>
                <MessageSquare className="h-4 w-4" />
                Message
              </Button>
              <Button size="sm" className="gap-2 font-semibold shadow-sm" onClick={handleHireOrFund}>
                {getActionIcon()}
                {getActionLabel()}
              </Button>
            </div>
          )}
=======
          <div className="flex items-center gap-3">
            {getCurrentUser()?.role === 'freelancer' && personalData.role === 'freelancer' && (
              <Button 
                variant="outline" 
                size="lg"
                className="rounded-xl px-6"
                onClick={handleJoinCommunity}
                disabled={requestLoading}
              >
                {requestLoading ? "Sending..." : "Join Community"}
              </Button>
            )}
            <Button variant="outline" size="lg" className="rounded-xl px-6" onClick={handleStartChat}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="lg" className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={handleHireOrFund}>
              {getActionIcon()}
              {getActionButtonLabel()}
            </Button>
          </div>
>>>>>>> 47e5b265ea47e8e332fc5dbfd67896045ce186b8
        </div>

        {/* ── Main Layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Sidebar ── */}
          <div className="lg:col-span-1 space-y-5">

            {/* Contact */}
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5 space-y-4">
                <h3 className="font-semibold">Contact Details</h3>
                <div className="space-y-3">
                  {profile.email && (
                    <div className="flex items-center gap-3 text-sm">
                      <div className="p-2 rounded-lg bg-muted">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Email</p>
                        <p className="text-sm font-medium truncate">{profile.email}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 rounded-lg bg-muted">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Phone</p>
                      <p className="text-sm font-medium">{profile.phone || "Not shared"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Social links */}
                <h3 className="font-semibold">Social Presence</h3>
                <div className="grid grid-cols-3 gap-2">
                  <a
                    href={profile.linkedin ? `https://${profile.linkedin}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors"
                  >
                    <Linkedin className="h-4 w-4 text-muted-foreground hover:text-blue-600" />
                  </a>
                  <a
                    href={profile.github ? `https://${profile.github}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors"
                  >
                    <Github className="h-4 w-4 text-muted-foreground" />
                  </a>
                  <a
                    href={profile.portfolio ? `https://${profile.portfolio}` : "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors"
                  >
                    <Link2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>

            {/* ── Skills & Focus ── */}
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Skills & Focus</h3>
                  {isOwnProfile && !editingSkills && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => { setEditingSkills(true); setLocalSkills(profile.skills); }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>

                {/* Display mode */}
                {!editingSkills && (
                  <>
                    {profile.skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {profile.skills.map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="rounded-full px-3 py-1 text-xs font-medium bg-primary/5 text-primary/80 border border-primary/10"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground/60 italic">
                        {isOwnProfile ? 'No skills added yet. Click ✏️ to add your skills.' : 'No skills listed.'}
                      </p>
                    )}
                    {skillSaveMsg && (
                      <p className="text-xs text-emerald-600 font-medium flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {skillSaveMsg}
                      </p>
                    )}
                  </>
                )}

                {/* Edit mode (own profile only) */}
                {editingSkills && isOwnProfile && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {localSkills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                        >
                          {skill}
                          <button
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-destructive transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>

                    {/* Add skill input */}
                    <div className="flex items-center gap-1.5">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAddSkill()}
                        placeholder="Add a skill…"
                        className="h-8 text-xs"
                      />
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 shrink-0"
                        onClick={handleAddSkill}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        className="h-8 gap-1.5 text-xs flex-1"
                        onClick={handleSaveSkills}
                        disabled={savingSkills}
                      >
                        {savingSkills ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Save Skills
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-xs"
                        onClick={handleCancelSkillEdit}
                        disabled={savingSkills}
                      >
                        Cancel
                      </Button>
                    </div>
                    {skillSaveMsg && (
                      <p className="text-xs text-destructive font-medium">{skillSaveMsg}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Main Content ── */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl border shadow-sm">
              <CardContent className="p-5">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="posts" className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Posts & Activity
                    </TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm">
                      Verification
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="focus-visible:outline-none">
                    <h3 className="text-base font-semibold mb-4">Recent Updates</h3>
                    {targetUid ? (
                      <Feed filterAuthorId={targetUid} filterMode="only" />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground text-sm">
                        No activity found.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="documents" className="focus-visible:outline-none">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-semibold">Verified Documents</h3>
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs">
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Verified
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {[
                        { id: 1, name: "Certificate_of_Incorporation.pdf", date: "12 Jan 2024" },
                        { id: 2, name: "Identity_Verification.pdf", date: "10 Jan 2024" },
                      ].map((file) => (
                        <div
                          key={file.id}
                          className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <ShieldCheck className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                              <p className="text-xs text-muted-foreground">Verified on {file.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
