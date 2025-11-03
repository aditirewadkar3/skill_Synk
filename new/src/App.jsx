import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatPage } from "@/components/chat/ChatPage"
// Optional Dashboard import removed (page not present)
// import Dashboard from "@/pages/dashboard"
import ProfilePage from "@/pages/profile"
import AnalyticsPage from "@/pages/analytics"
import EntrepreneurDashboard from "@/pages/entrepreneur"
import FreelancerDashboard from "@/pages/freelancer"
import InvestorDashboard from "@/pages/investor"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

function App() {
  const [page, setPage] = useState("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState(() => {
    try {
      const saved = window.localStorage.getItem("role")
      return saved || "entrepreneur"
    } catch {
      return "entrepreneur"
    }
  })

  // Handle navigation based on window location
  useEffect(() => {
    const path = window.location.pathname
    if (path === "/signup") {
      setPage("signup")
      setIsAuthenticated(false)
    } else if (path === "/login") {
      setPage("login")
      setIsAuthenticated(false)
    } else if (path === "/dashboard") {
      setIsAuthenticated(true)
      // Map generic dashboard to current role-specific page
      const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
      window.history.replaceState({}, "", target)
      setPage(target.slice(1))
    } else if (path === "/chat") {
      setIsAuthenticated(true)
      setPage("chat")
    } else if (path === "/profile") {
      setIsAuthenticated(true)
      setPage("profile")
    } else if (path === "/analytics") {
      setIsAuthenticated(true)
      setPage("analytics")
    } else if (path === "/entrepreneur") {
      setIsAuthenticated(true)
      setPage("entrepreneur")
      setRole("entrepreneur")
    } else if (path === "/freelancer") {
      setIsAuthenticated(true)
      setPage("freelancer")
      setRole("freelancer")
    } else if (path === "/investor") {
      setIsAuthenticated(true)
      setPage("investor")
      setRole("investor")
    } else if (path === "/" && isAuthenticated) {
      // Redirect authenticated users from root to dashboard
      const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
      window.history.pushState({}, "", target)
      setPage(target.slice(1))
    }
  }, [isAuthenticated, role])

  // Persist role changes
  useEffect(() => {
    try {
      window.localStorage.setItem("role", role)
    } catch {}
  }, [role])

  // Handle login - redirect to dashboard
  const handleLogin = () => {
    setIsAuthenticated(true)
    const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
    setPage(target.slice(1))
    window.history.pushState({}, "", target)
  }

  // Handle signup - redirect to dashboard
  const handleSignup = () => {
    setIsAuthenticated(true)
    const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
    setPage(target.slice(1))
    window.history.pushState({}, "", target)
  }

  // Build sidebar items based on role
  const buildNavForRole = (currentRole) => {
    const roleTitle = currentRole === "freelancer" ? "Freelancer" : currentRole === "investor" ? "Investor" : "Entrepreneur"
    const rolePath = currentRole === "freelancer" ? "/freelancer" : currentRole === "investor" ? "/investor" : "/entrepreneur"
    return [
      { title: `${roleTitle}`, url: rolePath, isActive: true },
      { title: "Messages", url: "/chat" },
      { title: "Analytics", url: "/analytics" },
    ]
  }
  const navForRole = buildNavForRole(role)

  // ---------- LOGIN PAGE ----------
  if (!isAuthenticated && page === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl w-full relative z-10">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  // ---------- SIGNUP PAGE ----------
  if (!isAuthenticated && page === "signup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>
        <div className="max-w-4xl w-full relative z-10">
          <SignupForm onSignup={handleSignup} />
        </div>
      </div>
    )
  }

  // ---------- AUTHENTICATED PAGES (With Sidebar) ----------
  if (isAuthenticated) {
    return (
      <SidebarProvider>
        <AppSidebar navMain={navForRole} />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-lg font-semibold">
                {page === "dashboard"
                  ? "Dashboard"
                  : page === "chat"
                  ? "Chat"
                  : page === "profile"
                  ? "Profile"
                  : page === "analytics"
                  ? "Analytics"
                  : page === "entrepreneur"
                  ? "Entrepreneur Dashboard"
                  : page === "freelancer"
                  ? "Freelancer Dashboard"
                  : page === "investor"
                  ? "Investor Dashboard"
                  : ""}
              </h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden min-h-0">
            {page === "dashboard" && null}
            {page === "chat" && <ChatPage />}
            {page === "profile" && <ProfilePage />}
            {page === "analytics" && <AnalyticsPage />}
            {page === "entrepreneur" && <EntrepreneurDashboard />}
            {page === "freelancer" && <FreelancerDashboard />}
            {page === "investor" && <InvestorDashboard />}
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}

export default App
