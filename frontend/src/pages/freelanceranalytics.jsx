import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
} from "lucide-react"

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(false)

  // Demo data reflecting the requirements
  const kpiData = [
    { title: "Trending Skills", value: "React, Node.js, AI", sub: "Top in-demand now", icon: Layers, color: "text-blue-500" },
    { title: "Total Earnings", value: "$12,450", sub: "+12% from last month", icon: DollarSign, color: "text-green-500" },
    { title: "No. of Projects", value: "14", sub: "8 active, 6 completed", icon: Briefcase, color: "text-purple-500" },
  ]

  const projectList = [
    { id: 1, entrepreneur: "Alice Johnson", project: "E-commerce Platform", cost: "$4,500", status: "Active" },
    { id: 2, entrepreneur: "Bob Smith", project: "AI Chatbot Integration", cost: "$3,200", status: "Completed" },
    { id: 3, entrepreneur: "Charlie Davis", project: "Mobile App UI/UX", cost: "$2,800", status: "Active" },
    { id: 4, entrepreneur: "Diana Prince", project: "Backend Refactoring", cost: "$1,950", status: "Completed" },
  ]

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Freelancer Analytics</h1>
          <p className="text-muted-foreground mt-2 font-medium">
            A snapshot of your performance and ongoing projects.
          </p>
        </div>

        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {kpiData.map((kpi, i) => (
            <Card key={i} className="premium-card border-none shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <kpi.icon className="h-16 w-16" />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                  {kpi.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  {kpi.title === "Total Earnings" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  {kpi.sub}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Project List Section */}
        <Card className="rounded-2xl shadow-xl border-none overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="border-b bg-muted/30">
            <CardTitle className="text-xl font-bold">Project List</CardTitle>
            <CardDescription>Detailed overview of your current and past engagements.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/10">
                    <th className="text-left py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Entrepreneur Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-bold text-muted-foreground uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {projectList.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-6 text-sm font-semibold">{item.entrepreneur}</td>
                      <td className="py-4 px-6 text-sm text-foreground/80">{item.project}</td>
                      <td className="py-4 px-6 text-sm font-mono text-primary font-bold">{item.cost}</td>
                      <td className="py-4 px-6 text-sm">
                        <Badge
                          variant={item.status === "Completed" ? "default" : "secondary"}
                          className={`
                            ${item.status === "Completed" 
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" 
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"}
                            font-medium px-3 py-1 rounded-full
                          `}
                        >
                          {item.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

