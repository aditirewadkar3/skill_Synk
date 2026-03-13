import * as React from "react"
import { getCurrentUser } from "@/services/api"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
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
  MapPin,
  Edit2,
  CheckCircle2,
  Upload,
  Eye,
  Trash2,
  Plus,
  Link2,
  Linkedin,
  Github,
  FileText,
  Download,
  ExternalLink,
  X,
} from "lucide-react"

export default function ProfilePage() {
  const role = localStorage.getItem("role")
  const [isEditingPersonal, setIsEditingPersonal] = React.useState(false)
  const [isEditingBusiness, setIsEditingBusiness] = React.useState(false)
  const [isEditingProfessional, setIsEditingProfessional] = React.useState(false)
  const [personalData, setPersonalData] = React.useState({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
  })

  const [businessData, setBusinessData] = React.useState({
    companyName: "Innovate Inc.",
    industry: "Technology, SaaS",
    registrationNo: "U12345ABC67890",
    businessAddress: "123 Innovation Drive, Silicon Valley, CA",
  })

  const [socialLinks, setSocialLinks] = React.useState({
    linkedin: "linkedin.com/in/alexdoe",
    github: "github.com/alexdoe",
    portfolio: "innovateinc.com/portfolio",
  })

  const [skills, setSkills] = React.useState([
    "Product Management",
    "SaaS",
    "React",
    "FinTech",
    "Venture Capital",
    "Agile Methodologies",
  ])

  const [uploadedFiles, setUploadedFiles] = React.useState([
    {
      id: 1,
      name: "Certificate_of_Incorporation.pdf",
      date: "12 Jan 2024",
    },
    {
      id: 2,
      name: "Aadhaar_Card_Alex_Doe.pdf",
      date: "10 Jan 2024",
    },
  ])

  const [newSkill, setNewSkill] = React.useState("")

  // Load user from local storage and Firestore
  React.useEffect(() => {
    // 1. Try to get user from local session
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

    // 2. Fetch latest data from backend
    const fetchUserData = async () => {
      try {
        const uid = localStorage.getItem('uid')
        if (!uid) return
        const res = await fetch('http://localhost:3001/api/auth/get-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid })
        })
        if (!res.ok) return
        const data = await res.json()
        const u = data?.user || {}
        setPersonalData((prev) => ({
          ...prev,
          fullName: u.name || prev.fullName || "",
          email: u.email || prev.email || "",
          phone: u.phone || prev.phone || "",
          location: u.location || prev.location || "",
          bio: u.bio || prev.bio || "",
        }))
        setSocialLinks({
          linkedin: u.linkedin || "",
          github: u.github || "",
          portfolio: u.portfolio || "",
        })
      } catch (err) {
        console.error("Error fetching user data:", err)
      }
    }
    fetchUserData()
  }, [])

  const handlePersonalChange = (e) => {
    const { name, value } = e.target
    setPersonalData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleBusinessChange = (e) => {
    const { name, value } = e.target
    setBusinessData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialLinkChange = (e) => {
    const { name, value } = e.target
    setSocialLinks((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const newFile = {
        id: Date.now(),
        name: file.name,
        date: new Date().toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }
      setUploadedFiles([...uploadedFiles, newFile])
    }
  }

  const handleDeleteFile = (fileId) => {
    setUploadedFiles(uploadedFiles.filter((file) => file.id !== fileId))
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Summary */}
          <div className="lg:col-span-1">
            <Card className="premium-card border-none sticky top-6 shadow-xl">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-6">
                  {/* Avatar with Edit Icon */}
                  <div className="relative">
                    <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(personalData.fullName || personalData.email || 'User')}`}
                        alt={personalData.fullName || 'User'}
                      />
                      <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                        {getInitials(personalData.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      size="icon"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Name and Title */}
                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold gradient-text">{personalData.fullName || 'User'}</h2>
                    {role !== 'freelancer' && (
                      <p className="text-sm text-muted-foreground">
                        Founder & CEO at {businessData.companyName}
                      </p>
                    )}
                    {personalData.bio && (
                      <p className="text-sm text-muted-foreground mt-2 px-4 italic">
                        "{personalData.bio}"
                      </p>
                    )}
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


                  {role !== 'freelancer' && (
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
                      {socialLinks.resume && (
                        <div className="flex items-center gap-3 text-sm">
                          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                          <a
                            href={socialLinks.resume.startsWith('http') ? socialLinks.resume : `https://${socialLinks.resume}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors break-all"
                          >
                            Resume Link
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area - Tabs */}
          <div className="lg:col-span-2">
            <Card className="premium-card border-none shadow-xl min-h-[600px]">
              <CardContent className="pt-6">
                <Tabs defaultValue="personal" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="personal">
                      {role === 'freelancer' ? 'Personal Information' : 'Personal & Business'}
                    </TabsTrigger>
                    <TabsTrigger value="professional">Professional Summary</TabsTrigger>
                    <TabsTrigger value="skills">Skills & Focus</TabsTrigger>
                  </TabsList>

                  {/* Personal & Business Tab */}
                  <TabsContent value="personal" className="space-y-6">
                    {/* Personal Information Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Personal Information</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (isEditingPersonal) {
                              fetch('http://localhost:3001/api/auth/update-profile', {
                                method: 'PUT',
                                headers: { 
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                                },
                                body: JSON.stringify({
                                  name: personalData.fullName,
                                  phone: personalData.phone,
                                  location: personalData.location,
                                })
                              }).then(res => res.json()).then(data => {
                                if (data.success) alert("Personal Information updated!");
                              });
                            }
                            setIsEditingPersonal(!isEditingPersonal)
                          }}
                        >
                          <Edit2 className="h-4 w-4 mr-2" />
                          {isEditingPersonal ? "Save" : "Edit"}
                        </Button>
                      </div>

                      {isEditingPersonal ? (
                        <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md">
                          <CardContent className="pt-6 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="fullName">Full Name</Label>
                              <Input
                                id="fullName"
                                name="fullName"
                                value={personalData.fullName}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address</Label>
                              <Input
                                id="email"
                                name="email"
                                type="email"
                                value={personalData.email}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="phone">Phone Number</Label>
                              <Input
                                id="phone"
                                name="phone"
                                value={personalData.phone}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="location">Location</Label>
                              <Input
                                id="location"
                                name="location"
                                value={personalData.location}
                                onChange={handlePersonalChange}
                              />
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={() => setIsEditingPersonal(false)}
                                className="flex-1"
                              >
                                Done
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md transition-all hover:shadow-lg">
                          <CardContent className="pt-6 space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Full Name
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.fullName}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Email Address
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.email}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Phone Number
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.phone}
                                </p>
                              </div>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">
                                  Location
                                </p>
                                <p className="text-sm font-medium">
                                  {personalData.location}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {/* Business Information Section - Hidden for Freelancers */}
                      {role !== 'freelancer' && (
                        <>
                          <div className="flex items-center justify-between mt-6">
                            <h3 className="text-lg font-semibold">Business Information</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setIsEditingBusiness(!isEditingBusiness)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              {isEditingBusiness ? "Save" : "Edit"}
                            </Button>
                          </div>

                          {isEditingBusiness ? (
                            <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md">
                              <CardContent className="pt-6 space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="companyName">Company Name</Label>
                                  <Input
                                    id="companyName"
                                    name="companyName"
                                    value={businessData.companyName}
                                    onChange={handleBusinessChange}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="industry">Industry</Label>
                                  <Input
                                    id="industry"
                                    name="industry"
                                    value={businessData.industry}
                                    onChange={handleBusinessChange}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="registrationNo">Registration No.</Label>
                                  <Input
                                    id="registrationNo"
                                    name="registrationNo"
                                    value={businessData.registrationNo}
                                    onChange={handleBusinessChange}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="businessAddress">Business Address</Label>
                                  <Textarea
                                    id="businessAddress"
                                    name="businessAddress"
                                    value={businessData.businessAddress}
                                    onChange={handleBusinessChange}
                                    rows={3}
                                  />
                                </div>
                                <div className="flex gap-3 pt-2">
                                  <Button
                                    onClick={() => setIsEditingBusiness(false)}
                                    className="flex-1"
                                  >
                                    Done
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ) : (
                            <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md transition-all hover:shadow-lg">
                              <CardContent className="pt-6 space-y-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Company Name
                                    </p>
                                    <p className="text-sm font-medium">
                                      {businessData.companyName}
                                    </p>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Industry
                                    </p>
                                    <p className="text-sm font-medium">
                                      {businessData.industry}
                                    </p>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Registration No.
                                    </p>
                                    <p className="text-sm font-medium">
                                      {businessData.registrationNo}
                                    </p>
                                  </div>
                                </div>
                                <Separator />
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm text-muted-foreground mb-1">
                                      Business Address
                                    </p>
                                    <p className="text-sm font-medium">
                                      {businessData.businessAddress}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )}
                        </>
                      )}
                    </div>
                  </TabsContent>

                  {/* Professional Summary Tab */}
                  <TabsContent value="professional" className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Professional Summary</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (isEditingProfessional) {
                            fetch('http://localhost:3001/api/auth/update-profile', {
                              method: 'PUT',
                              headers: { 
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                              },
                              body: JSON.stringify({
                                bio: personalData.bio,
                                linkedin: socialLinks.linkedin,
                                github: socialLinks.github,
                                portfolio: socialLinks.portfolio,
                              })
                            }).then(res => res.json()).then(data => {
                              if (data.success) alert("Professional Summary updated!");
                            });
                          }
                          setIsEditingProfessional(!isEditingProfessional);
                        }}
                      >
                        <Edit2 className="h-4 w-4 mr-2" />
                        {isEditingProfessional ? "Save" : "Edit"}
                      </Button>
                    </div>

                    <div className="max-w-2xl mx-auto space-y-6">
                      <div className="space-y-6">
                        {isEditingProfessional ? (
                          <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md">
                            <CardHeader>
                              <CardTitle className="text-sm font-medium">Bio & Socials</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="prof-bio">Bio</Label>
                                <Textarea
                                  id="prof-bio"
                                  name="bio"
                                  value={personalData.bio}
                                  onChange={handlePersonalChange}
                                  placeholder="E.g. Full-stack developer with 5 years experience..."
                                  rows={4}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="prof-linkedin">LinkedIn</Label>
                                  <Input
                                    id="prof-linkedin"
                                    name="linkedin"
                                    value={socialLinks.linkedin}
                                    onChange={handleSocialLinkChange}
                                    placeholder="linkedin.com/in/..."
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="prof-github">GitHub</Label>
                                  <Input
                                    id="prof-github"
                                    name="github"
                                    value={socialLinks.github}
                                    onChange={handleSocialLinkChange}
                                    placeholder="github.com/..."
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="prof-portfolio">Portfolio</Label>
                                <Input
                                  id="prof-portfolio"
                                  name="portfolio"
                                  value={socialLinks.portfolio}
                                  onChange={handleSocialLinkChange}
                                  placeholder="your-portfolio.com"
                                />
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card className="rounded-2xl border bg-background/50 backdrop-blur-sm shadow-md transition-all hover:shadow-lg h-full">
                            <CardContent className="pt-6 space-y-4">
                              <div>
                                <p className="text-sm text-muted-foreground mb-1">Professional Bio</p>
                                <p className="text-sm font-medium leading-relaxed">
                                  {personalData.bio || "No bio added yet."}
                                </p>
                              </div>
                              <Separator />
                              <div className="space-y-3">
                                <p className="text-sm text-muted-foreground">Professional Links</p>
                                <div className="grid grid-cols-1 gap-2">
                                  {socialLinks.linkedin && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Linkedin className="h-4 w-4 text-primary" />
                                      <a href={`https://${socialLinks.linkedin}`} target="_blank" rel="noopener" className="hover:underline">{socialLinks.linkedin}</a>
                                    </div>
                                  )}
                                  {socialLinks.github && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Github className="h-4 w-4 text-primary" />
                                      <a href={`https://${socialLinks.github}`} target="_blank" rel="noopener" className="hover:underline">{socialLinks.github}</a>
                                    </div>
                                  )}
                                  {socialLinks.portfolio && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Link2 className="h-4 w-4 text-primary" />
                                      <a href={socialLinks.portfolio.startsWith('http') ? socialLinks.portfolio : `https://${socialLinks.portfolio}`} target="_blank" rel="noopener" className="hover:underline">Portfolio</a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
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
                            <button
                              onClick={() => handleRemoveSkill(skill)}
                              className="ml-2 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>

                      {/* Add Skill Input */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter a skill"
                          value={newSkill}
                          onChange={(e) => setNewSkill(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddSkill()
                            }
                          }}
                          className="flex-1"
                        />
                        <Button onClick={handleAddSkill}>
                          <Plus className="h-4 w-4 mr-2" />
                          Add Skill
                        </Button>
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
