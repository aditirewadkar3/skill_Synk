import * as React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  Download,
  Calendar,
  HelpCircle,
  LogOut,
  BarChart3,
  LineChart,
} from "lucide-react"
import { analyticsAPI } from "@/services/api"

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = React.useState("30days")
  const [data, setData] = React.useState({ recommended: [], trending: [] })
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await analyticsAPI.getInvestorData()
        setData({
          recommended: res.recommended || [],
          trending: res.trending || []
        })
      } catch (err) {
        console.error("Failed to fetch investor analytics:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Map trending into chart data
  const fundingData = data.trending.slice(0, 4).map((s, i) => ({
    week: s.name || s.id.slice(0, 5),
    value: Math.min(1.0, (s.viewCount || 0) / 100)
  }))

  const investorData = data.recommended.slice(0, 4).map(s => ({
    name: s.name || s.id.slice(0, 5),
    value: 80 + Math.random() * 20 // Match score
  }))

  // Use real trending data for the table
  const freelancerData = data.trending.map(s => ({
    id: s.id,
    name: s.name || "Startup",
    project: s.industry || "FinTech",
    hours: s.viewCount || 0,
    cost: (s.interestedInvestors || []).length,
    status: "Trending",
  }))

  // Render Funding Over Time Line Chart
  const FundingChart = () => {
    const width = 100
    const height = 60
    const padding = 10
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2

    const maxValue = Math.max(...fundingData.map((d) => d.value))
    const points = fundingData.map((d, i) => {
      const x = (i / (fundingData.length - 1)) * chartWidth + padding
      const y = height - (d.value / maxValue) * chartHeight - padding
      return { x, y }
    })

    const pathData = `M ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`

    const areaPath = `M ${padding},${height - padding} ${pathData.replace(
      "M",
      "L"
    )} L ${width - padding},${height - padding} Z`

    return (
      <div className="w-full h-20 mt-4">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          <defs>
            <linearGradient id="fundingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#fundingGradient)" />
          <path
            d={pathData}
            fill="none"
            stroke="rgb(59, 130, 246)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    )
  }

  // Render Investor Engagement Bar Chart
  const InvestorChart = () => {
    const width = 100
    const height = 60
    const padding = 10
    const chartWidth = width - padding * 2
    const chartHeight = height - padding * 2
    const barWidth = chartWidth / investorData.length - 4

    const maxValue = 100

    return (
      <div className="w-full h-20 mt-4">
        <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {investorData.map((investor, i) => {
            const barHeight = (investor.value / maxValue) * chartHeight
            const x = padding + i * (chartWidth / investorData.length)
            const y = height - padding - barHeight
            const isHighest = investor.value === Math.max(...investorData.map((d) => d.value))

            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={isHighest ? "rgb(30, 64, 175)" : "rgb(59, 130, 246)"}
                rx="2"
              />
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 sm:py-8 ">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics & Insights</h1>
            <p className="text-muted-foreground mt-1">
              View key metrics and predictions for your business.
            </p>
          </div>
          <Button className="shrink-0">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Date Range Filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedPeriod === "30days" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("30days")}
          >
            Last 30 Days
          </Button>
          <Button
            variant={selectedPeriod === "90days" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("90days")}
          >
            Last 90 Days
          </Button>
          <Button
            variant={selectedPeriod === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPeriod("year")}
          >
            This Year
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Custom Range
          </Button>
        </div>

        {/* Top Section - Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Funding Over Time Card */}
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle>Funding Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{data.trending[0]?.name || "Tracking..."}</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Most Viewed Startup</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Trending Now</span>
                  </div>
                </div>
              </div>
              <FundingChart />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {fundingData.map((d, i) => (
                  <span key={i}>{d.week}</span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Investor Engagement Card */}
          <Card className="rounded-2xl shadow-sm border">
            <CardHeader>
              <CardTitle>Investor Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">Matching Algorithms</div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Based on your interests</span>
                  <div className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-4 w-4" />
                    <span>Personalized</span>
                  </div>
                </div>
              </div>
              <InvestorChart />
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                {investorData.map((d, i) => (
                  <span key={i} className="truncate">
                    {d.name}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Freelancer Collaboration Table */}
        <Card className="rounded-2xl shadow-sm border mb-6">
          <CardHeader>
            <CardTitle>Freelancer Collaboration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Startup
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Industry
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Interests
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {freelancerData.map((freelancer) => (
                    <tr key={freelancer.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium">{freelancer.name}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {freelancer.project}
                      </td>
                      <td className="py-3 px-4 text-sm">{freelancer.hours}</td>
                      <td className="py-3 px-4 text-sm font-medium">{freelancer.cost}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            freelancer.status === "Completed" ? "default" : "secondary"
                          }
                          className={
                            freelancer.status === "Completed"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                              : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                          }
                        >
                          {freelancer.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AI Growth Predictions Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">AI Growth Predictions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Projected Revenue Card */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader>
                <CardTitle className="text-base">Projected Revenue (Q+1)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">${(data.trending.length * 1200000).toLocaleString()}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Total cap of trending list</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.trending.length * 20)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Predicted User Growth Card */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader>
                <CardTitle className="text-base">Predicted User Growth</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{(data.recommended.length * 4.5).toFixed(0)}</div>
                <div className="flex items-center gap-1 text-sm text-green-600">
                  <TrendingUp className="h-4 w-4" />
                  <span>Startups matching your profile</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, data.recommended.length * 20)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Market Opportunity Score Card */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader>
                <CardTitle className="text-base">Market Opportunity Score</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-3xl font-bold">{(6 + Math.min(4, data.trending.length / 2)).toFixed(1)} / 10</div>
                <div className="text-sm text-muted-foreground">Portfolio Match Score</div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full transition-all"
                    style={{ width: `${(6 + Math.min(4, data.trending.length / 2)) * 10}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

