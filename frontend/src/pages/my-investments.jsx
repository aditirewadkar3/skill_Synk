import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProjectChat } from "@/components/chat/ProjectChat";
import { projectsAPI } from "@/services/api";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import {
  TrendingUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Info,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
  Edit3,
  Calendar,
  DollarSign,
  Percent,
  Layers,
  Map,
  Hammer,
  ClipboardCheck,
  Wrench,
  Circle,
  Rocket,
  Briefcase,
} from "lucide-react";

// ─── VIEW CONSTANTS ──────────────────────────────────────────────────────────
const VIEW_LIST      = "list";
const VIEW_DETAIL    = "detail";
const VIEW_COMMUNITY = "community";
const VIEW_WHITEBOARD = "whiteboard";

// ─── DEFAULT LIFECYCLE DATA (Fallback) ───────────────────────────────────────
const DEFAULT_STAGES = [
  {
    id: "stage_1",
    order: 1,
    title: "Resource Allocation",
    iconName: "Layers",
    subStages: [
      { id: "sub_1_1", title: "Talent Sourcing", completed: false },
      { id: "sub_1_2", title: "Budget Allocation", completed: false },
      { id: "sub_1_3", title: "Technical Stack Setup", completed: false }
    ]
  },
  {
    id: "stage_2",
    order: 2,
    title: "Project Planning",
    iconName: "Map",
    subStages: [
      { id: "sub_2_1", title: "Requirements Gathering", completed: false },
      { id: "sub_2_2", title: "System Architecture", completed: false },
      { id: "sub_2_3", title: "UI/UX Roadmapping", completed: false }
    ]
  }
];

const ICON_MAP = {
  Layers, Map, Hammer, ClipboardCheck, Wrench, Rocket, Briefcase, TrendingUp
};

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 4 — WHITEBOARD (full-screen)
// ═════════════════════════════════════════════════════════════════════════════
function InvestmentWhiteboard({ investment, onBack }) {
  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden relative">
      <div className="absolute top-4 left-4 z-[9999] flex items-center gap-2 pointer-events-none">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="rounded-xl bg-background/80 backdrop-blur-md border-primary/20 pointer-events-auto shadow-md hover:bg-primary/10"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-xl border border-primary/20 shadow-md pointer-events-auto">
          <p className="font-semibold text-sm leading-tight flex items-center gap-2">
            <Edit3 className="h-4 w-4 text-primary" /> {investment.projectName} Whiteboard
          </p>
        </div>
      </div>
      <div className="flex-1 w-full h-full">
        <Tldraw persistenceKey={`investment-${investment.projectId}`} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 3 — COMMUNITY CHAT (full-screen with Lifecycle sidebar)
// ═════════════════════════════════════════════════════════════════════════════
function InvestmentCommunity({ investment, onBack }) {
  const currentLifecycle = investment.lifecycle || DEFAULT_STAGES;
  const [activeStageId, setActiveStageId] = useState(currentLifecycle[0]?.id || "stage_1");

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-background overflow-hidden text-foreground">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b bg-background/95 backdrop-blur-sm shrink-0 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-xl hover:bg-primary/10 h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
            <MessageSquare className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate uppercase tracking-tight">
              {investment.projectName}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium italic">
              Portfolio Insights
            </p>
          </div>
        </div>
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase font-bold tracking-widest shrink-0"
        >
          Partner
        </Badge>
      </div>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Project Stages */}
        <aside className="w-72 border-r bg-muted/5 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-5 border-b bg-background/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <Rocket className="h-3.5 w-3.5" /> Project Roadmap
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {currentLifecycle.map((stage) => {
                const isActive = activeStageId === stage.id;
                const Icon = ICON_MAP[stage.iconName] || Rocket;
                const completedCount = stage.subStages?.filter(s => s.completed).length || 0;
                const totalCount = stage.subStages?.length || 0;
                const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

                return (
                  <div key={stage.id} className="space-y-1">
                    <button
                      onClick={() => setActiveStageId(stage.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-300 relative group ${
                        isActive 
                          ? `bg-primary/10 ring-1 ring-inset ring-primary/20` 
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isActive ? "bg-background shadow-sm" : "bg-muted/50"}`}>
                        <Icon className={`h-4 w-4 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className={`text-[13px] font-bold leading-tight truncate ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                          {stage.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1 bg-muted-foreground/10 rounded-full overflow-hidden">
                             <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                          </div>
                          <span className="text-[9px] font-bold opacity-40">{completedCount}/{totalCount}</span>
                        </div>
                      </div>
                      {isActive && <Circle className="h-1.5 w-1.5 fill-primary text-primary" />}
                    </button>

                    {isActive && (
                      <div className="ml-11 pl-4 border-l-2 border-primary/20 py-2 space-y-3">
                        {(!stage.subStages || stage.subStages.length === 0) && (
                          <p className="text-[10px] text-muted-foreground/40 italic">No tasks active.</p>
                        )}
                        {stage.subStages?.map((sub) => (
                          <div 
                            key={sub.id} 
                            className="flex items-start gap-3 group"
                          >
                            <div className={`mt-0.5 rounded-md border flex items-center justify-center transition-all duration-300 ${
                              sub.completed 
                                ? "bg-emerald-500 border-emerald-500 w-3.5 h-3.5" 
                                : "bg-background border-muted-foreground/30 w-3.5 h-3.5"
                            }`}>
                              {sub.completed && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <p className={`text-[11px] font-medium leading-[1.2] transition-colors flex-1 ${
                              sub.completed ? "line-through text-muted-foreground/40" : "text-muted-foreground/80"
                            }`}>
                              {sub.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </aside>

        {/* Chat area */}
        <div className="flex-1 overflow-hidden relative">
          {investment.communityChatId ? (
            <ProjectChat
              projectId={investment.projectId}
              communityChatId={investment.communityChatId}
              projectName={investment.projectName}
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-8">
              <div className="p-5 rounded-3xl bg-primary/5">
                <MessageSquare className="h-12 w-12 text-primary/30" />
              </div>
              <p className="font-semibold text-muted-foreground">Chat is initializing…</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 2 — INVESTMENT DETAIL
// ═════════════════════════════════════════════════════════════════════════════
function InvestmentDetail({ investment, onBack, onOpenCommunity, onOpenWhiteboard }) {
  const isAccepted = investment.status === 'accepted';
  const isPending  = investment.status === 'pending';
  const isRejected = investment.status === 'rejected';

  const getStatusDisplay = () => {
    if (isAccepted) return { color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2, text: "Accepted" };
    if (isRejected) return { color: "text-destructive", bg: "bg-destructive/10", icon: AlertCircle, text: "Rejected" };
    return { color: "text-amber-500", bg: "bg-amber-500/10", icon: Clock, text: "Pending" };
  };

  const status = getStatusDisplay();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 border-b bg-background/95 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground truncate flex-1 font-medium">
          Investments
          <ChevronRight className="inline h-3.5 w-3.5 mx-1 opacity-40" />
          <span className="text-foreground font-bold truncate uppercase">{investment.projectName}</span>
        </span>
        <Badge variant="secondary" className={`${status.bg} ${status.color} border-none text-[10px] uppercase font-bold tracking-widest`}>
          {status.text}
        </Badge>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">
        <header className="space-y-5">
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-[20px] bg-primary/10 shrink-0">
              <TrendingUp className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text leading-tight uppercase">
                {investment.projectName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground font-medium uppercase tracking-wider">
                 <span className="flex items-center gap-1.5 opacity-60">
                   <Calendar className="h-3.5 w-3.5" />
                   {new Date(investment.appliedAt).toLocaleDateString()}
                 </span>
                 <status.icon className={`h-4 w-4 ${status.color}`} />
                 <span className={status.color}>{status.text}</span>
              </div>
            </div>
          </div>
        </header>

        <Separator className="bg-primary/10" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col gap-1 transition-all hover:bg-primary/10">
            <div className="flex items-center gap-2 text-primary opacity-60">
              <DollarSign className="h-4 w-4" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Offered Capital</p>
            </div>
            <p className="text-3xl font-extrabold text-primary tracking-tight">${Number(investment.investmentAmount).toLocaleString()}</p>
          </div>
          <div className="p-8 rounded-[32px] bg-primary/5 border border-primary/10 flex flex-col gap-1 transition-all hover:bg-primary/10">
            <div className="flex items-center gap-2 text-primary opacity-60">
              <Percent className="h-4 w-4" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Equity Secured</p>
            </div>
            <p className="text-3xl font-extrabold text-primary tracking-tight">{investment.equityWanted}%</p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Rocket className="h-3.5 w-3.5" /> Collaboration
          </h2>
          
          {isAccepted ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={onOpenCommunity}
                className="group relative overflow-hidden rounded-[32px] border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 text-left transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="relative flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-primary/15 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <MessageSquare className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-extrabold leading-tight tracking-tight uppercase">Community</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60 mt-1">Chat & Insights</p>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100" />
                </div>
              </button>

              <button
                onClick={onOpenWhiteboard}
                className="group relative overflow-hidden rounded-[32px] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-8 text-left transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:scale-[1.01]"
              >
                <div className="relative flex items-center gap-5">
                  <div className="p-4 rounded-2xl bg-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Edit3 className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-extrabold leading-tight text-emerald-600 dark:text-emerald-400 tracking-tight uppercase">Whiteboard</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60 mt-1">Brainstorm Canvas</p>
                  </div>
                  <ChevronRight className="h-5 w-5 opacity-20 group-hover:opacity-100" />
                </div>
              </button>
            </div>
          ) : (
            <div className="rounded-[40px] border-2 border-dashed border-primary/10 bg-muted/5 p-12 text-center space-y-4">
              {isPending ? (
                <>
                  <Loader2 className="h-10 w-10 text-amber-500 animate-spin mx-auto opacity-40" />
                  <p className="font-bold text-lg uppercase tracking-tight">Access Restricted</p>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-60 max-w-xs mx-auto">
                    Full workspace permissions will be granted upon acceptance.
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-10 w-10 text-destructive mx-auto opacity-40" />
                  <p className="font-bold text-destructive text-lg">Investment Inactive</p>
                </>
              )}
            </div>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> Venture Overview
          </h2>
          <div className="bg-muted/30 rounded-[32px] border border-primary/5 p-8">
            <p className="text-foreground/80 font-medium leading-relaxed whitespace-pre-wrap text-[15px]">
              {investment.projectDetails}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 1 — INVESTMENT LIST
// ═════════════════════════════════════════════════════════════════════════════
export default function MyInvestmentsPage() {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView]               = useState(VIEW_LIST);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsAPI.getMyInvestments();
      setInvestments(data || []);
      if (selectedProject) {
        const fresh = data.find(i => i.projectId === selectedProject.projectId);
        if (fresh) setSelectedProject(fresh);
      }
    } catch {
      setError("An error occurred while fetching your portfolio.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  if (view === VIEW_WHITEBOARD && selectedProject) {
    return <InvestmentWhiteboard investment={selectedProject} onBack={() => setView(VIEW_DETAIL)} />;
  }
  if (view === VIEW_COMMUNITY && selectedProject) {
    return <InvestmentCommunity investment={selectedProject} onBack={() => setView(VIEW_DETAIL)} />;
  }
  if (view === VIEW_DETAIL && selectedProject) {
    return (
      <InvestmentDetail 
        investment={selectedProject} 
        onBack={() => { setView(VIEW_LIST); setSelectedProject(null); }}
        onOpenCommunity={() => setView(VIEW_COMMUNITY)}
        onOpenWhiteboard={() => setView(VIEW_WHITEBOARD)}
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">My Investments</h1>
          <p className="text-muted-foreground mt-1 text-lg italic uppercase font-bold tracking-tighter opacity-60">Track your high-growth venture portfolio.</p>
        </div>
      </div>

      <Separator className="bg-primary/10" />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
          <p className="text-muted-foreground font-bold animate-pulse tracking-widest uppercase text-[10px]">Loading Capital Data…</p>
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-6">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-40 shrink-0" />
           <p className="text-destructive font-bold text-xl uppercase tracking-tight">{error}</p>
           <Button variant="outline" onClick={fetchInvestments} className="rounded-2xl px-10 h-11 uppercase font-bold tracking-widest text-[10px]">Retry Connection</Button>
        </div>
      ) : investments.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-primary/10 rounded-[40px] bg-muted/5 p-12 text-center">
          <div className="p-8 rounded-[32px] bg-primary/5 mb-8">
            <TrendingUp className="h-16 w-16 text-primary/30" />
          </div>
          <p className="text-2xl font-bold uppercase tracking-tight">Portfolio Empty</p>
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest opacity-60 mt-2 mb-10">You haven't backed any ventures yet.</p>
          <Button onClick={() => window.location.href = '/myprojects'} className="rounded-2xl h-14 px-12 font-bold uppercase tracking-widest text-xs shadow-lg shadow-primary/20">Marketplace</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {investments.map((inv) => (
            <Card 
              key={`${inv.projectId}_${inv.appliedAt}`} 
              className="premium-card group relative overflow-hidden h-full border-primary/5 hover:border-primary/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 bg-muted/5 p-8"
              onClick={() => { setSelectedProject(inv); setView(VIEW_DETAIL); }}
            >
              <CardHeader className="pb-4 relative z-10 p-0">
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-[20px] bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                  <Badge variant="secondary" className={`${inv.status === 'accepted' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'} border-none uppercase text-[9px] font-bold px-3 tracking-[0.15em]`}>
                    {inv.status}
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                  {inv.projectName}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 relative z-10 p-0 mt-8 pt-8 border-t border-primary/10">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                     <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground opacity-40">Allocated</p>
                     <p className="text-xl font-extrabold tracking-tight">${Number(inv.investmentAmount).toLocaleString()}</p>
                   </div>
                   <div className="space-y-1 text-right">
                     <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-muted-foreground opacity-40">Equity</p>
                     <p className="text-xl font-extrabold tracking-tight text-primary">{inv.equityWanted}%</p>
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
