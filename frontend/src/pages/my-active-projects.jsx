import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { projectsAPI } from "@/services/api";
import { Loader2, FolderKanban, MessageSquare, ExternalLink, Calendar } from "lucide-react";

export default function MyActiveProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        setLoading(true);
        const data = await projectsAPI.getMyActiveProjects();
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch active projects:", err);
        setError("Could not load your active projects. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveProjects();
  }, []);

  const handleOpenChat = (projectId) => {
    if (!projectId) {
      alert("Project details not available.");
      return;
    }
    // Navigate to Browse Projects page and open this specific project
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: `/myprojects?projectId=${projectId}` }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your active projects...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg inline-block">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">My Active Projects</h1>
        <p className="text-muted-foreground">
          Projects you are currently assigned to and contributing to.
        </p>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed py-12">
          <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <FolderKanban className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">No active projects yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Once an entrepreneur accepts your application, the project will appear here for you to manage and chat with the team.
              </p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: '/myprojects' }))}
            >
              Browse Projects
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="premium-card flex flex-col hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 capitalize">
                    {project.status}
                  </Badge>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <CardTitle className="text-xl font-bold">{project.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2">
                  {project.details}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                    <FolderKanban className="h-4 w-4 text-primary" />
                  </div>
                  <span>Applied on {new Date(project.appliedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
              <div className="p-4 pt-0 mt-auto flex gap-2">
                <Button 
                  className="flex-1 gap-2" 
                  onClick={() => handleOpenChat(project.id)}
                >
                  <MessageSquare className="h-4 w-4" />
                  Team Chat
                </Button>
                <Button variant="outline" size="icon" onClick={() => window.dispatchEvent(new CustomEvent('app:navigate', { detail: `/myprojects` }))}>
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
