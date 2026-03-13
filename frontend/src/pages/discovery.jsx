import React, { useState, useEffect } from "react";
import {
  Search,
  MessageSquare,
  DollarSign,
  Star,
  Briefcase,
  Zap,
  Loader2,
  SlidersHorizontal,
  X,
  Users,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { chatAPI, postsAPI } from "@/services/api";

export default function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [talentList, setTalentList] = useState([]);
  const [projectList, setProjectList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [users, posts] = await Promise.all([
          chatAPI.getUsers(),
          postsAPI.getAll(),
        ]);

        if (!users || !Array.isArray(users)) {
          throw new Error("Invalid users data received from server.");
        }

        // Only real freelancer profiles — no synthetic fallback data
        const freelancers = users
          .filter((u) => (u.role || "").toLowerCase().trim() === "freelancer")
          .map((u) => ({
            id: u.id,
            name: u.name || "Anonymous User",
            skills: Array.isArray(u.skills) ? u.skills : [],
            rating: u.rating || null,
            rate: u.rate || null,
            avatar: u.avatar || null,
            bio: u.bio || "",
          }));

        const projects = (posts || []).map((p) => ({
          id: p.id,
          title: p.title || "Untitled Project",
          category: (p.role || "").toLowerCase() === "investor" ? "Investment" : "Startup",
          description: p.summary || p.description || "",
          raised: p.likes?.length ? `$${p.likes.length * 10}k` : "$0",
          fundingGoal: "$100k – $500k",
          progress: Math.min(100, (p.likes?.length || 0) * 15),
          tags: [p.role, "Innovation"].filter(Boolean),
        }));

        setTalentList(freelancers);
        setProjectList(projects);
      } catch (err) {
        console.error("Discovery Page Error:", err);
        setError(err.message || "Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Derive unique skills from all real freelancer data
  const allSkills = Array.from(
    new Set(talentList.flatMap((t) => t.skills))
  ).sort();

  // Filter talent by search query AND selected skill
  const filteredTalent = talentList.filter((t) => {
    const matchSearch =
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchSkill =
      selectedSkill === "All" || t.skills.includes(selectedSkill);
    return matchSearch && matchSkill;
  });

  // Filter projects by search query only (separate from talent filters)
  const filteredProjects = projectList.filter(
    (p) =>
      (p.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSynk = (userId) => {
    window.history.pushState({}, "", `/chat?with=${userId}`);
    window.dispatchEvent(new Event("app:navigate"));
  };

  const handleBackProject = (projectId) => {
    window.history.pushState({}, "", `/proposal?project=${projectId}`);
    window.dispatchEvent(new Event("app:navigate"));
  };

  const handleViewProfile = (userId) => {
    window.history.pushState({}, "", `/client-profile?uid=${userId}`);
    window.dispatchEvent(new Event("app:navigate"));
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-primary/10 animate-pulse" />
          <Loader2 className="h-8 w-8 animate-spin text-primary absolute inset-0 m-auto" />
        </div>
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          Scanning the ecosystem…
        </p>
      </div>
    );
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-5">
        <div className="p-4 rounded-full bg-destructive/10 text-destructive">
          <Zap className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Connection Issue</h3>
          <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
        </div>
        <Button onClick={() => window.location.reload()} variant="outline" size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Page Header ── */}
      <div className="px-6 pt-6 pb-4 border-b bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Discovery Hub</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {talentList.length} verified freelancers · {projectList.length} active projects
            </p>
          </div>
          {/* Search bar */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or skill…"
                className="pl-9 h-9 bg-muted/50 border-muted focus-visible:ring-primary/30"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="talent" className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4">
          <TabsList className="grid grid-cols-2 w-full max-w-sm">
            <TabsTrigger value="talent" className="flex items-center gap-2 text-xs">
              <Users className="h-3.5 w-3.5" />
              Talent Marketplace
            </TabsTrigger>
            <TabsTrigger value="funding" className="flex items-center gap-2 text-xs">
              <TrendingUp className="h-3.5 w-3.5" />
              Project Funding
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ════════════ TALENT TAB ════════════ */}
        <TabsContent value="talent" className="flex-1 flex flex-col overflow-hidden mt-0 outline-none">

          {/* Skills & Focus Filter Bar */}
          {allSkills.length > 0 && (
            <div className="px-6 py-3 border-b bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Skills & Focus
                </span>
                {selectedSkill !== "All" && (
                  <button
                    onClick={() => setSelectedSkill("All")}
                    className="ml-auto flex items-center gap-1 text-[10px] text-primary font-medium hover:underline"
                  >
                    <X className="h-3 w-3" /> Clear
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge
                  onClick={() => setSelectedSkill("All")}
                  className={`cursor-pointer rounded-full px-3 py-0.5 text-[11px] font-medium transition-all select-none ${
                    selectedSkill === "All"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  All
                </Badge>
                {allSkills.map((skill) => (
                  <Badge
                    key={skill}
                    onClick={() =>
                      setSelectedSkill(selectedSkill === skill ? "All" : skill)
                    }
                    className={`cursor-pointer rounded-full px-3 py-0.5 text-[11px] font-medium transition-all select-none ${
                      selectedSkill === skill
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-background border hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Talent Grid */}
          <ScrollArea className="flex-1 px-6 pt-4">
            {filteredTalent.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
                {filteredTalent.map((talent) => (
                  <Card
                    key={talent.id}
                    className="group flex flex-col overflow-hidden border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Card Header */}
                    <CardHeader className="flex flex-row items-start gap-3 p-4 pb-3">
                      <Avatar
                        className="h-12 w-12 shrink-0 border-2 border-border cursor-pointer group-hover:border-primary/40 transition-colors"
                        onClick={() => handleViewProfile(talent.id)}
                      >
                        <AvatarImage src={talent.avatar} alt={talent.name} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                          {talent.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle
                          className="text-base font-semibold truncate cursor-pointer hover:text-primary transition-colors"
                          onClick={() => handleViewProfile(talent.id)}
                        >
                          {talent.name}
                        </CardTitle>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-primary/60 mt-0.5">
                          Verified Freelancer
                        </p>
                        {/* Rating & Rate inline */}
                        {(talent.rating || talent.rate) && (
                          <div className="flex items-center gap-2 mt-1">
                            {talent.rating && (
                              <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-500">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {talent.rating}
                              </span>
                            )}
                            {talent.rating && talent.rate && (
                              <span className="text-muted-foreground/40 text-xs">·</span>
                            )}
                            {talent.rate && (
                              <span className="text-xs text-muted-foreground">{talent.rate}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    {/* Bio */}
                    <CardContent className="px-4 pt-0 pb-3 flex-1">
                      {talent.bio ? (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                          {talent.bio}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground/40 italic">
                          No bio provided
                        </p>
                      )}

                      {/* Skills & Focus Section */}
                      {talent.skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/50 mb-1.5">
                            Skills & Focus
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {talent.skills.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedSkill(
                                    selectedSkill === skill ? "All" : skill
                                  );
                                }}
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium cursor-pointer border transition-all ${
                                  selectedSkill === skill
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-primary/5 text-primary/80 border-primary/10 hover:bg-primary/15 hover:border-primary/25"
                                }`}
                              >
                                {skill}
                              </span>
                            ))}
                            {talent.skills.length > 4 && (
                              <span className="text-[10px] text-muted-foreground/50 self-center pl-0.5">
                                +{talent.skills.length - 4} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {talent.skills.length === 0 && (
                        <p className="text-[10px] text-muted-foreground/40 mt-3 italic">
                          No skills listed yet
                        </p>
                      )}
                    </CardContent>

                    <Separator className="opacity-50" />

                    {/* Footer */}
                    <CardFooter className="flex justify-between items-center p-3 gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3 text-muted-foreground hover:text-primary"
                        onClick={() => handleViewProfile(talent.id)}
                      >
                        View Profile
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 px-4 text-xs gap-1.5 font-semibold"
                        onClick={() => handleSynk(talent.id)}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        Synk
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-muted/60 mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No freelancers found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try adjusting your search or clearing the skill filter
                </p>
                {selectedSkill !== "All" && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-4 h-8 text-xs"
                    onClick={() => setSelectedSkill("All")}
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {/* ════════════ FUNDING TAB ════════════ */}
        <TabsContent value="funding" className="flex-1 overflow-hidden mt-0 outline-none">
          <ScrollArea className="h-full px-6 pt-4">
            {filteredProjects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 pb-8">
                {filteredProjects.map((project) => (
                  <Card
                    key={project.id}
                    className="group flex flex-col overflow-hidden border border-border/60 bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-200"
                  >
                    <CardHeader className="p-4 pb-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge
                          variant="outline"
                          className={`text-[10px] uppercase tracking-wider font-semibold px-2.5 py-0.5 ${
                            project.category === "Investment"
                              ? "border-emerald-500/30 text-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/30"
                              : "border-blue-500/30 text-blue-600 bg-blue-50/50 dark:bg-blue-950/30"
                          }`}
                        >
                          {project.category}
                        </Badge>
                        <Zap className="h-4 w-4 text-primary opacity-60" />
                      </div>
                      <CardTitle className="text-base font-semibold line-clamp-1">
                        {project.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {project.description || "No description provided."}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="px-4 pt-0 pb-3 flex-1">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Raised: <span className="font-semibold text-foreground">{project.raised}</span></span>
                          <span>Goal: {project.fundingGoal}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${project.progress}%` }}
                          />
                        </div>
                        <p className="text-right text-[10px] text-muted-foreground font-medium">
                          {project.progress}% funded
                        </p>
                      </div>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {project.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-secondary text-secondary-foreground border border-border/40"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </CardContent>

                    <Separator className="opacity-50" />

                    <CardFooter className="p-3">
                      <Button
                        className="w-full h-8 text-xs gap-2 font-semibold"
                        onClick={() => handleBackProject(project.id)}
                      >
                        <DollarSign className="h-3.5 w-3.5" />
                        Back this project
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="p-4 rounded-full bg-muted/60 mb-4">
                  <DollarSign className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">No projects found</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Try adjusting your search query
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
