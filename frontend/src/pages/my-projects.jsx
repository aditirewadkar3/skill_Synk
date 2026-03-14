import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Briefcase,
  Plus,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  Wifi,
  WifiOff,
  MessageSquare,
} from "lucide-react";
import { getAuthToken } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { ProjectChat } from "@/components/chat/ProjectChat";
import { Badge } from "@/components/ui/badge";

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT INNER PAGE  (full-screen chat + Sheet for details)
// ─────────────────────────────────────────────────────────────────────────────

function ProjectInnerPage({ project, onBack, isApplicant, isInvestor, userProfile }) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [investmentData, setInvestmentData] = useState({ amount: "", equity: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const userUid = localStorage.getItem("uid");
  const role = localStorage.getItem("role") || "entrepreneur";
  const myApplication = project.applicants?.find((a) => a.applicantId === userUid);
  const isAcceptedApplicant = myApplication?.status === "accepted";
  const showChat = !isApplicant || isAcceptedApplicant;

  const handleApply = async (investorDetails = null) => {
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const payload = {
        applicantName: userProfile?.name,
        applicantEmail: userProfile?.email,
        type: role,
      };
      if (investorDetails) {
        payload.investmentAmount = investorDetails.amount;
        payload.equityWanted = investorDetails.equity;
      }
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        alert(isInvestor ? "Investment request sent successfully!" : "Application sent successfully!");
        if (isInvestor) setIsInvestmentModalOpen(false);
        setIsDetailsOpen(false);
        onBack(); // refresh list
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (err) {
      alert("An error occurred while applying");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden">
      {/* ── Top Bar ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-xl hover:bg-primary/10 h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        {/* Project identity */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm leading-tight truncate">{project.name}</p>
            <p className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Active Project
            </p>
          </div>
        </div>

        {/* Application status badge (inline, compact) */}
        {isApplicant && myApplication && (
          <Badge
            variant="secondary"
            className={`text-[10px] uppercase tracking-wider font-bold shrink-0 ${
              myApplication.status === "accepted"
                ? "bg-emerald-500/10 text-emerald-500"
                : myApplication.status === "rejected"
                ? "bg-destructive/10 text-destructive"
                : "bg-amber-500/10 text-amber-500"
            }`}
          >
            {myApplication.status}
          </Badge>
        )}

        {/* Info / Details Sheet trigger */}
        <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-primary/10 h-9 w-9 shrink-0"
              title="Project Details"
            >
              <Info className="h-4 w-4 text-muted-foreground" />
            </Button>
          </SheetTrigger>

          {/* ── Details Sheet ── */}
          <SheetContent side="right" className="sm:max-w-[460px] premium-card border-l flex flex-col gap-0 p-0 overflow-hidden">
            {/* Sheet header */}
            <div className="p-6 pb-4 border-b bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <SheetHeader>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-primary/15">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase font-bold tracking-widest">
                    Active
                  </Badge>
                </div>
                <SheetTitle className="text-2xl font-bold leading-tight gradient-text">
                  {project.name}
                </SheetTitle>
                <SheetDescription className="flex items-center gap-4 text-xs mt-1">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {new Date(project.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="h-3 w-3" />
                    Entrepreneur
                  </span>
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Overview */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" /> Overview
                </h3>
                <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap bg-muted/30 rounded-2xl p-4 border border-primary/5">
                  {project.details}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Members</p>
                  <p className="text-2xl font-extrabold text-primary">
                    {project.applicants?.filter((a) => a.status === "accepted").length ?? 0}
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-muted/30 border border-primary/5 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-lg font-extrabold">Flexible</p>
                </div>
              </div>

              {/* ── Application section (inside sheet) ── */}
              {isApplicant && (
                <>
                  <Separator className="bg-primary/10" />
                  {myApplication ? (
                    <div className="flex flex-col items-center text-center gap-3 py-4 px-6 rounded-2xl bg-muted/20 border border-primary/5">
                      {myApplication.status === "pending" && (
                        <>
                          <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                          <p className="font-bold text-amber-500">Request Pending</p>
                          <p className="text-xs text-muted-foreground">The entrepreneur is reviewing your request.</p>
                        </>
                      )}
                      {myApplication.status === "accepted" && (
                        <>
                          <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                          <p className="font-bold text-emerald-500">You're In!</p>
                          <p className="text-xs text-muted-foreground">You're a member of this project community. Use the chat!</p>
                        </>
                      )}
                      {myApplication.status === "rejected" && (
                        <>
                          <AlertCircle className="h-10 w-10 text-destructive" />
                          <p className="font-bold text-destructive">Request Rejected</p>
                          <p className="text-xs text-muted-foreground">Unfortunately your request was not accepted.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h3 className="text-sm font-bold">Interested in joining?</h3>
                      <p className="text-xs text-muted-foreground">
                        {isInvestor
                          ? "Propose an investment to join the project community."
                          : "Apply now and start collaborating with the creator."}
                      </p>

                      {isInvestor ? (
                        <Sheet open={isInvestmentModalOpen} onOpenChange={setIsInvestmentModalOpen}>
                          <SheetTrigger asChild>
                            <Button className="w-full h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                              <CheckCircle2 className="h-4 w-4" />
                              Propose Investment
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="bottom" className="rounded-t-3xl premium-card border-t sm:max-w-full">
                            <SheetHeader className="mb-6">
                              <SheetTitle className="gradient-text text-xl font-bold">Propose Investment</SheetTitle>
                              <SheetDescription>Offer funding in exchange for equity.</SheetDescription>
                            </SheetHeader>
                            <div className="space-y-4 max-w-md mx-auto pb-4">
                              <div className="space-y-2">
                                <Label htmlFor="amount" className="text-sm font-semibold">Investment Amount ($)</Label>
                                <Input
                                  id="amount"
                                  type="number"
                                  placeholder="e.g., 50000"
                                  value={investmentData.amount}
                                  onChange={(e) => setInvestmentData({ ...investmentData, amount: e.target.value })}
                                  className="h-12 rounded-xl"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="equity" className="text-sm font-semibold">Equity Wanted (%)</Label>
                                <Input
                                  id="equity"
                                  type="number"
                                  placeholder="e.g., 10"
                                  value={investmentData.equity}
                                  onChange={(e) => setInvestmentData({ ...investmentData, equity: e.target.value })}
                                  className="h-12 rounded-xl"
                                />
                              </div>
                              <Button
                                onClick={() => handleApply(investmentData)}
                                className="w-full h-12 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                                disabled={isSubmitting || !investmentData.amount || !investmentData.equity}
                              >
                                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                {isSubmitting ? "Submitting..." : "Submit Proposal"}
                              </Button>
                            </div>
                          </SheetContent>
                        </Sheet>
                      ) : (
                        <Button
                          className="w-full h-11 gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                          disabled={isSubmitting}
                          onClick={() => handleApply()}
                        >
                          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                          {isSubmitting ? "Submitting..." : "Apply to Project"}
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ── Chat Area ── */}
      <div className="flex-1 overflow-hidden">
        {showChat ? (
          project.communityChatId ? (
            <ProjectChat
              projectId={project.id}
              communityChatId={project.communityChatId}
              projectName={project.name}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="p-5 rounded-3xl bg-primary/5">
                <MessageSquare className="h-12 w-12 text-primary/30" />
              </div>
              <p className="font-semibold text-muted-foreground">Community chat is being initialized…</p>
              <p className="text-xs text-muted-foreground/60 italic">Try refreshing if it doesn't appear.</p>
            </div>
          )
        ) : (
          // Applicant not yet accepted → show pending state full-screen
          <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8 bg-muted/10">
            <div className="p-5 rounded-3xl bg-amber-500/10">
              <Loader2 className="h-12 w-12 text-amber-500 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold">Waiting for Approval</h2>
            <p className="text-muted-foreground max-w-xs text-sm">
              Once the entrepreneur accepts your request, the community chat will unlock here.
            </p>
            <Button
              variant="outline"
              className="rounded-xl border-primary/20 hover:bg-primary/5 gap-2"
              onClick={() => setIsDetailsOpen(true)}
            >
              <Info className="h-4 w-4" /> View Project Details
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE  (project list + create sheet)
// ─────────────────────────────────────────────────────────────────────────────

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", details: "" });
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const role = localStorage.getItem("role") || "entrepreneur";
  const isFreelancer = role === "freelancer";
  const isInvestor = role === "investor";
  const isApplicant = isFreelancer || isInvestor;

  const fetchUserProfile = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;
      const response = await fetch("http://localhost:3001/api/auth/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });
      const data = await response.json();
      if (data.success) setUserProfile(data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url = `http://localhost:3001/api/projects${!isApplicant ? "?owned=true" : ""}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      if (data.success) {
        setProjects(data.projects);
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch (err) {
      setError("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
    if (isApplicant) fetchUserProfile();
  }, [isApplicant]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.details) return;
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setFormData({ name: "", details: "" });
        setIsModalOpen(false);
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch (err) {
      alert("An error occurred while creating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Selected project → render inner page ──
  if (selectedProject) {
    return (
      <ProjectInnerPage
        project={selectedProject}
        onBack={() => { setSelectedProject(null); fetchProjects(); }}
        isApplicant={isApplicant}
        isInvestor={isInvestor}
        userProfile={userProfile}
      />
    );
  }

  // ── Project list ──
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
            {isFreelancer ? "Browse Projects" : isInvestor ? "Discover Projects" : "My Projects"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg italic">
            {isFreelancer
              ? "Discover and apply to exciting new opportunities."
              : isInvestor
              ? "Find projects worth investing in."
              : "Manage and track all your created projects."}
          </p>
        </div>

        {!isApplicant && (
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" /> Create Project
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[450px] premium-card border-none">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold gradient-text">Create New Project</SheetTitle>
                <SheetDescription>Fill in the details below to start a new project.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name…"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 px-4 rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm font-semibold">Project Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Describe your project goals, scope, and timeline…"
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="min-h-[200px] p-4 rounded-xl resize-none"
                    required
                  />
                </div>
                <SheetFooter className="mt-8">
                  <Button
                    type="submit"
                    className="w-full h-12 gap-2 text-base rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    {isSubmitting ? "Creating…" : "Create Project"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Separator className="bg-primary/10" />

      {/* States */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0 [animation-delay:-0.3s]" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">
            Loading projects…
          </p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-16 text-center">
            <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-destructive font-bold text-xl mb-4">{error}</p>
            <Button variant="outline" onClick={fetchProjects} className="rounded-xl px-8">Try Again</Button>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-3xl bg-muted/10 p-12">
          <div className="p-6 rounded-3xl bg-primary/5 mb-6">
            <Briefcase className="h-16 w-16 text-primary/40" />
          </div>
          <p className="text-2xl font-bold">No projects found</p>
          <p className="text-muted-foreground max-w-sm text-center mt-2 mb-8">
            {isApplicant
              ? "Check back later for new projects or explore the discovery page."
              : "Start your journey by creating your first exciting project now."}
          </p>
          {!isApplicant && (
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl px-10 h-12 border-primary/20 hover:bg-primary/5"
            >
              Get Started
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="premium-card group relative overflow-hidden h-full border-primary/5 hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5"
              onClick={() => setSelectedProject(project)}
            >
              <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-primary/10 rounded-full p-2">
                  <Plus className="h-4 w-4 text-primary" />
                </div>
              </div>

              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-500 border-none px-2.5 uppercase text-[10px] font-bold tracking-widest"
                  >
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
                  Added {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed min-h-[4.5rem]">
                  {project.details}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-primary/5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">
                      ENT
                    </div>
                    <span className="text-xs font-medium">Entrepreneur</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-4 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    View Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
