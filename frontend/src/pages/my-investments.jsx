import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, TrendingUp, CheckCircle2, Clock, Info } from "lucide-react";
import { projectsAPI } from "@/services/api";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProjectChat } from "@/components/chat/ProjectChat";

export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsAPI.getMyInvestments();
      setInvestments(data || []);
    } catch (err) {
      console.error("Failed to fetch investments:", err);
      setError("An error occurred while fetching your investments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-none px-2.5 uppercase text-[10px] font-bold tracking-widest gap-1">
            <CheckCircle2 className="w-3 h-3" /> Accepted
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="secondary" className="bg-destructive/10 text-destructive border-none px-2.5 uppercase text-[10px] font-bold tracking-widest gap-1">
            <AlertCircle className="w-3 h-3" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-500 border-none px-2.5 uppercase text-[10px] font-bold tracking-widest gap-1">
            <Clock className="w-3 h-3" /> Pending
          </Badge>
        );
    }
  };

  if (selectedProject) {
    const isAccepted = selectedProject.status === 'accepted';

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
              ← Back to investments
            </Button>
            
            <header className="space-y-4">
              <div className="p-4 rounded-2xl bg-primary/10 w-fit">
                <TrendingUp className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight gradient-text leading-tight">
                {selectedProject.projectName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  {getStatusBadge(selectedProject.status)}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                <span>Applied on {new Date(selectedProject.appliedAt).toLocaleDateString()}</span>
              </div>
            </header>

            <Separator className="bg-primary/10" />

            {/* Investment Terms Card */}
            <section>
              <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl border border-primary/20">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                  💰 Your Proposed Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-6 rounded-2xl bg-background border border-primary/10 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Investment Amount</p>
                    <p className="text-3xl font-bold text-primary">${Number(selectedProject.investmentAmount).toLocaleString()}</p>
                  </div>
                  <div className="p-6 rounded-2xl bg-background border border-primary/10 shadow-sm">
                    <p className="text-sm text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Equity Requested</p>
                    <p className="text-3xl font-bold text-primary">{selectedProject.equityWanted}%</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="bg-muted/30 p-8 rounded-3xl border border-primary/5">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" /> Project Overview
                </h3>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap text-lg">
                  {selectedProject.projectDetails}
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Community Chat Section */}
        {isAccepted && (
          <div className="w-[400px] lg:w-[450px] shrink-0 hidden md:block">
            {selectedProject.communityChatId ? (
              <ProjectChat 
                projectId={selectedProject.projectId}
                communityChatId={selectedProject.communityChatId}
                projectName={selectedProject.projectName}
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
            My Investments
          </h1>
          <p className="text-muted-foreground mt-1 text-lg italic">
            Track and manage your project investment portfolio.
          </p>
        </div>
      </div>

      <Separator className="bg-primary/10" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="relative">
            <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
            <Loader2 className="h-16 w-16 animate-spin text-primary absolute inset-0 [animation-delay:-0.3s]" />
          </div>
          <p className="text-muted-foreground font-medium animate-pulse tracking-widest uppercase text-xs">Loading portfolio...</p>
        </div>
      ) : error ? (
        <Card className="border-destructive/20 bg-destructive/5 overflow-hidden">
          <CardContent className="py-16 text-center">
            <div className="inline-flex p-4 rounded-full bg-destructive/10 text-destructive mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <p className="text-destructive font-bold text-xl mb-4">{error}</p>
            <Button variant="outline" onClick={fetchInvestments} className="rounded-xl px-8">Try Again</Button>
          </CardContent>
        </Card>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed rounded-3xl bg-muted/10 p-12">
          <div className="p-6 rounded-3xl bg-primary/5 mb-6 group-hover:scale-110 transition-transform">
            <TrendingUp className="h-16 w-16 text-primary/40" />
          </div>
          <p className="text-2xl font-bold text-foreground">No investments found</p>
          <p className="text-muted-foreground max-w-sm text-center mt-2 mb-8">
            You haven't requested to invest in any projects yet. Head over to Browse Projects to discover opportunities.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/myprojects'} className="rounded-xl px-10 h-12 border-primary/20 hover:bg-primary/5">
            Browse Projects
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investments.map((inv) => (
            <Card 
              key={`${inv.projectId}_${inv.appliedAt}`} 
              className="premium-card group relative overflow-hidden h-full border-primary/5 hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5"
              onClick={() => setSelectedProject(inv)}
            >
              <CardHeader className="pb-4 relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  {getStatusBadge(inv.status)}
                </div>
                <CardTitle className="text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                  {inv.projectName}
                </CardTitle>
                <CardDescription className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60 mt-2">
                   Applied {new Date(inv.appliedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 relative z-10">
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary/5">
                   <div>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Offered</p>
                     <p className="text-lg font-bold text-foreground">${Number(inv.investmentAmount).toLocaleString()}</p>
                   </div>
                   <div>
                     <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground mb-1">Equity</p>
                     <p className="text-lg font-bold text-foreground">{inv.equityWanted}%</p>
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
