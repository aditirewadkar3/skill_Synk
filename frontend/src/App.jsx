import { useState, useEffect } from "react"
import { LoginForm } from "@/components/login-form"
import { SignupForm } from "@/components/signup-form"
import { ThemeToggle } from "@/components/theme-toggle"
import { io } from "socket.io-client"
import { ChatPage } from "@/components/chat/ChatPage"
import ProfilePage from "@/pages/profile"
import ClientProfilePage from "@/pages/client-profile"
import FreelancerAnalytics from "@/pages/freelanceranalytics"
import InvestorAnalytics from "@/pages/investoranalytics"
import EntrepreneurAnalytics from "@/pages/Entrepreneuranalytics"
import EntrepreneurDashboard from "@/pages/entrepreneur"
import FreelancerDashboard from "@/pages/freelancer"
import InvestorDashboard from "@/pages/investor"
import MyPostsPage from "@/pages/myposts"
import MyProjectsPage from "@/pages/my-projects"
import ProjectApplicationsPage from "@/pages/project-applications.jsx"
import Landing from "@/pages/landing"
import MeetingPage from "@/pages/meeting"
import NotificationsPage from "@/pages/notifications"
import ProposalPage from "@/pages/proposal"
import NewsPage from "@/pages/news"
import PitchPractice from "@/pages/PitchPractice"
import DiscoveryPage from "@/pages/discovery"
import PostForm from "@/components/posts/PostForm"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import {
  LayoutDashboard, MessageSquare, Compass, BarChart2,
  Newspaper, Rss, FolderKanban, Mic, Search,
  Briefcase, Bell, TrendingUp, Rocket,
} from "lucide-react"
import { NotificationPopover } from "@/components/NotificationPopover"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { auth } from "@/config/firebase"
import { onIdTokenChanged } from "firebase/auth"
import { setAuthToken, setCurrentUser, getAuthToken } from "@/services/api"

const SOCKET_URL = "http://localhost:3001"

function App() {
  const [page, setPage] = useState("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(false)
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [navHistory, setNavHistory] = useState([])

  // Sync Firebase Auth state with local storage
  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken()
          setAuthToken(token)
          if (!localStorage.getItem('uid')) {
            localStorage.setItem('uid', user.uid)
          }
          setIsAuthenticated(true)
        } catch (error) {
          console.error("Error updating ID token:", error)
        }
      } else {
        setAuthToken(null)
      }
      setIsAuthReady(true)
    })
    return () => unsubscribe()
  }, [])

  // Manage Global Socket Connection
  useEffect(() => {
    if (!isAuthenticated || !isAuthReady) {
      if (socket) {
        socket.disconnect()
        setSocket(null)
      }
      return
    }

    const token = getAuthToken()
    if (!token) return

    const newSocket = io(SOCKET_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    newSocket.on('connect', () => {
      console.log('Global Socket connected')
    })

    newSocket.on('notification', (data) => {
      console.log('Real-time notification received:', data)
      window.dispatchEvent(new CustomEvent('app:notification', { detail: data }))
    })

    setSocket(newSocket)
    window.socket = newSocket

    return () => {
      newSocket.disconnect()
      window.socket = null
    }
  }, [isAuthenticated, isAuthReady])

  // Re-connect socket on token refresh
  useEffect(() => {
    const onRefreshed = (e) => {
      const newToken = e?.detail?.token
      if (!newToken || !socket) return
      socket.auth.token = newToken
      socket.disconnect().connect()
    }
    window.addEventListener('auth:token-refreshed', onRefreshed)
    return () => window.removeEventListener('auth:token-refreshed', onRefreshed)
  }, [socket])

  // Handle navigation based on window location
  useEffect(() => {
    const path = window.location.pathname
    if (path === "/signup") {
      if (!isAuthenticated) setPage("signup")
    } else if (path === "/login") {
      if (!isAuthenticated) setPage("login")
    } else if (path === "/") {
      if (!isAuthenticated) setPage("landing")
    } else if (path === "/dashboard") {
      if (isAuthenticated && role) {
        const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
        window.history.replaceState({}, "", target)
        setPage(target.slice(1))
      }
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
      setIsAuthenticated(true)
      setPage("entrepreneuranalytics")
    } else if (path === "/myposts") {
      setIsAuthenticated(true)
      setPage("myposts")

    } else if (path === "/notifications") {
      setIsAuthenticated(true)
      setPage("notifications")
    } else if (path === "/proposal") {
      setIsAuthenticated(true)
      setPage("proposal")
    } else if (path === "/news") {
      setIsAuthenticated(true)
      setPage("news")
    } else if (path === "/pitch-practice") {
      setIsAuthenticated(true)
      setPage("pitch-practice")
    } else if (path === "/myprojects") {
      setIsAuthenticated(true)
      setPage("myprojects")
    } else if (path === "/discovery") {
      setIsAuthenticated(true)
      setPage("discovery")
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
      const target = role === "freelancer" ? "/freelancer" : role === "investor" ? "/investor" : "/entrepreneur"
      window.history.pushState({}, "", target)
      setPage(target.slice(1))
    }
  }, [isAuthenticated, role])

  // Persist role changes
  useEffect(() => {
    try {
      if (role) window.localStorage.setItem("role", role)
    } catch { }
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
      } catch { }
      finally { setRoleLoading(false) }
    }
    if (isAuthenticated) {
      fetchRole()
    }
  }, [isAuthenticated])

  // Optimistic route after signup using pendingRole hint
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
    } catch { }
  }, [isAuthenticated, role])

  // Clear pendingRole once real role is loaded
  useEffect(() => {
    if (role) {
      try { sessionStorage.removeItem('pendingRole') } catch { }
    }
  }, [role])

  // Listen to history/navigation events
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
        setPage("myposts")
      } else if (path === "/proposal") {
        setIsAuthenticated(true)
        setPage("proposal")
      } else if (path === '/news') {
        setIsAuthenticated(true)
        setPage('news')
      } else if (path === '/discovery') {
        setIsAuthenticated(true)
        setPage('discovery')
      } else if (path.startsWith('/meeting/')) {
        setIsAuthenticated(true)
        setPage('meeting')
      } else if (path === '/notifications') {
        setIsAuthenticated(true)
        setPage('notifications')
      } else if (path === '/pitch-practice') {
        setIsAuthenticated(true)
        setPage('pitch-practice')
      } else if (path === '/myprojects') {
        setIsAuthenticated(true)
        setPage('myprojects')
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
    const protectedPages = [
      "meeting", "chat", "profile", "client-profile",
      "freelanceranalytics", "investoranalytics", "entrepreneuranalytics",
      "myposts", "myprojects", "notifications", "proposal", "news", "discovery", "pitch-practice"
    ]
    if (page !== target && !protectedPages.includes(page)) {
      setPage(target)
      window.history.pushState({}, "", `/${target}`)
    }
  }, [role, isAuthenticated])

  const handleLogin = () => { setIsAuthenticated(true) }
  const handleSignup = () => { setIsAuthenticated(true) }

  // Build sidebar nav based on role
  const buildNavForRole = (currentRole) => {
    const roleTitle = currentRole === "freelancer" ? "Freelancer" : currentRole === "investor" ? "Investor" : "Entrepreneur"
    const rolePath = currentRole === "freelancer" ? "/freelancer" : currentRole === "investor" ? "/investor" : "/entrepreneur"
    const roleIcon = currentRole === "freelancer" ? Briefcase : currentRole === "investor" ? TrendingUp : Rocket
    const analyticsPath = currentRole === "freelancer" ? "/freelanceranalytics" : currentRole === "investor" ? "/investoranalytics" : "/entrepreneuranalytics"
    return [
      { title: roleTitle, icon: roleIcon, url: rolePath, isActive: true },
      { title: "Messages", icon: MessageSquare, url: "/chat" },
      { title: "Discovery", icon: Compass, url: "/discovery" },
      { title: "Analytics", icon: BarChart2, url: analyticsPath },
      { title: "My Posts", icon: Newspaper, url: "/myposts" },
      ...(currentRole === 'entrepreneur' ? [
        { title: "My Projects", icon: FolderKanban, url: "/myprojects" },
        { title: "Project Applications", icon: Bell, url: "/project-applications" }
      ] : []),
      ...(currentRole === 'freelancer' || currentRole === 'investor' ? [
        { title: "Browse Projects", icon: Search, url: "/myprojects" },
        { title: "Notifications", icon: Bell, url: "/notifications" }
      ] : []),
    ]
  }
  const navForRole = buildNavForRole(role)

  // ── Landing ─────────────────────────────────────────────────────────────
  if (!isAuthenticated && page === "landing") {
    return <Landing />
  }

  // ── Login ────────────────────────────────────────────────────────────────
  if (!isAuthenticated && page === "login") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
        <div className="max-w-4xl w-full relative z-10">
          <LoginForm onLogin={handleLogin} />
        </div>
      </div>
    )
  }

  // ── Signup ───────────────────────────────────────────────────────────────
  if (!isAuthenticated && page === "signup") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm relative">
        <div className="absolute top-4 right-4 z-10"><ThemeToggle /></div>
        <div className="max-w-4xl w-full relative z-10">
          <SignupForm onSignup={handleSignup} />
        </div>
      </div>
    )
  }

  // ── Authenticated ────────────────────────────────────────────────────────
  if (isAuthenticated) {
    if (page === "meeting") return <MeetingPage />

    const pageTitle = {
      dashboard: "Dashboard",
      chat: "Chat",
      profile: "Profile",
      "client-profile": "Client Profile",
      entrepreneuranalytics: "Entrepreneur Analytics",
      freelanceranalytics: "Freelancer Analytics",
      investoranalytics: "Investor Analytics",
      entrepreneur: "Entrepreneur Dashboard",
      freelancer: "Freelancer Dashboard",
      investor: "Investor Dashboard",
      notifications: "Notifications",
      proposal: "Send Proposal",
      news: "Ecosystem News",
      discovery: "Discovery Hub",
    }

    const themeClass = role ? `theme-${role}` : ""

    return (
      <div className={`h-full w-full ${themeClass}`}>
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
              } catch { }
              setIsAuthenticated(false)
              setPage('login')
              window.history.pushState({}, '', '/login')
              return
            }
            const pageName = path.replace(/^\//, '')
            setNavHistory((prev) => {
              const next = [...prev.filter(p => p !== pageName), page]
              return next.slice(-5)
            })
            setPage(pageName)
            window.history.pushState({}, '', path)
          }} />
          <SidebarInset>
            <header className="flex h-16 shrink-0 border rounded-t-[1rem] mx-2 mt-2 items-center gap-2 px-4 bg-background">
              <SidebarTrigger />
              <div className="flex-1 min-w-0">
                {(() => {
                  const PAGE_TITLES = {
                    dashboard: "Dashboard", chat: "Chat", profile: "Profile",
                    "client-profile": "Client Profile",
                    entrepreneuranalytics: "Entrepreneur Analytics",
                    freelanceranalytics: "Freelancer Analytics",
                    investoranalytics: "Investor Analytics",
                    entrepreneur: "Entrepreneur Dashboard",
                    freelancer: "Freelancer Dashboard",
                    investor: "Investor Dashboard",
                    notifications: "Notifications",
                    proposal: "Send Proposal",
                    news: "Ecosystem News",
                    myprojects: "My Projects",
                    myposts: "My Posts",
                    "project-applications": "Project Applications",
                    "pitch-practice": "AI Pitch Practice",
                    discovery: "Discovery Hub",
                  }
                  const homePage = role === "freelancer" ? "freelancer" : role === "investor" ? "investor" : "entrepreneur"
                  const homeTitle = PAGE_TITLES[homePage]
                  const currentTitle = PAGE_TITLES[page] || page
                  const isHome = page === homePage
                  return (
                    <Breadcrumb>
                      <BreadcrumbList>
                        {!isHome && (
                          <>
                            <BreadcrumbItem>
                              <BreadcrumbLink
                                className="cursor-pointer text-muted-foreground hover:text-foreground text-sm"
                                onClick={(e) => {
                                  e.preventDefault()
                                  setNavHistory([])
                                  setPage(homePage)
                                  window.history.pushState({}, '', `/${homePage}`)
                                }}
                              >
                                {homeTitle}
                              </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                          </>
                        )}
                        <BreadcrumbItem>
                          <BreadcrumbPage className="font-semibold text-foreground text-sm">
                            {currentTitle}
                          </BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  )
                })()}
              </div>
                <div className="flex items-center gap-4">
                {role === "entrepreneur" && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative hover:bg-primary/10 rounded-full"
                    onClick={() => {
                      setPage("project-applications");
                      window.history.pushState({}, '', "/project-applications");
                    }}
                  >
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border-2 border-background" />
                  </Button>
                )}
                {(page === "entrepreneur" || page === "myposts") && (
                  <Sheet open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
                    {/* <SheetTrigger asChild>
                      <Button variant="premium" size="sm" className="gap-2">
                        <Rocket className="h-4 w-4" /> New Post
                      </Button>
                    </SheetTrigger> */}
                    <SheetContent side="right" className="w-[400px] sm:w-[540px]">
                      <SheetHeader>
                        <SheetTitle>Create a New Post</SheetTitle>
                      </SheetHeader>
                      <div className="py-6">
                        <PostForm onClose={() => setIsPostModalOpen(false)} onSuccess={() => {
                          setIsPostModalOpen(false);
                          window.dispatchEvent(new CustomEvent('app:post-created'));
                        }} />
                      </div>
                    </SheetContent>
                  </Sheet>
                )}
                <NotificationPopover />
                <ThemeToggle />
              </div>
            </header>
            <main className="flex-1 border bg-background shadow-sm mx-2 mb-2 overflow-hidden min-h-0">
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
              {page === "investor" && <InvestorDashboard />}
              {page === "myposts" && <MyPostsPage />}
              {page === "myprojects" && <MyProjectsPage />}
              {page === "notifications" && <NotificationsPage />}
              {page === "proposal" && <ProposalPage />}
              {page === "news" && <NewsPage />}
              {page === "project-applications" && <ProjectApplicationsPage />}
              {page === "discovery" && <DiscoveryPage />}
              {page === "pitch-practice" && <PitchPractice />}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    )
  }

  return null
}

export default App
