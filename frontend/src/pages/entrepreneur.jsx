import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Rocket, Coins, CalendarDays, Users, FileText } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PostForm from "@/components/posts/PostForm";

export default function EntrepreneurDashboard() {
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [summary, setSummary] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  
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
        {[
          { id: 'projects', title: 'Active Projects', value: '4', sub: '+1 since last week', icon: Briefcase },
          { id: 'burn', title: 'Monthly Burn', value: '$12,400', sub: '-8% vs previous month', icon: Coins },
          { id: 'runway', title: 'Runway', value: '8 months', sub: 'safe zone (≥ 6 months)', icon: CalendarDays },
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
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overview + sidebar widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main overview */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-0">
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="milestones">
              <TabsList>
                <TabsTrigger value="milestones">Milestones</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
              </TabsList>
              <TabsContent value="milestones" className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm">Beta launch</div>
                  <Badge variant="secondary">Due in 2 weeks</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="text-sm">Onboard 10 pilot customers</div>
                  <Badge>In progress</Badge>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="text-sm">Finalize pricing tiers</div>
                  <Badge variant="outline">Backlog</Badge>
                </div>
              </TabsContent>
              <TabsContent value="team" className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="A" />
                    <AvatarFallback>AL</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium leading-none">Alice Johnson</div>
                    <div className="text-muted-foreground">Frontend Engineer</div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/02.png" alt="B" />
                    <AvatarFallback>BK</AvatarFallback>
                  </Avatar>
                  <div className="text-sm">
                    <div className="font-medium leading-none">Ben Kim</div>
                    <div className="text-muted-foreground">Product Designer</div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="fundraising" className="space-y-4">
                <div className="text-sm text-muted-foreground">Target: Seed extension $500k</div>
                <div className="w-full h-2 rounded bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "60%" }} />
                </div>
                <div className="text-xs text-muted-foreground">$300k committed (60%)</div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[180px] pr-4">
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="font-medium">Investor meeting scheduled</div>
                    <div className="text-muted-foreground">Tomorrow, 10:00 AM</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium">New pilot customer joined</div>
                    <div className="text-muted-foreground">Acme Health</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium">v0.7.0 release notes drafted</div>
                    <div className="text-muted-foreground">Review pending</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="font-medium">Design handoff</div>
                    <div className="text-muted-foreground">Dashboard cards refresh</div>
                  </div>
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button variant="secondary" size="sm" className="gap-2"><Users className="h-4 w-4" /> Invite teammate</Button>
              <Button variant="secondary" size="sm" className="gap-2"><Rocket className="h-4 w-4" /> Plan launch</Button>
              <Button variant="secondary" size="sm" className="gap-2"><Coins className="h-4 w-4" /> Update metrics</Button>
            </CardContent>
          </Card>
        </div>
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


