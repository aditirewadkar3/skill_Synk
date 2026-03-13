"use client";

import * as React from "react";
import {
  Activity,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  Terminal,
  Newspaper,
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
      icon: <lord-icon
    src="https://cdn.lordicon.com/bushiqea.json"
    trigger="hover"
    style="width:10px;height:10px">
</lord-icon>,
      isActive: true,
    },
    {
      title: "Proposal",
      url: "/proposal",
      icon: <lord-icon
    src="https://cdn.lordicon.com/bushiqea.json"
    trigger="hover"
    style="width:10px;height:10px">
</lord-icon>,
      isActive: true,
    },
    {
      title: "News",
      url: "/news",
      icon: Newspaper,
    },
    {
      title: "Entrepreneur",
      url: "/entrepreneur",
      icon: <lord-icon
    src="https://cdn.lordicon.com/bushiqea.json"
    trigger="hover"
    style="width:10px;height:10px">
</lord-icon>,
    },
    {
      title: "Freelancer",
      url: "/freelancer",
      icon: Frame,
    },
    {
      title: "Investor",
      url: "/investor",
      icon: BookOpen,
    },
    {
      title: "Messages",
      url: "/chat",
      icon: <lord-icon
    src="https://cdn.lordicon.com/bushiqea.json"
    trigger="hover"
    style="width:10px;height:10px">
</lord-icon>,
    },
    {
      title: "Pitch Deck",
      url: "#",
      icon: Settings2,
    },
    {
      title: "Analytics",
      url: "/analytics",
      icon: Frame,
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
<<<<<<< HEAD
    if (["Dashboard", "Messages", "Analytics", "Pitch Deck", "My Posts", "News", "My Projects", "Browse Projects"].includes(item.title)) return true;
=======
    if (["Dashboard", "Messages", "Analytics", "Pitch Deck", "My Posts", "News", "AI Pitch Practice"].includes(item.title)) return true;
>>>>>>> 5c230f0fe84e999b54f1870a0624c424036a44c2
    if (item.title === "Entrepreneur") return role === "entrepreneur";
    if (item.title === "Freelancer") return role === "freelancer";
    if (item.title === "Investor") return role === "investor";
    return false;
  });
  return (
    <Sidebar collapsible="icon" className={`premium-card border-none ${role ? `theme-${role}` : ""}`} {...props}>
      <SidebarHeader className="bg-gradient-to-b from-primary/10 to-transparent">
        <TeamSwitcher teams={merged.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} onNavigate={onNavigate} />
        <NavProjects projects={merged.projects} />
      </SidebarContent>
      <SidebarFooter className="border-t border-white/5">
        <NavUser user={merged.user} onNavigate={onNavigate} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

