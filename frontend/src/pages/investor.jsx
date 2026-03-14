import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PostForm from "@/components/posts/PostForm";
import { analyticsAPI } from "@/services/api";
import { Loader2, TrendingUp, DollarSign, Rocket } from "lucide-react";

export default function InvestorDashboard() {
  const [summary, setSummary] = useState("")
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    portfolioStartups: 0,
    investedAmount: 0,
    roiDomain: "N/A"
  });
  
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem('uid') || null

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await analyticsAPI.getInvestor();
        if (data) setStats(data);
      } catch (err) {
        console.error("Failed to fetch investor stats:", err);
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
      id: 'portfolio', 
      title: 'Portfolio Startups', 
      value: stats.portfolioStartups.toString(),
      icon: Rocket,
      sub: stats.portfolioStartups > 0 ? "Active investments" : "Browse opportunities"
    },
    { 
      id: 'investedAmount', 
      title: 'Invested Amount', 
      value: `$${(stats.investedAmount / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      sub: "Total capital deployed"
    },
    { 
      id: 'roiDomain', 
      title: 'Highest ROI Domain', 
      value: stats.roiDomain,
      icon: TrendingUp,
      sub: "Leading sector"
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Investor Dashboard</h1>
      </div>

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


