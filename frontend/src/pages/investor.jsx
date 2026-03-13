import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Feed from "@/components/feed/Feed";
import SummaryPanel from "@/components/feed/SummaryPanel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import PostForm from "@/components/posts/PostForm";

export default function InvestorDashboard() {
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight gradient-text">Investor Dashboard</h1>
        {/* ... existing sheet ... */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { id: 'portfolio', title: 'Portfolio Startups', value: '9' },
          { id: 'irr', title: 'YTD IRR', value: '18.4%' },
          { id: 'reserves', title: 'Follow-on Reserves', value: '$1.2M' },
        ].map((kpi) => (
          <Card 
            key={kpi.id}
            className={`premium-card interactive-item ${selectedId === kpi.id ? 'selected-component' : ''}`}
            onClick={() => handleSelect(kpi.id)}
          >
            <CardHeader>
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
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
          <Feed onSummarize={(s) => setSummary(`${s.title} — ${s.text}`)} filterAuthorId={uid} filterMode="exclude" />
        </div>
        <div className="lg:col-span-1">
          <SummaryPanel summary={summary} onClear={() => setSummary("")} />
        </div>
      </div>
    </div>
  );
}


