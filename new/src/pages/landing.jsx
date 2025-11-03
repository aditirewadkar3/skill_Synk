import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import EntrepreneurImg from "@/assets/Entrepreneur.svg"
import InvestorImg from "@/assets/Investor.svg"
import { PieChart } from "lucide-react"
import Spline from "@splinetool/react-spline"

export default function Landing() {
  const navigate = (path) => {
    const pageName = path.replace(/^\//, "") || "landing"
    window.history.pushState({}, "", path)
    window.dispatchEvent(new PopStateEvent("popstate"))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 w-full border-b bg-background/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            <span className="font-semibold">SkillSync</span>
            <Badge variant="secondary" className="ml-2">Beta</Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button onClick={() => navigate("/signup")}>Sign up</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden">
          {/* Wider container */}
          <div className="w-[95%] mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              {/* Text Section */}
              <div className="max-w-2xl">
                <Badge className="mb-4" variant="outline">Connect. Collaborate. Grow.</Badge>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight leading-tight">
                  Build your next opportunity on SkillSync
                </h1>
                <p className="mt-5 text-muted-foreground text-lg max-w-prose">
                  A unified workspace for entrepreneurs, investors, and freelancers. 
                  Chat in real-time, track analytics, and scale faster with the right connections.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <Button size="lg" onClick={() => navigate("/signup")}>Get started</Button>
                  <Button size="lg" variant="outline" onClick={() => navigate("/login")}>I already have an account</Button>
                </div>
                <div className="mt-6 text-sm text-muted-foreground">
                  No credit card required. Free to start.
                </div>
              </div>

              {/* 3D Model Section - No white container */}
              <div className="flex justify-center md:justify-end relative">
                <div className="w-full md:w-[130%] lg:w-[140%] transform md:translate-x-14">
                  <Spline
                    scene="https://prod.spline.design/vzxPkRGHgxpZGsYs/scene.splinecode"
                    className="w-full h-[550px] md:h-[650px] rounded-3xl overflow-hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="p-6">
                <div className="w-full h-44 bg-muted/50 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={EntrepreneurImg}
                    alt="Entrepreneur illustration"
                    className="h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-xl font-semibold">Entrepreneurs</div>
                <p className="mt-2 text-muted-foreground">Showcase ideas, assemble teams, and pitch to backers.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-full h-44 bg-muted/50 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src={InvestorImg}
                    alt="Investor illustration"
                    className="h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-xl font-semibold">Investors</div>
                <p className="mt-2 text-muted-foreground">Discover vetted projects and track portfolio performance.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="w-full h-44 bg-muted/50 rounded-md flex items-center justify-center overflow-hidden">
                  <img
                    src="https://illustrations.popsy.co/amber/remote-work.svg"
                    alt="Freelancer illustration"
                    className="h-full object-contain"
                    loading="lazy"
                  />
                </div>
                <div className="mt-4 text-xl font-semibold">Freelancers</div>
                <p className="mt-2 text-muted-foreground">Find meaningful work and build long-term relationships.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section className="bg-muted/40 py-20">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="text-3xl font-bold mb-6">About SkillSync</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              SkillSync bridges the gap between entrepreneurs, freelancers, and investors — 
              creating a verified, transparent, and collaborative ecosystem.  
              Whether you're pitching your next big idea, funding promising startups, or offering your professional expertise, 
              SkillSync provides a seamless, secure, and data-driven platform to grow together.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/50 mt-20">
        <div className="mx-auto w-[95%] px-10 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-14">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <PieChart className="h-5 w-5 text-primary" />
                <span className="font-semibold text-lg">SkillSync</span>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                Empowering entrepreneurs, freelancers, and investors to collaborate,
                innovate, and grow together through a transparent and secure platform.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Our Story</a></li>
                <li><a href="#" className="hover:underline">Team</a></li>
                <li><a href="#" className="hover:underline">Careers</a></li>
                <li><a href="#" className="hover:underline">Press</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Privacy Policy</a></li>
                <li><a href="#" className="hover:underline">Terms & Conditions</a></li>
                <li><a href="#" className="hover:underline">Cookies Policy</a></li>
                <li><a href="#" className="hover:underline">Security</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3 text-foreground">Connect</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:underline">Contact Us</a></li>
                <li><a href="#" className="hover:underline">Help Center</a></li>
                <li><a href="#" className="hover:underline">LinkedIn</a></li>
                <li><a href="#" className="hover:underline">Twitter</a></li>
              </ul>
            </div>
          </div>

          <Separator className="my-10" />
          <div className="flex flex-col md:flex-row items-center justify-between text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} SkillSync. All rights reserved.</p>
            <div className="flex gap-4 mt-2 md:mt-0">
              <a href="#" className="hover:underline">Privacy</a>
              <a href="#" className="hover:underline">Terms</a>
              <a href="#" className="hover:underline">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
