import * as React from "react"
import { getCurrentUser, communityAPI } from "@/services/api"
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
} from "lucide-react"

export default function ClientProfilePage() {
  const [personalData, setPersonalData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    role: "",
  })
  const [requestLoading, setRequestLoading] = React.useState(false)

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

  React.useEffect(() => {
    // Read other user's uid from query string
    const params = new URLSearchParams(window.location.search)
    const targetUid = params.get("uid")

    // Fallback: if no uid provided, do nothing
    if (!targetUid) {
      try {
        const cu = getCurrentUser()
        if (cu) {
          setPersonalData((prev) => ({
            ...prev,
            fullName: cu.name || prev.fullName || "",
            email: cu.email || prev.email || "",
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
          body: JSON.stringify({ uid: targetUid }),
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
    const params = new URLSearchParams(window.location.search)
    const targetUid = params.get("uid")
    if (!targetUid) return
    try { localStorage.setItem('chatTargetUid', targetUid) } catch {}
    window.dispatchEvent(new Event('app:navigate'))
  }

  const handleJoinCommunity = async () => {
    const params = new URLSearchParams(window.location.search)
    const targetUid = params.get("uid")
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

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold">Profile</h1>
          <div className="flex gap-2">
            {getCurrentUser()?.role === 'freelancer' && personalData.role === 'freelancer' && (
              <Button 
                variant="outline" 
                onClick={handleJoinCommunity}
                disabled={requestLoading}
              >
                {requestLoading ? "Sending..." : "Join Community"}
              </Button>
            )}
            <Button onClick={handleStartChat}>Message</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="rounded-2xl shadow-sm border sticky top-6">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar */}
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(personalData.fullName || personalData.email || 'User')}`}
                        alt={personalData.fullName || 'User'}
                      />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(personalData.fullName || 'U')}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  {/* Name and Title */}
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold">{personalData.fullName || 'User'}</h2>
                    <p className="text-sm text-muted-foreground">
                      Founder & CEO at {businessData.companyName}
                    </p>
                  </div>

                  <Separator />

                  {/* Contact Information */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground break-all">
                        {personalData.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-muted-foreground">
                        {personalData.phone}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Social & Portfolio Links */}
                  <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Linkedin className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.linkedin}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Github className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.github}
                      </a>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`https://${socialLinks.portfolio}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors break-all"
                      >
                        {socialLinks.portfolio}
                      </a>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Tabs */}
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-sm border">
              <CardContent className="pt-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="personal">Personal & Business</TabsTrigger>
                    <TabsTrigger value="verification">Verification & KYC</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Focus</TabsTrigger>
                  </TabsList>

                  {/* Personal & Business Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                      </div>

                      <Card className="rounded-xl border">
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Full Name</p>
                              <p className="text-sm font-medium">{personalData.fullName}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                              <p className="text-sm font-medium">{personalData.email}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
                              <p className="text-sm font-medium">{personalData.phone}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Location</p>
                              <p className="text-sm font-medium">{personalData.location}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Business Information Section */}
                      <div className="flex items-center justify-between mt-6">
                        <h3 className="text-lg font-semibold">Business Information</h3>
                      </div>

                      <Card className="rounded-xl border">
                        <CardContent className="pt-6 space-y-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Company Name</p>
                              <p className="text-sm font-medium">{businessData.companyName}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Industry</p>
                              <p className="text-sm font-medium">{businessData.industry}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Registration No.</p>
                              <p className="text-sm font-medium">{businessData.registrationNo}</p>
                            </div>
                          </div>
                          <Separator />
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Business Address</p>
                              <p className="text-sm font-medium">{businessData.businessAddress}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  {/* Verification & KYC Tab */}
                  <TabsContent value="verification" className="space-y-6">
                    {/* PAN Verification Status */}
                    <Card className="rounded-xl border">
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">PAN Verification Status: Verified</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Uploaded Files List */}
                    <div className="space-y-3">
                      {uploadedFiles.map((file) => (
                        <Card key={file.id} className="rounded-xl border">
                          <CardContent className="pt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="rounded-full bg-muted p-2 shrink-0">
                                  <Upload className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{file.name}</p>
                                  <p className="text-xs text-muted-foreground">Uploaded on {file.date}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>

                  {/* Skills & Focus Tab */}
                  <TabsContent value="skills" className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Skills & Focus</h3>

                      {/* Skills Tags */}
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="px-3 py-1.5 text-sm rounded-full"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
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
