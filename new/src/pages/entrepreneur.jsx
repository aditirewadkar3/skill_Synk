import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
<<<<<<< HEAD
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
=======
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Briefcase, Rocket, Coins, CalendarDays, Users, FileText } from "lucide-react";
>>>>>>> 3062aca8746b521d2f61851f77189890f3e9d8eb

export default function EntrepreneurDashboard() {
  const [summary, setSummary] = useState("");
  return (
    <div className="theme-entrepreneur p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Entrepreneur Dashboard</h1>
          <p className="text-sm text-muted-foreground">Track product, team, and fundraising progress at a glance.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <FileText className="h-4 w-4" /> Share Update
          </Button>
          <Button className="gap-2">
            <Rocket className="h-4 w-4" /> New Project
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">+1 since last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Burn</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$12,400</div>
            <p className="text-xs text-muted-foreground">-8% vs previous month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Runway</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8 months</div>
            <p className="text-xs text-muted-foreground">safe zone (≥ 6 months)</p>
          </CardContent>
        </Card>
      </div>

<<<<<<< HEAD
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="milestones">
            <TabsList>
              <TabsTrigger value="milestones">Milestones</TabsTrigger>
              <TabsTrigger value="team">Team</TabsTrigger>
              <TabsTrigger value="fundraising">Fundraising</TabsTrigger>
            </TabsList>
            <TabsContent value="milestones">
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li>Beta launch in 2 weeks</li>
                <li>Onboard 10 pilot customers</li>
                <li>Finalize pricing tiers</li>
              </ul>
            </TabsContent>
            <TabsContent value="team">
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li>Hiring frontend engineer</li>
                <li>Contract designer for brand refresh</li>
              </ul>
            </TabsContent>
            <TabsContent value="fundraising">
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li>Target: Seed extension $500k</li>
                <li>3 meetings scheduled this week</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Feed + Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Feed onSummarize={(s) => setSummary(`${s.title} — ${s.text}`)} />
        </div>
        <div className="lg:col-span-1">
          <SummaryPanel summary={summary} onClear={() => setSummary("")} />
=======
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
>>>>>>> 3062aca8746b521d2f61851f77189890f3e9d8eb
        </div>
      </div>
    </div>
  );
}


