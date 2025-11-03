import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";

export default function InvestorDashboard() {
  const [summary, setSummary] = useState("")
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Startups</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">9</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>YTD IRR</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">18.4%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Follow-on Reserves</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">$1.2M</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="deals">
            <TabsList>
              <TabsTrigger value="deals">Deals</TabsTrigger>
              <TabsTrigger value="updates">Updates</TabsTrigger>
              <TabsTrigger value="risks">Risks</TabsTrigger>
            </TabsList>
            <TabsContent value="deals">
              <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
                <li>AI Ops platform raising Seed</li>
                <li>Fintech infra Series A opening next month</li>
              </ul>
            </TabsContent>
            <TabsContent value="updates">
              <p className="text-sm text-muted-foreground">5 startups shared monthly updates.</p>
            </TabsContent>
            <TabsContent value="risks">
              <p className="text-sm text-muted-foreground">Monitor churn in 2 portfolio companies.</p>
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


