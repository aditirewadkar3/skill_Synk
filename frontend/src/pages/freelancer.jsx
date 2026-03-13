import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Briefcase, Clock, Filter, FileText, Star } from "lucide-react";
import PostForm from "@/components/posts/PostForm";

export default function FreelancerDashboard() {
  const [summary, setSummary] = useState("")
  const [selectedId, setSelectedId] = useState(null)
  
  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('currentUser')) } catch { return null }
  })()
  const uid = currentUser?.uid || localStorage.getItem('uid') || null

  const handleSelect = (id) => {
    setSelectedId(selectedId === id ? null : id)
  }
  
  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight gradient-text">Freelancer Dashboard</h1>
          <p className="text-sm text-muted-foreground italic">Manage contracts, track time, and invoice clients efficiently.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* ... existing header controls ... */}
        </div>
      </div>

      {/* KPI cards - Interactive */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'contracts', title: 'Active Contracts', value: '3', sub: '2 fixed, 1 hourly', icon: Briefcase },
          { id: 'income', title: 'This Month Income', value: '$3,250', sub: '$1,100 outstanding', icon: DollarSign },
          { id: 'hours', title: 'Hours Tracked', value: '46h', sub: '76% of goal', icon: Clock },
        ].map((kpi) => (
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
              <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              {kpi.id === 'hours' && (
                <div className="mt-2 w-full h-2 rounded bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "76%" }} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className={`premium-card transition-all duration-300 ${selectedId === 'work-tabs' ? 'selected-component' : ''}`} onClick={() => handleSelect('work-tabs')}>
        <CardHeader>
          <CardTitle className="gradient-text">Work & Collaboration</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="tasks">
            <TabsList>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="space-y-2">
              {[
                { t: "Implement chat typing indicator", d: "Client: Slynk", s: "Due Fri" },
                { t: "Refactor dashboard cards", d: "Client: Acme", s: "In review" },
                { t: "Fix responsive issues on mobile", d: "Client: Flux", s: "Next sprint" },
              ].map((item, i) => (
                <Collapsible key={i} className="border rounded-md px-3 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{item.t}</div>
                      <div className="text-xs text-muted-foreground">{item.d}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{item.s}</Badge>
                      <CollapsibleTrigger asChild>
                        <Button size="sm" variant="outline">Details</Button>
                      </CollapsibleTrigger>
                    </div>
                  </div>
                  <CollapsibleContent className="mt-2 text-sm text-muted-foreground">
                    Include tests and ensure a11y. Send for review once done.
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </TabsContent>
            <TabsContent value="invoices" className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">2 invoices pending payment.</div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button size="sm">Create Invoice</Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <SheetHeader>
                      <SheetTitle>New Invoice</SheetTitle>
                      <SheetDescription>Fill out client, items, and totals.</SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">INV-1042 • Acme</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">$650 • Due in 5 days</CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">INV-1043 • Flux</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-muted-foreground">$450 • Due in 9 days</CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="space-y-2">
              {[
                { c: "Acme", r: 5, t: "Great collaboration and quality!" },
                { c: "Flux", r: 5, t: "Fast delivery and clear communication." },
                { c: "Slynk", r: 4, t: "Solid work, minor tweaks needed." },
              ].map((rev, i) => (
                <div key={i} className="border rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{rev.c}</div>
                    <div className="flex items-center gap-1 text-primary">
                      {Array.from({ length: rev.r }).map((_, idx) => (
                        <Star key={idx} className="h-4 w-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <Separator className="my-2" />
                  <p className="text-sm text-muted-foreground">{rev.t}</p>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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


