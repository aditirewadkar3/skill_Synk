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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { 
  ArrowLeft, 
  Send, 
  Briefcase, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  AlertCircle
} from "lucide-react"

export default function ProposalPage() {
  const [targetUser, setTargetUser] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    budget: "",
    deadline: "",
  })

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const uid = params.get("uid")
    
    if (!uid) {
      window.history.back()
      return
    }

    ;(async () => {
      try {
        const res = await fetch("http://localhost:3001/api/auth/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid }),
        })
        if (res.ok) {
          const data = await res.json()
          setTargetUser(data.user)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setIsLoading(false)
      }
    })()
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    // For now, we simulate sending the proposal
    alert(`Proposal for "${formData.title}" sent to ${targetUser?.name}!`)
    window.history.back()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground animate-pulse">Loading requirement details...</p>
      </div>
    )
  }

  const role = (targetUser?.role || "").toLowerCase()
  const isFreelancer = role === "freelancer"
  const isEntrepreneur = role === "entrepreneur"

  const pageTitle = isFreelancer ? "Send Project Proposal" : (isEntrepreneur ? "Investment Interest" : "Partner Proposal")
  const buttonLabel = isFreelancer ? "Send Hire Request" : (isEntrepreneur ? "Submit Funding Interest" : "Send Proposal")

  return (
    <div className="h-full overflow-y-auto bg-background/50">
      <div className="container max-w-3xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          className="mb-6 hover:bg-transparent px-0" 
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>

        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center gap-6 premium-card p-8 border-none shadow-xl">
            <Avatar className="h-20 w-20 border-2 border-primary/20 shadow-lg">
              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${targetUser?.name}`} />
              <AvatarFallback>{targetUser?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <h1 className="text-3xl font-extrabold tracking-tight gradient-text leading-tight">{pageTitle}</h1>
              <p className="text-muted-foreground text-sm font-medium">
                Sending to: <span className="text-foreground font-bold">{targetUser?.name}</span> • {targetUser?.role}
              </p>
            </div>
          </div>

          {/* Form */}
          <Card className="premium-card border-none shadow-2xl overflow-hidden min-h-[500px]">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle className="text-lg">Requirement Details</CardTitle>
                <CardDescription>
                  Please provide enough detail to help {targetUser?.name} evaluate your request.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {isFreelancer ? "Project Title" : "Inquiry Pitch"}
                  </Label>
                  <Input 
                    id="title"
                    placeholder={isFreelancer ? "E.g. Mobile App Redesign" : "E.g. Series A Funding Inquiry"}
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Detailed Description</Label>
                  <Textarea 
                    id="description"
                    placeholder="Describe your goals, requirements, or vision..."
                    className="min-h-[150px] resize-none"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget" className="flex items-center gap-2">
                      <DollarSign className="h-3.5 w-3.5" />
                      Proposed Budget / Investment ($)
                    </Label>
                    <Input 
                      id="budget"
                      type="number"
                      placeholder="5000"
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5" />
                      Desired Timeline / Deadline
                    </Label>
                    <Input 
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                    />
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/10 p-5 rounded-2xl flex gap-4 backdrop-blur-sm">
                  <AlertCircle className="h-6 w-6 text-primary shrink-0 transition-transform hover:rotate-12" />
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    By submitting this request, you are initiating a professional negotiation. {targetUser?.name} will receive a notification and can accept or decline your proposal via the Messages tab.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  type="button" 
                  className="flex-1 rounded-xl"
                  onClick={() => window.history.back()}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 rounded-xl shadow-md shadow-primary/20"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {buttonLabel}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}
