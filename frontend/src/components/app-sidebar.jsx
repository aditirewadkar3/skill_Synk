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
      icon: Terminal,
      isActive: true,
    },
    {
      title: "Entrepreneur",
      url: "/entrepreneur",
      icon: Activity,
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
      icon: Bot,
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

export function AppSidebar({ user, teams, navMain, onNavigate, ...props }) {
  const [projects, setProjects] = React.useState([]);
  const runtimeUser = getUserInfo();
  const role = getUserRole();

  React.useEffect(() => {
    if (role === 'entrepreneur') {
      const uid = localStorage.getItem('uid');
      if (uid) {
        fetch(`http://localhost:3001/api/posts/my-projects/${uid}`)
          .then(res => res.json())
          .then(data => {
            if (data.success) {
              setProjects(data.projects.map(p => ({
                name: p.title,
                url: `/myprojects`,
                icon: Frame,
                freelancerCount: p.freelancers?.length || 0
              })));
            }
          })
          .catch(err => console.error("Sidebar projects fetch error:", err));
      }
    }
  }, [role]);

  const merged = {
    user: user || runtimeUser || data.user,
    teams: teams || data.teams,
    navMain: navMain || data.navMain,
    projects: projects.length > 0 ? projects : data.projects,
  }
  const filteredNav = (merged.navMain || []).filter((item) => {
    if (["Dashboard", "Messages", "Analytics", "Pitch Deck", "My Posts", "News"].includes(item.title)) return true;
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

