import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Rocket, Coins, CalendarDays, Users, FileText, Loader2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PostForm from "@/components/posts/PostForm";
import { analyticsAPI } from "@/services/api";

export default function EntrepreneurDashboard() {
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeProjects: 0,
    monthlyBurn: 0,
    runway: 0,
    pitchViews: 0,
    investorInterest: 0
  });
  
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem('uid') || null

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getEntrepreneur();
        if (data) setStats(data);
      } catch (err) {
        console.error("Failed to fetch entrepreneur stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleSelect = (id) => {
    setSelectedId(selectedId === id ? null : id)
  }
  
  const kpis = [
    { 
      id: 'projects', 
      title: 'Active Projects', 
      value: stats.activeProjects, 
      sub: stats.activeProjects > 0 ? 'Managing ventures' : 'Start your first project', 
      icon: Briefcase 
    },
    { 
      id: 'burn', 
      title: 'Monthly Burn', 
      value: `$${stats.monthlyBurn.toLocaleString()}`, 
      sub: stats.monthlyBurn > 0 ? 'Talent payout' : 'No active contracts', 
      icon: Coins 
    },
    { 
      id: 'runway', 
      title: 'Runway', 
      value: `${stats.runway} months`, 
      sub: stats.runway >= 6 ? 'Safe zone' : 'Fundraising recommended', 
      icon: CalendarDays 
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Entrepreneur Dashboard</h1>
          <p className="text-sm text-muted-foreground italic">Track product, team, and fundraising progress at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet open={isUpdateSheetOpen} onOpenChange={setIsUpdateSheetOpen}>
            <SheetTrigger asChild>
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-md">
                <Rocket className="h-4 w-4" /> New Post
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-lg p-0">
              <SheetHeader className="p-6 border-b">
                <SheetTitle>Share an Update</SheetTitle>
              </SheetHeader>
              <div className="p-6">
                <PostForm 
                  onSuccess={() => setIsUpdateSheetOpen(false)} 
                  onClose={() => setIsUpdateSheetOpen(false)} 
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* KPI cards - Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="premium-card animate-pulse">
              <div className="h-24 bg-muted/50 rounded-lg" />
            </Card>
           ))
        ) : (
          kpis.map((kpi) => (
            <Card 
              key={kpi.id}
              className={`premium-card interactive-item ${selectedId === kpi.id ? 'selected-component' : ''}`}
              onClick={() => handleSelect(kpi.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <kpi.icon className="h-4 w-4 text-primary animate-float" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 gap-4">
        <Card className="flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3 pt-2">
            <Button variant="secondary" size="sm" className="gap-2 px-4 shadow-sm hover:bg-secondary/80 transition-all"><Users className="h-4 w-4" /> Invite teammate</Button>
            <Button variant="secondary" size="sm" className="gap-2 px-4 shadow-sm hover:bg-secondary/80 transition-all"><Rocket className="h-4 w-4" /> Plan launch</Button>
            <Button variant="secondary" size="sm" className="gap-2 px-4 shadow-sm hover:bg-secondary/80 transition-all"><Coins className="h-4 w-4" /> Update metrics</Button>
            <Button variant="secondary" size="sm" className="gap-2 px-4 shadow-sm hover:bg-secondary/80 transition-all"><FileText className="h-4 w-4" /> New Report</Button>
          </CardContent>
        </Card>
      </div>

      {/* Feed + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Feed onSummarize={(s) => setSummary(`${s.title} — ${s.text}`)} filterAuthorId={uid} filterMode="exclude" />
        </div>
        <div className="lg:col-span-1">
          <SummaryPanel summary={summary} onClear={() => setSummary("")} />
        </div>
      </div>
    </div>
  );
}


