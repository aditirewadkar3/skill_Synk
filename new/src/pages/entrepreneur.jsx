import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";

export default function EntrepreneurDashboard() {
  const [summary, setSummary] = useState("");
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">4</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Burn</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$12,400</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runway</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">8 months</p>
          </CardContent>
        </Card>
      </div>

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
        </div>
      </div>
    </div>
  );
}


