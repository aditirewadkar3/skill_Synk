import * as React from "react"
import { newsAPI } from "@/services/api"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Calendar, Newspaper, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function NewsPage() {
  const [news, setNews] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState(null)

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        setIsLoading(true)
        const response = await newsAPI.getNews()
        if (response.success) {
          setNews(response.news)
        } else {
          setError(response.message || "Failed to load news")
        }
      } catch (err) {
        console.error("News fetch error:", err)
        setError("An error occurred while fetching news")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNews()
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Fetching latest startup news...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-4">
        <div className="bg-destructive/10 p-4 rounded-full">
          <Newspaper className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-xl font-semibold">Oops! Something went wrong</h3>
        <p className="text-muted-foreground max-w-md">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8 overflow-y-auto h-full">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight gradient-text">Ecosystem News</h1>
        <p className="text-muted-foreground">
          Latest updates from the world of startups, investment, and freelancing.
        </p>
      </div>

      {news.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center gap-4">
          <Newspaper className="h-12 w-12 text-muted-foreground/30" />
          <p className="text-muted-foreground">No news articles found for today yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-12">
          {news.map((article) => (
            <Card key={article.id} className="premium-card interactive-item border-none flex flex-col overflow-hidden">
              {article.urlToImage && (
                <div className="h-48 w-full overflow-hidden border-b">
                  <img 
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="h-full w-full object-cover transition-transform hover:scale-105 duration-500"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                </div>
              )}
              <CardHeader className="p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-[10px] py-0">{article.source}</Badge>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <CardTitle className="text-lg leading-tight line-clamp-2 min-h-[3.5rem]">
                  {article.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex-1">
                <CardDescription className="text-sm line-clamp-2 text-foreground/80">
                  {article.summary}
                </CardDescription>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button 
                  variant="outline" 
                  className="w-full h-10 gap-2 group glass-button"
                  onClick={() => window.open(article.url, '_blank')}
                >
                  Read More
                  <ExternalLink className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function Badge({ children, className, variant = "default" }) {
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
  }
  return (
    <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", variants[variant], className)}>
      {children}
    </div>
  )
}
