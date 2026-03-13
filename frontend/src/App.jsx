import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { ChatPage } from "@/components/chat/ChatPage"
// Optional Dashboard import removed (page not present)
// import Dashboard from "@/pages/dashboard"
import ProfilePage from "@/pages/profile"
import ClientProfilePage from "@/pages/client-profile"
import FreelancerAnalytics from "@/pages/freelanceranalytics"
import InvestorAnalytics from "@/pages/investoranalytics"
import EntrepreneurAnalytics from "@/pages/Entrepreneuranalytics"
import EntrepreneurDashboard from "@/pages/entrepreneur"
import FreelancerDashboard from "@/pages/freelancer"
import InvestorDashboard from "@/pages/investor"
import MyPostsPage from "@/pages/myposts"
import Landing from "@/pages/landing"
import MeetingPage from "@/pages/meeting"
<<<<<<< HEAD
import ProposalPage from "@/pages/proposal"
=======
import NewsPage from "@/pages/news"
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { PieChart } from "lucide-react"
import { auth } from "@/config/firebase"
import { onIdTokenChanged } from "firebase/auth"
import { setAuthToken, setCurrentUser } from "@/services/api"

function App() {
  const [page, setPage] = useState("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)

  // Sync Firebase Auth state with local storage
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          setAuthToken(token)
          // Also sync uid to localStorage if missing
          if (!localStorage.getItem('uid')) {
            localStorage.setItem('uid', user.uid)
          }
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Error updating ID token:", error)
        }
      } else {
        // Only clear if we explicitly logged out or session is truly gone
        // Keep isAuthenticated as false if no user
        setAuthToken(null)
      }
      setIsAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  // Handle navigation based on window location
  useEffect(() => {
    const path = window.location.pathname
    if (path === "/signup") {
      setPage("signup")
      setIsAuthenticated(false)
    } else if (path === "/login") {
      setPage("login")
      setIsAuthenticated(false)
    } else if (path === "/") {
      // Landing page for unauthenticated users
      setIsAuthenticated(false)
      setPage("landing")
    } else if (path === "/dashboard") {
      setIsAuthenticated(true)
      // Map generic dashboard to current role-specific page
      const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
      window.history.replaceState({}, "", target)
      setPage(target.slice(1))
    } else if (path === "/chat") {
      setIsAuthenticated(true)
      setPage("chat")
    } else if (path.startsWith("/meeting/")) {
      setIsAuthenticated(true)
      setPage("meeting")
    } else if (path === "/profile") {
      setIsAuthenticated(true)
      setPage("profile")
    } else if (path === "/client-profile") {
      setIsAuthenticated(true)
      setPage("client-profile")
    } else if (path === "/freelanceranalytics") {
      setIsAuthenticated(true)
      setPage("freelanceranalytics")
    } else if (path === "/investoranalytics") {
      setIsAuthenticated(true)
      setPage("investoranalytics")
    } else if (path === "/entrepreneuranalytics") {
      setIsAuthenticated(true)
      setPage("entrepreneuranalytics")
    } else if (path === "/analytics") {
      // Back-compat: route old analytics path to entrepreneur analytics
      setIsAuthenticated(true)
      setPage("entrepreneuranalytics")
    } else if (path === "/myposts") {
      setIsAuthenticated(true)
      setPage("myposts")
<<<<<<< HEAD
    } else if (path === "/proposal") {
      setIsAuthenticated(true)
      setPage("proposal")
=======
    } else if (path === "/news") {
      setIsAuthenticated(true)
      setPage("news")
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
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

  // Persist role changes (DB remains source of truth)
  useEffect(() => {
    try {
      if (role) window.localStorage.setItem("role", role)
    } catch {}
  }, [role])

  // Fetch role from backend (Firestore) once authenticated
  useEffect(() => {
    const fetchRole = async () => {
      try {
        setRoleLoading(true)
        const uid = window.localStorage.getItem("uid")
        if (!uid) return
        const res = await fetch("http://localhost:3001/api/auth/get-user", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid })
        })
        if (!res.ok) return
        const data = await res.json()
        const fetchedRole = data?.user?.role
        if (fetchedRole) setRole(fetchedRole)
      } catch {}
      finally { setRoleLoading(false) }
    }
    if (isAuthenticated) {
      fetchRole()
    }
  }, [isAuthenticated])

  // Optimistic route after signup using pendingRole hint, while DB role loads
  useEffect(() => {
    if (!isAuthenticated || role) return
    try {
      const pending = sessionStorage.getItem('pendingRole')
      if (pending === 'freelancer' || pending === 'investor' || pending === 'entrepreneur') {
        const target = `/${pending}`
        if (window.location.pathname !== target) {
          setPage(pending)
          window.history.pushState({}, '', target)
        }
      }
    } catch {}
  }, [isAuthenticated, role])

  // Clear pendingRole once real role is loaded
  useEffect(() => {
    if (role) {
      try { sessionStorage.removeItem('pendingRole') } catch {}
    }
  }, [role])

  // Listen to history/navigation events to handle in-app link navigation
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname
      if (path === '/client-profile') {
        setIsAuthenticated(true)
        setPage('client-profile')
      } else if (path === '/chat') {
        setIsAuthenticated(true)
        setPage('chat')
      } else if (path === "/myposts") {
        setIsAuthenticated(true)
<<<<<<< HEAD
        setPage("myposts")
      } else if (path === "/proposal") {
        setIsAuthenticated(true)
        setPage("proposal")
=======
        setPage('myposts')
      } else if (path === '/news') {
        setIsAuthenticated(true)
        setPage('news')
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
      } else if (path.startsWith('/meeting/')) {
        setIsAuthenticated(true)
        setPage('meeting')
      }
    }
    window.addEventListener('popstate', handleLocation)
    window.addEventListener('app:navigate', handleLocation)
    return () => {
      window.removeEventListener('popstate', handleLocation)
      window.removeEventListener('app:navigate', handleLocation)
    }
  }, [])

  // When role changes while authenticated, route to its dashboard
  useEffect(() => {
    if (!isAuthenticated || !role) return
    const target = role === "freelancer" ? 
      "freelancer" : role === "investor" ? "investor" : "entrepreneur"
    // List of pages that should NOT be auto-redirected to the dashboard
<<<<<<< HEAD
    const protectedPages = ["meeting", "chat", "profile", "client-profile", "freelanceranalytics", "investoranalytics", "entrepreneuranalytics", "myposts", "proposal"]
=======
    const protectedPages = ["meeting", "chat", "profile", "client-profile", "freelanceranalytics", "investoranalytics", "entrepreneuranalytics", "myposts", "news"]
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
    if (page !== target && !protectedPages.includes(page)) {
      setPage(target)
      window.history.pushState({}, "", `/${target}`)
    }
  }, [role, isAuthenticated])

  // Handle login - wait for role fetch to route
  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  // Handle signup - wait for role fetch to route
  const handleSignup = () => {
    setIsAuthenticated(true)
  }

  // Build sidebar items based on role
  const buildNavForRole = (currentRole) => {
    const roleTitle = currentRole === "freelancer" ? "Freelancer" : currentRole === "investor" ? "Investor" : "Entrepreneur"
    const rolePath = currentRole === "freelancer" ? "/freelancer" : currentRole === "investor" ? "/investor" : "/entrepreneur"
    const analyticsPath = currentRole === "freelancer" ? "/freelanceranalytics" : currentRole === "investor" ? "/investoranalytics" : "/entrepreneuranalytics"
    return [
      { title: `${roleTitle}`, icon: PieChart, url: rolePath, isActive: true },
      { title: "Messages", icon: PieChart , url: "/chat" },
      { title: "Analytics", icon: PieChart, url: analyticsPath },
      { title: "My Posts", url: "/myposts" },
      { title: "News", url: "/news" },
    ]
  }
  const navForRole = buildNavForRole(role)

  // ---------- LOGIN PAGE ----------
  if (!isAuthenticated && page === "landing") {
    return (
      <Landing />
    )
  }

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
    if (page === "meeting") {
      return <MeetingPage />
    }
    return (
      <SidebarProvider>
        <AppSidebar navMain={navForRole} onNavigate={(path) => {
          // Normalize common aliases
          if (path === '/account') path = '/profile'
          if (path === '/dashboard') {
            const roleTarget = role === 'freelancer' ? '/freelancer' : (role === 'investor' ? '/investor' : '/entrepreneur')
            path = roleTarget
          }
          if (path === '/login') {
            // Logout: clear auth and route to login
            try {
              window.localStorage.removeItem('uid')
              sessionStorage.removeItem('pendingRole')
            } catch {}
            setIsAuthenticated(false)
            setPage('login')
            window.history.pushState({}, '', '/login')
            return
          }
          const pageName = path.replace(/^\//, '')
          setPage(pageName)
          window.history.pushState({}, '', path)
        }} />
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
                  : page === "client-profile"
                  ? "Client Profile"
                  : page === "entrepreneuranalytics"
                  ? "Entrepreneur Analytics"
                  : page === "freelanceranalytics"
                  ? "Freelancer Analytics"
                  : page === "investoranalytics"
                  ? "Investor Analytics"
                  : page === "entrepreneur"
                  ? "Entrepreneur Dashboard"
                  : page === "freelancer"
                  ? "Freelancer Dashboard"
                  : page === "investor"
                  ? "Investor Dashboard"
<<<<<<< HEAD
                  : page === "proposal"
                  ? "Send Proposal"
=======
                  : page === "news"
                  ? "Ecosystem News"
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
                  : ""}
              </h1>
            </div>
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-hidden min-h-0">
            {page === "dashboard" && (
              role === 'freelancer' ? <FreelancerDashboard /> :
              role === 'investor' ? <InvestorDashboard /> :
              <EntrepreneurDashboard />
            )}
            {page === "chat" && <ChatPage />}
            {page === "profile" && <ProfilePage />}
            {page === "client-profile" && <ClientProfilePage />}
            {page === "entrepreneuranalytics" && <EntrepreneurAnalytics />}
            {page === "freelanceranalytics" && <FreelancerAnalytics />}
            {page === "investoranalytics" && <InvestorAnalytics />}
            {page === "entrepreneur" && <EntrepreneurDashboard />}
            {page === "freelancer" && <FreelancerDashboard />}
<<<<<<< HEAD
            {page === "investor" && <InvestorDashboard />}
            {page === "myposts" && <MyPostsPage />}
            {page === "proposal" && <ProposalPage />}
=======
            { page === "investor" && <InvestorDashboard />}
            { page === "myposts" && <MyPostsPage />}
            { page === "news" && <NewsPage />}
>>>>>>> 1a05c955d01909ac63f1b27d6c408ee86b2dfb27
          </main>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return null
}

export default App
