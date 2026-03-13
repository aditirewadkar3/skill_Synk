import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Coins, Users, ExternalLink, MessageSquare } from "lucide-react";

export default function MyProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem('uid')

  useEffect(() => {
    fetchProjects();
  }, [uid]);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/posts/my-projects/${uid}`);
      const data = await res.json();
      if (data.success) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          handleSelectProject(data.projects[0]);
        }
      }
    } catch (err) {
      console.error("Fetch projects error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = async (project) => {
    setSelectedProject(project);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/applications/${project.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
    }
  };

  const handleRespond = async (applicationId, action) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3001/api/applications/respond`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ applicationId, action })
      });
      const data = await res.json();
      if (data.success) {
        // Refresh
        handleSelectProject(selectedProject);
        fetchProjects();
      }
    } catch (err) {
      console.error("Respond error:", err);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading projects...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar: Projects List */}
      <div className="border-r bg-muted/10">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" /> My Projects
          </h2>
        </div>
        <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {projects.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">No projects posted yet.</p>
            ) : (
              projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProject?.id === p.id 
                      ? "bg-primary/10 border-primary/20" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="font-medium truncate">{p.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {p.freelancers?.length || 0} Freelancers • ${p.budget || 0} Burn
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content: Project Details */}
      <div className="md:col-span-2 overflow-y-auto bg-background">
        {selectedProject ? (
          <div className="p-6 max-w-4xl mx-auto space-y-8">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold">{selectedProject.title}</h1>
                  <p className="text-muted-foreground mt-1">{selectedProject.description}</p>
                </div>
                <Badge variant="premium" className="text-sm px-3 py-1">
                  Budget: ${selectedProject.budget || "TBD"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                <Card className="premium-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" /> Freelancers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{selectedProject.freelancers?.length || 0}</div>
                  </CardContent>
                </Card>
                <Card className="premium-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Coins className="h-4 w-4" /> Total Burn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${selectedProject.budget || 0}</div>
                    <p className="text-xs text-muted-foreground">Monthly allocated</p>
                  </CardContent>
                </Card>
                <Card className="premium-card">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" /> Community
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => window.location.href = '/chat'}>
                      Go to Chat
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            <Separator />

            <div className="space-y-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" /> Applications
              </h2>
              <div className="space-y-4">
                {applications.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No applications yet.</p>
                ) : (
                  applications.map((app) => (
                    <Card key={app.id} className="interactive-item">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4">
                            <Avatar className="h-12 w-12 border-2 border-primary/20">
                              <AvatarImage src={app.freelancerProfile?.avatar} />
                              <AvatarFallback>{app.freelancerName?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <h3 className="font-semibold text-lg leading-none">{app.freelancerName}</h3>
                              <p className="text-sm text-muted-foreground">{app.freelancerProfile?.role || 'Freelancer'}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {app.freelancerProfile?.skills?.map(skill => (
                                  <Badge key={skill} variant="secondary" className="text-[10px]">{skill}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {app.status === 'pending' ? (
                              <>
                                <Button size="sm" variant="default" onClick={() => handleRespond(app.id, 'accept')}>Accept</Button>
                                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleRespond(app.id, 'reject')}>Reject</Button>
                              </>
                            ) : (
                              <Badge variant={app.status === 'accepted' ? 'success' : 'destructive'}>
                                {app.status.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                          <p className="font-medium mb-1">Bio:</p>
                          <p className="text-muted-foreground">{app.freelancerProfile?.bio || 'No bio provided.'}</p>
                        </div>
                        {app.freelancerProfile?.portfolio && (
                          <div className="mt-3 flex gap-2">
                            <a href={app.freelancerProfile.portfolio} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                              <ExternalLink className="h-3 w-3" /> Portfolio
                            </a>
                            {app.freelancerProfile.resume && (
                              <a href={app.freelancerProfile.resume} target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center gap-1 hover:underline">
                                <ExternalLink className="h-3 w-3" /> Resume
                              </a>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
            <Briefcase className="h-12 w-12 mb-4 opacity-20" />
            <p>Select a project to view details and applications.</p>
          </div>
        )}
      </div>
    </div>
  );
}
