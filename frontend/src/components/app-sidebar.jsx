"use client";

import * as React from "react";
import {
  Activity,
  Command,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Frame,
  LayoutDashboard,
  FileSignature,
  Rocket,
  Briefcase,
  TrendingUp,
  MessageSquare,
  Presentation,
  BarChart2,
  Newspaper,
  Rss,
  FolderKanban,
  Search,
  Mic,
  Compass,
  Bell,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.
const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/placeholder.svg",
  },
  teams: [
    {
      name: "Acme Inc",
      logo: GalleryVerticalEnd,
      plan: "Enterprise",
    },
    {
      name: "Acme Corp.",
      logo: Activity,
      plan: "Startup",
    },
    {
      name: "Evil Corp.",
      logo: Command,
      plan: "Free",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Proposal",
      url: "/proposal",
      icon: FileSignature,
    },
    {
      title: "Entrepreneur",
      url: "/entrepreneur",
      icon: Rocket, 
    },
    {
      title: "Freelancer",
      url: "/freelancer",
      icon: Briefcase,
    },
    {
      title: "Investor",
      url: "/investor",
      icon: TrendingUp,
    },
    {
      title: "Messages",
      url: "/chat",
      icon: MessageSquare,
    },
    {
      title: "Pitch Deck",
      url: "#",
      icon: Presentation,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: BarChart2,
    },
    {
      title: "My Posts",
      url: "/myposts",
      icon: Newspaper,
    },
    {
      title: "My Projects",
      url: "/myprojects",
      icon: FolderKanban,
    },
    {
      title: "Browse Projects",
      url: "/myprojects",
      icon: Search,
    },
    {
      title: "AI Pitch Practice",
      url: "/pitch-practice",
      icon: Mic,
    },
    {
      title: "Discovery",
      url: "/discovery",
      icon: Compass,
    },
    {
      title: "Notifications",
      url: "/notifications",
      icon: Bell,
    },
  ],
  projects: [
    {
      name: "Design Engineering",
      url: "#",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
};

function getUserRole() {
  try {
    const cuStr = localStorage.getItem("currentUser");
    if (cuStr) {
      const cu = JSON.parse(cuStr);
      if (cu && cu.role) return cu.role;
    }
  } catch {}
  const r = localStorage.getItem("role");
  return r || "entrepreneur";
}

function getUserInfo() {
  try {
    const cuStr = localStorage.getItem("currentUser");
    if (cuStr) {
      const cu = JSON.parse(cuStr);
      if (cu && (cu.name || cu.email)) {
        return {
          name: cu.name || (cu.email ? cu.email.split('@')[0] : 'User'),
          email: cu.email || 'user@example.com',
          avatar: "/placeholder.svg",
        };
      }
    }
  } catch {}
  return null;
}

export function AppSidebar({ user, teams, navMain, projects, onNavigate, ...props }) {
  const runtimeUser = getUserInfo();
  const merged = {
    user: user || runtimeUser || data.user,
    teams: teams || data.teams,
    navMain: navMain || data.navMain,
    projects: projects || data.projects,
  }
  const role = getUserRole();
  const filteredNav = (merged.navMain || []).filter((item) => {
    if ([
      "Dashboard", "Messages", "Analytics", "Pitch Deck",
      "My Posts", "My Projects", "Browse Projects", "My Investments",
      "AI Pitch Practice", "Discovery", "Notifications", "Proposal",
    ].includes(item.title)) return true;
    if (item.title === "Entrepreneur") return role === "entrepreneur";
    if (item.title === "Freelancer") return role === "freelancer";
    if (item.title === "Investor") return role === "investor";
    return false;
  });
  return (
    <Sidebar collapsible="icon" className={`border-none ${role ? `theme-${role}` : ""}`} {...props}>
      <SidebarHeader className="bg-gradient-to-b from-primary/10 to-transparent">
        <TeamSwitcher teams={merged.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} onNavigate={onNavigate} />
        <NavProjects projects={merged.projects} />
      </SidebarContent>
      <SidebarFooter className="">
        <NavUser user={merged.user} onNavigate={onNavigate} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

