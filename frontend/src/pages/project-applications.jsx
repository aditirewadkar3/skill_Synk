import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, User, Briefcase, CheckCircle2, XCircle, MessageSquare, Clock, TrendingUp } from "lucide-react";
import { getAuthToken } from "@/services/api";

export default function ProjectApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(null); // application ID being processed
  const [error, setError] = useState(null);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch("http://localhost:3001/api/projects/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setApplications(data.applications);
      } else {
        setError(data.error || "Failed to fetch applications");
      }
    } catch (err) {
      setError("An error occurred while fetching applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleRespond = async (id, action) => {
    try {
      setIsProcessing(id);
      const token = getAuthToken();
      const response = await fetch(`http://localhost:3001/api/projects/applications/${id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action: action === 'accept' ? 'accepted' : 'rejected' }),
      });
      const data = await response.json();
      if (data.success) {
        setApplications(apps => apps.map(app => 
          app.id === id ? { ...app, status: action === 'accept' ? 'accepted' : 'rejected' } : app
        ));
        if (action === 'accept') {
          alert("Application accepted! A community chat for the project has been created.");
        }
      } else {
        alert(data.error || "Failed to respond to application");
      }
    } catch (err) {
      alert("An error occurred while processing application");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleChat = (app) => {
    // Navigate to messages with this user
    // In Slynk, we might need a specific way to start a DM
    // For now, let's assume redirecting to /chat?with=ID or similar
    window.location.href = `/chat?with=${app.applicantId}`;
  };

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Project Applications</h1>
        <p className="text-sm text-muted-foreground italic">
          Review and manage freelancers interested in your projects.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground animate-pulse">Fetching applications...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <p className="text-destructive font-semibold mb-4">{error}</p>
          <Button variant="outline" onClick={fetchApplications}>Try Again</Button>
        </div>
      ) : applications.length === 0 ? (
        <Card className="border-dashed border-2 py-20 bg-muted/20">
          <CardContent className="flex flex-col items-center space-y-4 text-center">
            <div className="p-4 rounded-full bg-primary/10">
              <User className="h-10 w-10 text-primary" />
            </div>
            <div>
              <p className="text-xl font-semibold">No applications yet</p>
              <p className="text-sm text-muted-foreground max-w-sm">
                When freelancers apply to your projects, they will appear here for your review.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <Card key={app.id} className="premium-card overflow-hidden transition-all hover:border-primary/30">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Left: Freelancer Info */}
                  <div className="p-6 md:w-1/3 border-b md:border-b-0 md:border-r border-white/5 bg-primary/5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {app.type === 'investor' ? <TrendingUp className="h-6 w-6 text-primary" /> : <User className="h-6 w-6 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{app.freelancerName}</h3>
                        <p className="text-xs text-muted-foreground">{app.freelancerEmail}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className="w-fit">
                        {app.type === 'investor' ? 'Investor' : 'Freelancer'}
                      </Badge>
                      <Badge variant={app.status === 'pending' ? 'outline' : app.status === 'accepted' ? 'success' : 'destructive'} className="rounded-full px-3 w-fit">
                        {app.status.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Right: Project Info and Actions */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-primary">
                        <Briefcase className="h-4 w-4" />
                        <span className="text-sm font-semibold uppercase tracking-wider">Applied for</span>
                      </div>
                      <h2 className="text-2xl font-bold">{app.projectName}</h2>
                      {app.type === 'investor' && (
                        <div className="p-4 bg-muted/40 rounded-xl space-y-2 border border-primary/10">
                          <p className="text-sm font-semibold text-primary">Investment Offer</p>
                          <div className="flex gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Amount</p>
                              <p className="font-bold text-lg">${app.investmentAmount}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Equity Wanted</p>
                              <p className="font-bold text-lg">{app.equityWanted}%</p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        Applied on {new Date(app.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric', month: 'long', day: 'numeric'
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-wrap gap-3">
                      {app.status === 'pending' ? (
                        <>
                          <Button 
                            className="bg-emerald-600 hover:bg-emerald-700 gap-2 min-w-[120px]"
                            onClick={() => handleRespond(app.id, 'accept')}
                            disabled={isProcessing === app.id}
                          >
                            {isProcessing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            Accept
                          </Button>
                          <Button 
                            variant="destructive" 
                            className="gap-2 min-w-[120px]"
                            onClick={() => handleRespond(app.id, 'reject')}
                            disabled={isProcessing === app.id}
                          >
                            {isProcessing === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                            Reject
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground italic">
                          {app.status === 'accepted' ? (
                            <span className="text-emerald-500 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4" /> Application Accepted
                            </span>
                          ) : (
                            <span className="text-destructive font-medium flex items-center gap-1">
                              <XCircle className="h-4 w-4" /> Application Rejected
                            </span>
                          )}
                        </div>
                      )}
                      <Button 
                        variant="outline" 
                        className="gap-2 ml-auto"
                        onClick={() => handleChat(app)}
                      >
                        <MessageSquare className="h-4 w-4" /> Message {app.type === 'investor' ? 'Investor' : 'Freelancer'}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
