import * as React from "react"
import { getCurrentUser } from "@/services/api"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  Link2,
  CheckCircle2,
  Upload,
  Eye,
  Briefcase,
  TrendingUp,
  MessageSquare,
  ShieldCheck,
} from "lucide-react"
import Feed from "@/components/feed/Feed"

export default function ClientProfilePage() {
  const [personalData, setPersonalData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    role: "",
  })

  const [businessData] = React.useState({
    companyName: "Innovate Inc.",
    industry: "Technology, SaaS",
    registrationNo: "U12345ABC67890",
    businessAddress: "123 Innovation Drive, Silicon Valley, CA",
  })

  const [socialLinks] = React.useState({
    linkedin: "linkedin.com/in/alexdoe",
    github: "github.com/alexdoe",
    portfolio: "innovateinc.com/portfolio",
  })

  const [skills] = React.useState([
    "Product Management",
    "SaaS",
    "React",
    "FinTech",
    "Venture Capital",
    "Agile Methodologies",
  ])

  const [uploadedFiles] = React.useState([
    { id: 1, name: "Certificate_of_Incorporation.pdf", date: "12 Jan 2024" },
    { id: 2, name: "Aadhaar_Card_Alex_Doe.pdf", date: "10 Jan 2024" },
  ])

  const [targetUid, setTargetUid] = React.useState(null)

  React.useEffect(() => {
    // Read other user's uid from query string
    const params = new URLSearchParams(window.location.search)
    const uid = params.get("uid")
    setTargetUid(uid)

    // Fallback: if no uid provided, do nothing
    if (!uid) {
      try {
        const cu = getCurrentUser()
        if (cu) {
          setPersonalData((prev) => ({
            ...prev,
            fullName: cu.name || prev.fullName || "",
            email: cu.email || prev.email || "",
            role: cu.role || "",
          }))
        }
      } catch {}
      return
    }

    ;(async () => {
      try {
        const res = await fetch("http://localhost:3001/api/auth/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: uid }),
        })
        if (!res.ok) return
        const data = await res.json()
        const u = data?.user || {}
        setPersonalData((prev) => ({
          ...prev,
          fullName: u.name || prev.fullName || "",
          email: u.email || prev.email || "",
          role: u.role || "",
        }))
      } catch {}
    })()
  }, [])

  const handleStartChat = () => {
    if (!targetUid) return
    try { localStorage.setItem('chatTargetUid', targetUid) } catch {}
    window.history.pushState({}, '', `/chat?with=${targetUid}`)
    window.dispatchEvent(new Event('app:navigate'))
  }

  const handleHireOrFund = () => {
    if (!targetUid) return
    window.history.pushState({}, '', `/proposal?uid=${targetUid}`)
    window.dispatchEvent(new Event('app:navigate'))
  }

  const getInitials = (name) => {
    return (name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getActionButtonLabel = () => {
    const r = (personalData.role || "").toLowerCase()
    if (r === "freelancer") return "Hire Me"
    if (r === "entrepreneur") return "Fund This Project"
    if (r === "investor") return "Request Funding"
    return "Partner With Me"
  }

  const getActionIcon = () => {
    const r = (personalData.role || "").toLowerCase()
    if (r === "freelancer") return <Briefcase className="h-4 w-4 mr-2" />
    if (r === "entrepreneur") return <TrendingUp className="h-4 w-4 mr-2" />
    return <MessageSquare className="h-4 w-4 mr-2" />
  }

  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 bg-card p-6 rounded-2xl border shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div className="relative">
              <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(personalData.fullName || personalData.email || 'User')}`}
                  alt={personalData.fullName || 'User'}
                />
                <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                  {getInitials(personalData.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute -bottom-2 -right-2 bg-green-500 h-6 w-6 rounded-full border-4 border-card" title="Online" />
            </div>

            <div className="text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{personalData.fullName || 'User'}</h1>
                <ShieldCheck className="h-6 w-6 text-blue-500" title="Verified Professional" />
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <Badge variant="outline" className="text-sm px-3 py-1 font-medium bg-primary/5">
                  {personalData.role ? personalData.role.charAt(0).toUpperCase() + personalData.role.slice(1) : "Professional"}
                </Badge>
                <span className="text-muted-foreground text-sm">•</span>
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  12 Connected Project
                </span>
              </div>
              <p className="text-muted-foreground text-sm max-w-md">
                Building the future of {businessData.industry} with scalable solutions and innovative design.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" size="lg" className="rounded-xl px-6" onClick={handleStartChat}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Message
            </Button>
            <Button size="lg" className="rounded-xl px-8 font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-105" onClick={handleHireOrFund}>
              {getActionIcon()}
              {getActionButtonLabel()}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-2xl shadow-sm border overflow-hidden">
              <CardContent className="p-6 space-y-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Contact Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm group">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Email</p>
                      <p className="text-sm font-medium truncate">{personalData.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm group">
                    <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
                      <Phone className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Phone</p>
                      <p className="text-sm font-medium">{personalData.phone || "Not shared"}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <h3 className="font-semibold text-lg flex items-center gap-2">
                  Social Presence
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <a href={`https://${socialLinks.linkedin}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors gap-2 group">
                    <Linkedin className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
                  </a>
                  <a href={`https://${socialLinks.github}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors gap-2 group">
                    <Github className="h-5 w-5 text-muted-foreground group-hover:text-foreground" />
                  </a>
                  <a href={`https://${socialLinks.portfolio}`} target="_blank" className="flex flex-col items-center justify-center p-3 rounded-xl border bg-card hover:bg-muted transition-colors gap-2 group">
                    <Link2 className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-sm border p-6">
              <h3 className="font-semibold text-lg mb-4">Skills & Focus</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-3 py-1 text-xs rounded-full hover:bg-primary hover:text-primary-foreground transition-colors cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          {/* Main Content Area - Tabs */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border bg-card/100">
              <CardContent className="p-6">
                <Tabs defaultValue="posts" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-8 bg-muted/50 p-1 rounded-xl">
                    <TabsTrigger value="posts" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Posts</TabsTrigger>
                    <TabsTrigger value="experience" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Business</TabsTrigger>
                    <TabsTrigger value="documents" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Verification</TabsTrigger>
                  </TabsList>

                  <TabsContent value="posts" className="space-y-6 focus-visible:outline-none">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">Recent Updates</h3>
                    </div>
                    {targetUid ? (
                      <Feed filterAuthorId={targetUid} filterMode="only" />
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No activity found.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="experience" className="space-y-6 focus-visible:outline-none">
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold">Business Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl border bg-muted/30">
                          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Company</p>
                          <p className="font-semibold text-lg">{businessData.companyName}</p>
                        </div>
                        <div className="p-4 rounded-xl border bg-muted/30">
                          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Industry</p>
                          <p className="font-semibold text-lg">{businessData.industry}</p>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl border bg-muted/30">
                          <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Business Address</p>
                          <p className="font-medium">{businessData.businessAddress}</p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="documents" className="space-y-6 focus-visible:outline-none">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Verified Documents</h3>
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Verified
                      </Badge>
                    </div>
                    <div className="space-y-3">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-4 rounded-xl border hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                              <p className="text-xs text-muted-foreground">Verified on {file.date}</p>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full">
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
