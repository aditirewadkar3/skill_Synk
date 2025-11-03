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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DollarSign, Briefcase, Clock, Filter, FileText, Star } from "lucide-react";
>>>>>>> 3062aca8746b521d2f61851f77189890f3e9d8eb

export default function FreelancerDashboard() {
  const [summary, setSummary] = useState("")
  return (
    <div className="theme-freelancer p-6 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Freelancer Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage contracts, track time, and invoice clients efficiently.</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" /> Filters
                </Button>
              </TooltipTrigger>
              <TooltipContent>Filter by client, status, or date</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Sheet>
            <SheetTrigger asChild>
              <Button className="gap-2">
                <FileText className="h-4 w-4" /> New Invoice
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Create Invoice</SheetTitle>
                <SheetDescription>Generate a new invoice for your client.</SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Enter details in your billing section.</p>
                <p>Attach timesheet and expenses if applicable.</p>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">2 fixed, 1 hourly</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month Income</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">$3,250</div>
            <p className="text-xs text-muted-foreground">$1,100 outstanding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hours Tracked</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">46h</div>
            <div className="mt-2 w-full h-2 rounded bg-muted overflow-hidden">
              <div className="h-full bg-primary" style={{ width: "76%" }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">76% of 60h goal</p>
          </CardContent>
        </Card>
      </div>

      <Card className="theme-freelancer">
        <CardHeader>
          <CardTitle className="theme-freelancer ">Work</CardTitle>
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
          <Feed onSummarize={(s) => setSummary(`${s.title} — ${s.text}`)} />
        </div>
        <div className="lg:col-span-1">
          <SummaryPanel summary={summary} onClear={() => setSummary("")} />
        </div>
      </div>
    </div>
  );
}


