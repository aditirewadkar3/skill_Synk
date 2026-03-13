import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Briefcase, Plus, Loader2, Info, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { getAuthToken } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { ProjectChat } from "@/components/chat/ProjectChat";
import { Badge } from "@/components/ui/badge";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", details: "" });
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  const role = localStorage.getItem("role") || "entrepreneur";
  const isFreelancer = role === "freelancer";

  const fetchUserProfile = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;
      const response = await fetch("http://localhost:3001/api/auth/get-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid })
      });
      const data = await response.json();
      if (data.success) {
        setUserProfile(data.user);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      // If entrepreneur, fetch only owned projects. If freelancer, fetch all.
      const url = `http://localhost:3001/api/projects${!isFreelancer ? "?owned=true" : ""}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
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
    if (isFreelancer) {
      fetchUserProfile();
    }
  }, [isFreelancer]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.details) return;

    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const response = await fetch("http://localhost:3001/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  const handleApply = async (project) => {
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/projects/${project.id}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          freelancerName: userProfile.name,
          freelancerEmail: userProfile.email
        }),
      });
      const data = await response.json();
      if (data.success) {
        alert("Application sent successfully!");
        const updatedProject = { 
          ...project, 
          applicants: [...(project.applicants || []), data.application] 
        };
        setSelectedProject(updatedProject);
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch (err) {
      alert("An error occurred while applying");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedProject) {
    const userUid = localStorage.getItem("uid");
    const myApplication = selectedProject.applicants?.find(a => a.applicantId === userUid);
    const isAcceptedFreelancer = myApplication?.status === 'accepted';
    const showChat = !isFreelancer || isAcceptedFreelancer;

    return (
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
        {/* Project Details Section */}
        <div className="flex-1 flex flex-col min-w-0 border-r overflow-y-auto">
          <div className="p-8 space-y-8 max-w-4xl mx-auto w-full">
            <Button 
              variant="ghost" 
              className="mb-4 hover:bg-primary/10 -ml-4"
              onClick={() => setSelectedProject(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to projects
            </Button>
            
            <header className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit">
                <Briefcase className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight gradient-text leading-tight">
                {selectedProject.name}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Status: <span className="text-emerald-500 font-semibold uppercase">Active</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span>Posted on {new Date(selectedProject.createdAt).toLocaleDateString()}</span>
              </div>
            </header>

            <Separator className="bg-primary/10" />

            <section className="space-y-6">
              <div className="bg-muted/30 p-8 rounded-3xl border border-primary/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Project Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedProject.details}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/30 border border-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">Owner</p>
                  <p className="text-lg font-bold">Entrepreneur</p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 border border-primary/5">
                  <p className="text-sm text-muted-foreground mb-1">Duration</p>
                  <p className="text-lg font-bold">Flexible</p>
                </div>
              </div>
            </section>

            {isFreelancer && (
              <section className="pt-8">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20">
                  {myApplication ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      {myApplication.status === 'pending' && (
                        <>
                          <Loader2 className="h-12 w-12 text-muted-foreground animate-pulse mb-2" />
                          <h3 className="text-xl font-bold">Application Pending</h3>
                          <p className="text-muted-foreground">The entrepreneur is reviewing your application.</p>
                        </>
                      )}
                      {myApplication.status === 'accepted' && (
                        <>
                          <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
                          <h3 className="text-xl font-bold text-emerald-500">Application accepted!</h3>
                          <p className="text-muted-foreground">You are now part of this project's community.</p>
                        </>
                      )}
                      {myApplication.status === 'rejected' && (
                        <>
                          <AlertCircle className="h-12 w-12 text-destructive mb-2" />
                          <h3 className="text-xl font-bold text-destructive">Application Rejected</h3>
                          <p className="text-muted-foreground">Unfortunately, your application was not accepted for this project.</p>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <h3 className="text-xl font-bold mb-2">Interested in this project?</h3>
                      <p className="text-muted-foreground mb-6">Apply now and start collaborating with the creator.</p>
                      <Button 
                        className="w-full sm:w-auto px-8 gap-2 text-lg h-12 bg-gradient-to-r from-primary to-primary/80 hover:scale-[1.02] transition-transform"
                        disabled={isSubmitting}
                        onClick={() => handleApply(selectedProject)}
                      >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                        {isSubmitting ? "Submitting Application..." : "Apply to Project"}
                      </Button>
                    </>
                  )}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Community Chat Section */}
        {showChat && (
          <div className="w-[400px] lg:w-[450px] shrink-0 hidden md:block">
            {selectedProject.communityChatId ? (
              <ProjectChat 
                projectId={selectedProject.id}
                communityChatId={selectedProject.communityChatId}
                projectName={selectedProject.name}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-muted/10">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-medium">Community chat is being initialized...</p>
                <p className="text-xs text-muted-foreground mt-2 italic">Try refreshing if it doesn't appear.</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
            {isFreelancer ? "Browse Projects" : "My Projects"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg italic">
            {isFreelancer 
              ? "Discover and apply to exciting new opportunities." 
              : "Manage and track all your created projects."}
          </p>
        </div>
        
        {!isFreelancer && (
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 h-11 px-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-all shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" /> Create Project
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[450px] premium-card border-none">
              <SheetHeader>
                <SheetTitle className="text-2xl font-bold gradient-text">Create New Project</SheetTitle>
                <SheetDescription>
                  Fill in the details below to start a new project.
                </SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-semibold">Project Name</Label>
                  <Input
                    id="name"
                    placeholder="Enter project name..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="premium-input h-12 px-4 rounded-xl ring-offset-background focus-visible:ring-primary"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-sm font-semibold">Project Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Describe your project goals, scope, and timeline..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="min-h-[200px] p-4 premium-input rounded-xl ring-offset-background focus-visible:ring-primary resize-none"
                    required
                  />
                </div>
                <SheetFooter className="mt-8">
                  <Button 
                    type="submit" 
                    className="w-full h-12 gap-2 text-lg rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Plus className="h-5 w-5" />}
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Separator className="bg-primary/10" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0 [animation-delay:-0.3s]" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Loading projects...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
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
          <div className="p-6 rounded-3xl bg-primary/5 mb-6 group-hover:scale-110 transition-transform">
            <Briefcase className="h-16 w-16 text-primary/40" />
          </div>
          <p className="text-2xl font-bold text-foreground">No projects found</p>
          <p className="text-muted-foreground max-w-sm text-center mt-2 mb-8">
            {isFreelancer ? "Check back later for new projects or explore the discovery page." : "Start your journey by creating your first exciting project now."}
          </p>
          {!isFreelancer && (
            <Button variant="outline" onClick={() => setIsModalOpen(true)} className="rounded-xl px-10 h-12 border-primary/20 hover:bg-primary/5">
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
              onClick={() => {
                setSelectedProject(project);
              }}
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
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none px-2.5 uppercase text-[10px] font-bold tracking-widest">
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
                     <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold">ENT</div>
                     <span className="text-xs font-medium">Entrepreneur</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-10 px-4 rounded-lg text-xs font-bold uppercase tracking-wider group-hover:bg-primary group-hover:text-white transition-all">
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
