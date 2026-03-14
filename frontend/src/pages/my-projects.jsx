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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ProjectChat } from "@/components/chat/ProjectChat";
import { getAuthToken, projectsAPI } from "@/services/api";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";
import {
  Briefcase,
  Plus,
  Loader2,
  Info,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Users,
  Clock,
  MessageSquare,
  Rocket,
  TrendingUp,
  ChevronRight,
  Edit3,
  Layers,
  Map,
  Hammer,
  ClipboardCheck,
  Wrench,
  Circle,
  Settings2,
  Trash2,
  GripVertical,
} from "lucide-react";

// ─── VIEW CONSTANTS ──────────────────────────────────────────────────────────
const VIEW_LIST      = "list";
const VIEW_DETAIL    = "detail";
const VIEW_COMMUNITY = "community";
const VIEW_WHITEBOARD = "whiteboard";

// ─── DEFAULT LIFECYCLE DATA ──────────────────────────────────────────────────
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
  },
  {
    id: "stage_3",
    order: 3,
    title: "Core Build",
    iconName: "Hammer",
    subStages: [
      { id: "sub_3_1", title: "Frontend Development", completed: false },
      { id: "sub_3_2", title: "API & Backend Services", completed: false },
      { id: "sub_3_3", title: "Database Integration", completed: false }
    ]
  },
  {
    id: "stage_4",
    order: 4,
    title: "Validation & Test",
    iconName: "ClipboardCheck",
    subStages: [
      { id: "sub_4_1", title: "Unit & Integration Tests", completed: false },
      { id: "sub_4_2", title: "QA Bug Squashing", completed: false },
      { id: "sub_4_3", title: "Beta User Feedback", completed: false }
    ]
  },
  {
    id: "stage_5",
    order: 5,
    title: "Deployment & Maintain",
    iconName: "Wrench",
    subStages: [
      { id: "sub_5_1", title: "Production Launch", completed: false },
      { id: "sub_5_2", title: "Performance Monitoring", completed: false },
      { id: "sub_5_3", title: "Iterative Support", completed: false }
    ]
  }
];

const ICON_MAP = {
  Layers, Map, Hammer, ClipboardCheck, Wrench, Rocket, Briefcase, TrendingUp
};

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 4 — WHITEBOARD (full-screen)
// ═════════════════════════════════════════════════════════════════════════════
function ProjectWhiteboard({ project, onBack }) {
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
            <Edit3 className="h-4 w-4 text-primary" /> {project.name} Whiteboard
          </p>
        </div>
      </div>
      <div className="flex-1 w-full h-full">
        <Tldraw persistenceKey={`project-${project.id}`} />
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 3 — COMMUNITY CHAT (full-screen with Lifecycle sidebar)
// ═════════════════════════════════════════════════════════════════════════════
function ProjectCommunity({ project, onBack, onProjectUpdate }) {
  const [activeStageId, setActiveStageId] = useState(project.lifecycle?.[0]?.id || "stage_1");
  const [isManageOpen, setIsManageOpen]   = useState(false);
  const [isSaving, setIsSaving]           = useState(false);
  
  // Local editable copy of lifecycle
  const currentLifecycle = project.lifecycle || DEFAULT_STAGES;
  const [editLifecycle, setEditLifecycle] = useState(currentLifecycle);

  const userUid = localStorage.getItem("uid");
  const isOwner = project.ownerId === userUid;

  useEffect(() => {
    setEditLifecycle(project.lifecycle || DEFAULT_STAGES);
  }, [project.lifecycle]);

  const handleUpdateLifecycle = async (newLifecycle) => {
    try {
      setIsSaving(true);
      const res = await projectsAPI.updateProject(project.id, { lifecycle: newLifecycle });
      if (res.success) {
        onProjectUpdate?.();
      } else {
        alert("Failed to update lifecycle");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating lifecycle");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSubStage = (stageId, subId) => {
    if (!isOwner) return;
    const nextLifecycle = editLifecycle.map(s => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        subStages: s.subStages.map(sub => 
          sub.id === subId ? { ...sub, completed: !sub.completed } : sub
        )
      };
    });
    setEditLifecycle(nextLifecycle);
    handleUpdateLifecycle(nextLifecycle);
  };

  const addStage = () => {
    const newStage = {
      id: `stage_${Date.now()}`,
      order: editLifecycle.length + 1,
      title: "New Stage",
      iconName: "Rocket",
      subStages: []
    };
    setEditLifecycle([...editLifecycle, newStage]);
  };

  const updateStageTitle = (id, title) => {
    setEditLifecycle(editLifecycle.map(s => s.id === id ? { ...s, title } : s));
  };

  const deleteStage = (id) => {
    setEditLifecycle(editLifecycle.filter(s => s.id !== id));
  };

  const addSubStage = (stageId) => {
    setEditLifecycle(editLifecycle.map(s => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        subStages: [...s.subStages, { id: `sub_${Date.now()}`, title: "New Task", completed: false }]
      };
    }));
  };

  const updateSubStageTitle = (stageId, subId, title) => {
    setEditLifecycle(editLifecycle.map(s => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        subStages: s.subStages.map(sub => sub.id === subId ? { ...sub, title } : sub)
      };
    }));
  };

  const deleteSubStage = (stageId, subId) => {
    setEditLifecycle(editLifecycle.map(s => {
      if (s.id !== stageId) return s;
      return {
        ...s,
        subStages: s.subStages.filter(sub => sub.id !== subId)
      };
    }));
  };

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
              {project.name}
            </p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium italic">
              Collaboration & Roadmap
            </p>
          </div>
        </div>

        {isOwner && (
          <Sheet open={isManageOpen} onOpenChange={setIsManageOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg border-primary/20 hover:bg-primary/5 text-[11px] font-bold uppercase tracking-widest">
                <Settings2 className="h-3.5 w-3.5" /> Manage Lifecycle
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[500px] flex flex-col p-0 border-none bg-background shadow-2xl">
              <SheetHeader className="p-6 border-b bg-muted/20">
                <div className="flex items-center gap-3 mb-2">
                   <div className="p-2 rounded-xl bg-primary/10">
                     <Rocket className="h-5 w-5 text-primary" />
                   </div>
                   <SheetTitle className="text-xl font-bold tracking-tight">Project Roadmap</SheetTitle>
                </div>
                <SheetDescription className="text-xs font-medium uppercase tracking-wider opacity-60">
                  Define stages and tasks for your project.
                </SheetDescription>
              </SheetHeader>

<<<<<<< HEAD
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

              {/* Investor Details (if applicable) */}
              {isInvestor && myApplication && (
                <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 rounded-2xl border border-primary/20 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    💰 Your Proposed Terms
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-background border border-primary/10">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Amount</p>
                      <p className="text-lg font-bold text-primary">${Number(myApplication.investmentAmount).toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-background border border-primary/10">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Equity</p>
                      <p className="text-lg font-bold text-primary">{myApplication.equityWanted}%</p>
                    </div>
                  </div>
                </div>
              )}

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
=======
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-8">
                  {editLifecycle.map((stage, sIdx) => (
                    <div key={stage.id} className="p-5 rounded-3xl border border-primary/10 bg-muted/5 space-y-4 group">
                      <div className="flex items-center gap-3">
                        <div className="cursor-grab opacity-20 hover:opacity-100"><GripVertical className="h-4 w-4" /></div>
                        <Input 
                          value={stage.title} 
                          onChange={(e) => updateStageTitle(stage.id, e.target.value)}
                          className="font-bold bg-transparent border-none focus-visible:ring-0 p-0 text-lg h-auto"
                        />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive/40 hover:text-destructive hover:bg-destructive/10 rounded-lg" onClick={() => deleteStage(stage.id)}>
                          <Trash2 className="h-4 w-4" />
>>>>>>> 19988bc14730a97092baf407a539c914c7ae1516
                        </Button>
                      </div>

                      <div className="space-y-3 pl-7">
                        {stage.subStages.map((sub) => (
                          <div key={sub.id} className="flex items-center gap-2 group/sub">
                            <div className={`w-1.5 h-1.5 rounded-full ${sub.completed ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                            <Input 
                              value={sub.title} 
                              onChange={(e) => updateSubStageTitle(stage.id, sub.id, e.target.value)}
                              className="text-sm bg-transparent border-none focus-visible:ring-0 p-0 h-auto text-muted-foreground"
                            />
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 opacity-0 group-hover/sub:opacity-100 text-destructive/40 hover:text-destructive rounded-md" 
                              onClick={() => deleteSubStage(stage.id, sub.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 gap-1 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg px-2"
                          onClick={() => addSubStage(stage.id)}
                        >
                          <Plus className="h-3 w-3" /> Add Task
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button variant="outline" className="w-full border-dashed border-2 py-8 rounded-3xl gap-2 font-bold uppercase tracking-widest text-muted-foreground hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all" onClick={addStage}>
                    <Plus className="h-5 w-5" /> Add New Phase
                  </Button>
                </div>
              </ScrollArea>

              <SheetFooter className="p-6 border-t bg-muted/10">
                <Button 
                  className="w-full h-12 gap-2 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold uppercase tracking-widest"
                  onClick={() => { handleUpdateLifecycle(editLifecycle); setIsManageOpen(false); }}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Save Roadmap
                </Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Workspace Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar — Project Stages */}
        <aside className="w-72 border-r bg-muted/5 flex flex-col shrink-0 hidden lg:flex">
          <div className="p-5 border-b bg-background/50">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60 flex items-center gap-2">
              <Rocket className="h-3.5 w-3.5" /> Project Lifecycle
            </h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-2">
              {currentLifecycle.map((stage) => {
                const isActive = activeStageId === stage.id;
                const Icon = ICON_MAP[stage.iconName] || Rocket;
                const completedCount = stage.subStages.filter(s => s.completed).length;
                const totalCount = stage.subStages.length;
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

                    {/* Sub-stages (only visible when active) */}
                    {isActive && (
                      <div className="ml-11 pl-4 border-l-2 border-primary/20 py-2 space-y-3">
                        {stage.subStages.length === 0 && (
                          <p className="text-[10px] text-muted-foreground/40 italic">No tasks listed.</p>
                        )}
                        {stage.subStages.map((sub) => (
                          <div 
                            key={sub.id} 
                            className={`flex items-start gap-3 group cursor-pointer ${!isOwner && 'pointer-events-none'}`}
                            onClick={() => toggleSubStage(stage.id, sub.id)}
                          >
                            <div className={`mt-0.5 rounded-md border flex items-center justify-center transition-all duration-300 ${
                              sub.completed 
                                ? "bg-emerald-500 border-emerald-500 w-3.5 h-3.5" 
                                : "bg-background border-muted-foreground/30 w-3.5 h-3.5 hover:border-primary"
                            }`}>
                              {sub.completed && <CheckCircle2 className="h-2.5 w-2.5 text-white" />}
                            </div>
                            <p className={`text-[11px] font-medium leading-[1.2] transition-colors flex-1 ${
                              sub.completed ? "line-through text-muted-foreground/40" : "text-muted-foreground/80 group-hover:text-foreground"
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
          {project.communityChatId ? (
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
              <p className="font-semibold text-muted-foreground">
                Community chat is being initialized…
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 2 — PROJECT DETAIL
// ═════════════════════════════════════════════════════════════════════════════
function ProjectDetail({
  project,
  onBack,
  onOpenCommunity,
  onOpenWhiteboard,
  isApplicant,
  isInvestor,
  userProfile,
  onProjectUpdate,
}) {
  const [isSubmitting, setIsSubmitting]           = useState(false);
  const [isInvestmentSheetOpen, setIsInvestmentSheetOpen] = useState(false);
  const [investmentData, setInvestmentData]       = useState({ amount: "", equity: "" });

  const role        = localStorage.getItem("role") || "entrepreneur";
  const userUid     = localStorage.getItem("uid");
  const myApplication     = project.applicants?.find((a) => a.applicantId === userUid);
  const isAcceptedApplicant = myApplication?.status === "accepted";
  const isOwner = project.ownerId === userUid;
  const canAccessChat     = !isApplicant || isAcceptedApplicant || isOwner;
  const acceptedCount     = project.applicants?.filter((a) => a.status === "accepted").length ?? 0;

  const handleApply = async (investorDetails = null) => {
    if (!userProfile) { alert("Profile not loaded. Please try again."); return; }
    try {
      setIsSubmitting(true);
      const token   = getAuthToken();
      const payload = {
        applicantName:  userProfile.name,
        applicantEmail: userProfile.email,
        type:           role,
      };
      if (investorDetails) {
        payload.investmentAmount = investorDetails.amount;
        payload.equityWanted     = investorDetails.equity;
      }
      const res  = await fetch(`http://localhost:3001/api/projects/${project.id}/apply`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        alert(isInvestor ? "Investment request sent!" : "Application sent!");
        if (isInvestor) setIsInvestmentSheetOpen(false);
        onProjectUpdate?.();          // refresh parent
      } else {
        alert(data.error || "Failed to apply");
      }
    } catch {
      alert("An error occurred while applying");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      {/* ── Sticky top bar ── */}
      <div className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 border-b bg-background/95 backdrop-blur-sm">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-xl hover:bg-primary/10 h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground truncate flex-1 font-medium">
          Projects
          <ChevronRight className="inline h-3.5 w-3.5 mx-1 opacity-40" />
          <span className="text-foreground font-bold truncate">{project.name}</span>
        </span>
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-500 border-none text-[10px] uppercase font-bold tracking-widest"
        >
          Active
        </Badge>
      </div>

      {/* ── Body ── */}
      <div className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Hero header */}
        <header className="space-y-5">
          <div className="flex items-start gap-5">
            <div className="p-4 rounded-3xl bg-primary/10 shrink-0">
              <Briefcase className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight gradient-text leading-tight uppercase">
                {project.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(project.createdAt).toLocaleDateString("en-US", {
                    day:   "numeric",
                    month: "short",
                    year:  "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-500">Active</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {acceptedCount} member{acceptedCount === 1 ? "" : "s"}
                </span>
              </div>
            </div>
          </div>
        </header>

        <Separator className="bg-primary/10" />

        {/* Action Grid (Community + Whiteboard) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={canAccessChat ? onOpenCommunity : undefined}
            className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300 shadow-sm ${
              canAccessChat 
                ? "border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 hover:scale-[1.01] active:scale-[0.99]" 
                : "border-muted opacity-60 cursor-not-allowed bg-muted/5 text-muted-foreground"
            }`}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-primary/15 group-hover:bg-primary/25">
                <MessageSquare className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-extrabold leading-tight tracking-tight uppercase">Our Community</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Live Chat & Roadmap</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>

          <button
            onClick={canAccessChat ? onOpenWhiteboard : undefined}
            className={`group relative overflow-hidden rounded-3xl border p-6 text-left transition-all duration-300 shadow-sm ${
              canAccessChat 
                ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-500/10 hover:scale-[1.01] active:scale-[0.99]" 
                : "border-muted opacity-60 cursor-not-allowed bg-muted/5 text-muted-foreground"
            }`}
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-emerald-500/10 blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="relative flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-emerald-500/15 group-hover:bg-emerald-500/25">
                <Edit3 className="h-6 w-6 text-emerald-500" />
              </div>
              <div className="flex-1">
                <p className="text-lg font-extrabold leading-tight text-emerald-600 dark:text-emerald-400 tracking-tight uppercase">Whiteboard</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest opacity-60">Brainstorm & Canvas</p>
              </div>
              <ChevronRight className="h-5 w-5 opacity-40 group-hover:opacity-100 transition-opacity" />
            </div>
          </button>
        </div>

        {/* Description */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
            <Info className="h-3.5 w-3.5" /> Project Overview
          </h2>
          <div className="bg-muted/30 rounded-3xl border border-primary/5 p-8">
            <p className="text-[15px] leading-relaxed text-foreground/80 whitespace-pre-wrap font-medium">
              {project.details}
            </p>
          </div>
        </section>

        {/* ── Application status / Apply section ── */}
        {isApplicant && !isOwner && (
          <>
            <Separator className="bg-primary/10" />
            <section className="space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Rocket className="h-3.5 w-3.5" />
                {isInvestor ? "Invest in This Project" : "Join This Project"}
              </h2>
              
              {myApplication ? (
                <div className="p-7 rounded-3xl border border-primary/20 bg-muted/5 flex flex-col items-center text-center gap-3">
                  {myApplication.status === "pending" ? (
                    <>
                      <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                      <p className="font-bold text-amber-500 text-lg uppercase tracking-tight">Application Pending</p>
                      <p className="text-xs text-muted-foreground max-w-xs font-medium uppercase tracking-wider opacity-60">
                        The entrepreneur is currently reviewing your proposal and profile.
                      </p>
                    </>
                  ) : myApplication.status === "rejected" ? (
                    <>
                      <AlertCircle className="h-10 w-10 text-destructive" />
                      <p className="font-bold text-destructive text-lg">Application Rejected</p>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                      <p className="font-bold text-emerald-500 text-lg uppercase tracking-tight">Member Accepted</p>
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider opacity-60">
                        You have full access to the project community and whiteboard.
                      </p>
                    </>
                  )}
                </div>
              ) : (
                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 space-y-6">
                  <p className="text-muted-foreground text-sm font-medium">
                    {isInvestor
                      ? "Propose an investment to join the project community and collaborate."
                      : "Apply now and start collaborating with the creator and team."}
                  </p>

                  {isInvestor ? (
                    <Sheet open={isInvestmentSheetOpen} onOpenChange={setIsInvestmentSheetOpen}>
                      <SheetTrigger asChild>
                        <Button className="w-full sm:w-auto h-12 px-8 gap-2 text-sm uppercase tracking-widest font-bold rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
                          <TrendingUp className="h-5 w-5" />
                          Propose Investment
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="sm:max-w-[440px] border-none flex flex-col bg-background p-0">
                        <SheetTitle className="sr-only">Investment Proposal</SheetTitle>
                        <SheetHeader className="p-8 border-b bg-muted/20">
                          <div className="p-3 rounded-2xl bg-primary/15 w-fit mb-4">
                            <TrendingUp className="h-6 w-6 text-primary" />
                          </div>
                          <h2 className="text-2xl font-bold tracking-tight">Propose Investment</h2>
                          <SheetDescription className="text-xs font-medium uppercase tracking-widest opacity-60">Offer funding in exchange for equity.</SheetDescription>
                        </SheetHeader>
                        <div className="flex-1 space-y-6 p-8">
                          <div className="space-y-2">
                            <Label htmlFor="amount" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Investment Amount ($)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="e.g., 50000"
                              value={investmentData.amount}
                              onChange={(e) => setInvestmentData({ ...investmentData, amount: e.target.value })}
                              className="h-14 rounded-2xl bg-muted/30 border-primary/5 px-4 font-bold text-lg"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="equity" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Equity Wanted (%)</Label>
                            <Input
                              id="equity"
                              type="number"
                              placeholder="e.g., 10"
                              value={investmentData.equity}
                              onChange={(e) => setInvestmentData({ ...investmentData, equity: e.target.value })}
                              className="h-14 rounded-2xl bg-muted/30 border-primary/5 px-4 font-bold text-lg"
                            />
                          </div>
                        </div>
                        <SheetFooter className="p-8 border-t bg-muted/10">
                          <Button
                            onClick={() => handleApply(investmentData)}
                            className="w-full h-14 gap-2 rounded-2xl bg-primary shadow-lg shadow-primary/20 font-bold uppercase tracking-widest"
                            disabled={isSubmitting || !investmentData.amount || !investmentData.equity}
                          >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                            {isSubmitting ? "Submitting…" : "Submit Proposal"}
                          </Button>
                        </SheetFooter>
                      </SheetContent>
                    </Sheet>
                  ) : (
                    <Button
                      className="w-full sm:w-auto h-12 px-8 gap-2 text-sm uppercase tracking-widest font-bold rounded-2xl bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform"
                      disabled={isSubmitting}
                      onClick={() => handleApply()}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      {isSubmitting ? "Submitting…" : "Apply to Project"}
                    </Button>
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PAGE 1 — PROJECT LIST (main export)
// ═════════════════════════════════════════════════════════════════════════════
export default function MyProjectsPage() {
  const [projects, setProjects]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData]       = useState({ name: "", details: "" });
  const [error, setError]             = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView]               = useState(VIEW_LIST);
  const [userProfile, setUserProfile] = useState(null);

  const role        = localStorage.getItem("role") || "entrepreneur";
  const isFreelancer   = role === "freelancer";
  const isInvestor  = role === "investor";
  const isApplicant = isFreelancer || isInvestor;

  const fetchUserProfile = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;
      const res  = await fetch("http://localhost:3001/api/auth/get-user", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ uid }),
      });
      const data = await res.json();
      if (data.success) setUserProfile(data.user);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const url   = `http://localhost:3001/api/projects${!isApplicant ? "?owned=true" : ""}`;
      const res   = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data  = await res.json();
      if (data.success) {
        setProjects(data.projects);
        if (selectedProject) {
          const fresh = data.projects.find((p) => p.id === selectedProject.id);
          if (fresh) setSelectedProject(fresh);
        }
      } else {
        setError(data.error || "Failed to fetch projects");
      }
    } catch {
      setError("An error occurred while fetching projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchProjects();
      if (isApplicant) fetchUserProfile();
    };
    init();
  }, [isApplicant]);

  // Handle deep-linking and route changes
  useEffect(() => {
    const handleNavigation = () => {
      const params = new URLSearchParams(window.location.search);
      const projectId = params.get('projectId');
      
      if (projectId && projects.length > 0) {
        const project = projects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
        }
      } else if (!projectId) {
        setSelectedProject(null);
      }
    };

    // Run on mount or when projects list changes
    handleNavigation();

    // Listen for custom navigation events and browser back/forward
    window.addEventListener('app:navigate', handleNavigation);
    window.addEventListener('popstate', handleNavigation);
    
    return () => {
      window.removeEventListener('app:navigate', handleNavigation);
      window.removeEventListener('popstate', handleNavigation);
    };
  }, [projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.details) return;
    try {
      setIsSubmitting(true);
      const token = getAuthToken();
      const res   = await fetch("http://localhost:3001/api/projects", {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify(formData),
      });
      const data  = await res.json();
      if (data.success) {
        setProjects([data.project, ...projects]);
        setFormData({ name: "", details: "" });
        setIsModalOpen(false);
      } else {
        alert(data.error || "Failed to create project");
      }
    } catch {
      alert("An error occurred while creating project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProject = (project) => {
    setSelectedProject(project);
    setView(VIEW_DETAIL);
  };

  if (view === VIEW_WHITEBOARD && selectedProject) {
    return (
      <ProjectWhiteboard
        project={selectedProject}
<<<<<<< HEAD
        onBack={() => { 
          setSelectedProject(null); 
          // Clear query param
          const url = new URL(window.location);
          url.searchParams.delete('projectId');
          window.history.pushState({}, '', url);
          fetchProjects(); 
        }}
        isApplicant={isApplicant}
        isInvestor={isInvestor}
        userProfile={userProfile}
=======
        onBack={() => setView(VIEW_DETAIL)}
      />
    );
  }

  if (view === VIEW_COMMUNITY && selectedProject) {
    return (
      <ProjectCommunity
        project={selectedProject}
        onBack={() => setView(VIEW_DETAIL)}
        onProjectUpdate={fetchProjects}
      />
    );
  }

  if (view === VIEW_DETAIL && selectedProject) {
    return (
      <ProjectDetail
        project={selectedProject}
        onBack={() => { setView(VIEW_LIST); setSelectedProject(null); }}
        onOpenCommunity={() => setView(VIEW_COMMUNITY)}
        onOpenWhiteboard={() => setView(VIEW_WHITEBOARD)}
        isApplicant={isApplicant}
        isInvestor={isInvestor}
        userProfile={userProfile}
        onProjectUpdate={fetchProjects}
>>>>>>> 19988bc14730a97092baf407a539c914c7ae1516
      />
    );
  }

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">
            {isFreelancer ? "Browse Projects" : isInvestor ? "Investment Hub" : "My Projects"}
          </h1>
          <p className="text-muted-foreground mt-1 text-lg italic uppercase font-bold tracking-tighter opacity-60">
            {isFreelancer
              ? "Find your next big break."
              : isInvestor
              ? "Discover ventures worth backing."
              : "Command center for your creations."}
          </p>
        </div>

        {!isApplicant && (
          <Sheet open={isModalOpen} onOpenChange={setIsModalOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 h-12 px-8 rounded-2xl bg-primary hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 font-bold uppercase tracking-widest text-xs">
                <Plus className="h-5 w-5" /> New Project
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-[450px] border-none bg-background p-0">
              <SheetHeader className="p-8 border-b bg-muted/20">
                <SheetTitle className="text-2xl font-bold tracking-tight">Create New Venture</SheetTitle>
                <SheetDescription className="text-xs uppercase font-bold tracking-widest opacity-60">Launch your next project into the ecosystem.</SheetDescription>
              </SheetHeader>
              <form onSubmit={handleSubmit} className="space-y-6 p-8">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Venture Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Synk AI..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-14 rounded-2xl bg-muted/30 border-primary/5 px-4 font-bold"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="details" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Venture Details</Label>
                  <Textarea
                    id="details"
                    placeholder="The problem, the solution, and the mission..."
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    className="min-h-[220px] p-4 rounded-2xl bg-muted/30 border-primary/5 resize-none text-[15px] font-medium leading-relaxed"
                    required
                  />
                </div>
                <SheetFooter className="mt-8">
                  <Button
                    type="submit"
                    className="w-full h-14 gap-2 text-sm uppercase font-bold tracking-widest rounded-2xl bg-primary shadow-lg shadow-primary/20"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <Rocket className="h-5 w-5" />}
                    {isSubmitting ? "Launching..." : "Launch Project"}
                  </Button>
                </SheetFooter>
              </form>
            </SheetContent>
          </Sheet>
        )}
      </div>

      <Separator className="bg-primary/10" />

      {/* Body states */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <Loader2 className="h-16 w-16 animate-spin text-primary opacity-20" />
          <p className="text-muted-foreground font-bold animate-pulse tracking-widest uppercase text-[10px]">
            Accessing encrypted data...
          </p>
        </div>
      ) : error ? (
        <div className="py-20 text-center space-y-6">
           <AlertCircle className="h-12 w-12 text-destructive mx-auto opacity-40 shrink-0" />
           <p className="text-destructive font-bold text-xl uppercase tracking-tight">{error}</p>
           <Button variant="outline" onClick={fetchProjects} className="rounded-2xl px-10 h-11 uppercase font-bold tracking-widest text-[10px]">Reconnect</Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-primary/10 rounded-[40px] bg-muted/5 p-12 text-center">
          <div className="p-8 rounded-[32px] bg-primary/5 mb-8">
            <Rocket className="h-16 w-16 text-primary/30" />
          </div>
          <p className="text-2xl font-bold uppercase tracking-tight">The board is empty</p>
          <p className="text-sm text-muted-foreground font-semibold uppercase tracking-widest opacity-60 mt-2 mb-10">
            {isApplicant
              ? "Check back later for new opportunities."
              : "It's time to start your first venture."}
          </p>
          {!isApplicant && (
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(true)}
              className="rounded-2xl h-14 px-12 border-primary/20 font-bold uppercase tracking-widest text-xs hover:bg-primary/5"
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
              className="premium-card group relative overflow-hidden h-full border-primary/5 hover:border-primary/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5 bg-muted/5"
              onClick={() => openProject(project)}
            >
              <div className="absolute top-0 right-0 p-8 pointer-events-none opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-1">
                <div className="bg-primary/10 rounded-full p-2.5">
                  <ChevronRight className="h-4 w-4 text-primary" />
                </div>
              </div>

              <CardHeader className="pb-4 relative z-10 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-[20px] bg-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/10 text-emerald-500 border-none px-3 uppercase text-[9px] font-bold tracking-[0.15em]"
                  >
                    Active
                  </Badge>
                </div>
                <CardTitle className="text-2xl font-bold line-clamp-2 leading-tight group-hover:text-primary transition-colors uppercase tracking-tight">
                  {project.name}
                </CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/40 mt-1">
                  Established {new Date(project.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8 relative z-10 p-8 pt-0">
                <p className="text-[15px] text-muted-foreground line-clamp-3 leading-relaxed min-h-[4.5rem] font-medium opacity-80">
                  {project.details}
                </p>
                <div className="flex items-center justify-between pt-8 border-t border-primary/10 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-muted/20 flex items-center justify-center text-[10px] font-bold uppercase">
                      ENT
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Creator</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-10 px-5 rounded-xl text-[10px] font-bold uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all"
                  >
                    Open
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
