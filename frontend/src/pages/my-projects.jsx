import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { Briefcase, Plus, Loader2, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { getAuthToken } from "@/services/api";

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
        setIsDetailsOpen(false);
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">
            {isFreelancer ? "Browse Projects" : "My Projects"}
          </h1>
          <p className="text-sm text-muted-foreground italic">
            {isFreelancer 
              ? "Discover and apply to exciting new opportunities." 
              : "Manage and track all your created projects."}
          </p>
        </div>
        
        {!isFreelancer && (
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:scale-105 transition-transform">
                <Plus className="h-4 w-4" /> Create Project
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
                    className="premium-input ring-offset-background focus-visible:ring-primary"
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
                    className="min-h-[150px] premium-input ring-offset-background focus-visible:ring-primary resize-none"
                    required
                  />
                </div>
                <SheetFooter className="mt-8">
                  <Button 
                    type="submit" 
                    className="w-full gap-2 bg-gradient-to-r from-primary to-primary/80" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {isSubmitting ? "Creating..." : "Create Project"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Loading projects...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-10 text-center">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={fetchProjects} className="mt-4">Try Again</Button>
          </CardContent>
        </Card>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 py-20 bg-muted/30">
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold">No projects found</p>
              <p className="text-sm text-muted-foreground">
                {isFreelancer ? "Check back later for new projects." : "Start by creating your first project."}
              </p>
            </div>
            {!isFreelancer && (
              <Button variant="outline" onClick={() => setIsModalOpen(true)} className="mt-2">
                Get Started
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card 
              key={project.id} 
              className="premium-card interactive-item group hover:border-primary/50 transition-all duration-300 cursor-pointer"
              onClick={() => {
                setSelectedProject(project);
                setIsDetailsOpen(true);
              }}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold mt-4 line-clamp-1">{project.name}</CardTitle>
                <CardDescription className="text-xs">
                  Created on {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                  {project.details}
                </p>
                <div className="mt-6 pt-4 border-t border-muted-foreground/10 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Active
                  </span>
                  <Button variant="ghost" size="sm" className="h-8 text-xs hover:text-primary">View Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Project Details Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent side="right" className="sm:max-w-[500px] premium-card border-none">
          {selectedProject && (
            <div className="space-y-8 h-full flex flex-col">
              <SheetHeader>
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <Briefcase className="h-8 w-8 text-primary" />
                </div>
                <SheetTitle className="text-3xl font-bold gradient-text">{selectedProject.name}</SheetTitle>
                <SheetDescription className="text-sm font-medium">
                  Posted on {new Date(selectedProject.createdAt).toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6 flex-1 overflow-auto pr-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" /> Project Description
                  </h3>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {selectedProject.details}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Status</p>
                    <p className="text-sm font-bold text-emerald-500">Active</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/30 border border-white/5">
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-bold">Flexible</p>
                  </div>
                </div>
              </div>

              {isFreelancer && (
                <div className="pt-6 border-t border-white/5">
                  <Button 
                    className="w-full gap-2 text-lg h-12 bg-gradient-to-r from-primary to-primary/80"
                    disabled={isSubmitting}
                    onClick={() => handleApply(selectedProject)}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    {isSubmitting ? "Applying..." : "Apply Now"}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-4 italic">
                    By applying, your profile details will be shared with the entrepreneur.
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
