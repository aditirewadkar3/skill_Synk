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

  const handleOpenProject = (projectId) => {
    if (!projectId) return;
    window.dispatchEvent(new CustomEvent('app:navigate', { detail: `/myprojects?projectId=${projectId}` }));
  };

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
              className="premium-card group relative overflow-hidden h-full border-primary/5 hover:border-primary/40 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-xl hover:shadow-primary/5"
              onClick={() => handleOpenProject(inv.projectId)}
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
