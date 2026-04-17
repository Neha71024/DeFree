import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import GigCard from "@/components/GigCard";
import { GigCardSkeleton } from "@/components/LoadingStates";
import { useDebounce } from "@/hooks/useDebounce";
import { useToast } from "@/hooks/use-toast";
import { useAuthState } from "@/hooks/useAuth";
import {
  Search,
  Filter,
  Plus,
  Grid,
  List,
  TrendingUp,
  Star,
  DollarSign,
  Briefcase
} from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
    },
  }),
};

const FreelancePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthState();
  const isClient = user?.role === "client";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState(isClient ? "available" : "posted");

  const [loading, setLoading] = useState(false);
  const [gigs, setGigs] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [savedGigsIds, setSavedGigsIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  const categories = [
    "all",
    "web-development",
    "mobile-development",
    "ui-ux-design",
    "blockchain",
    "ai-ml",
  ];

  const popularSkills = [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Figma",
    "Solidity",
    "Web3",
  ];

  useEffect(() => {
    setActiveTab(!isClient ? "posted" : "available");
  }, [isClient]);

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gigs`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        setGigs(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch gigs");
      } finally {
        setLoading(false);
      }
    };

    const fetchProposals = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/proposals/user/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setProposals(data);
        }
      } catch (err) {
        console.error("Failed to fetch proposals", err);
      }
    };

    const fetchSavedGigs = async () => {
      if (!user?._id) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setSavedGigsIds(data.savedGigs || []);
        }
      } catch (err) {
        console.error("Failed to fetch saved gigs", err);
      }
    };

    fetchGigs();
    fetchSavedGigs();
    if (isClient) {
      fetchProposals(); // Fetch proposals user has submitted
    }
  }, [user?._id, isClient]);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedSkills([]);
  };

  const handleCreateGig = () => {
    navigate("/freelance/create");
  };

  const handleToggleSave = async (gigId: string) => {
    if (!user?._id) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/users/${user._id}/save-gig`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ gigId })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedGigsIds(data.savedGigs || []);
        toast({ title: "Success", description: "Gig saved status updated." });
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to update saved status.", variant: "destructive" });
    }
  };

  const filteredGigs = gigs.filter((gig) => {
    const matchesSearch =
      gig.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      gig.description.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || gig.category === selectedCategory;
    const matchesSkills =
      selectedSkills.length === 0 ||
      selectedSkills.some((skill) => gig.skills.includes(skill));

    return matchesSearch && matchesCategory && matchesSkills;
  });

  // Client Specific Filters
  const myPostedGigs = gigs.filter(g => {
    const creatorId = g.createdBy?._id || g.createdBy;
    return creatorId?.toString() === user?._id?.toString();
  });
  const myGigsWithProposals = myPostedGigs.filter(g => g.proposals?.length > 0);

  // Freelancer Specific Filters
  const appliedGigsUnfiltered = proposals.map(p => ({ ...p.gig, applicationStatus: p.status, activeProposalId: p._id }));
  // Ensure the gig wasn't null if deleted from db
  const appliedGigs = appliedGigsUnfiltered.filter(g => g._id);
  const savedGigsFiltered = filteredGigs.filter(g => savedGigsIds.includes(g._id));

  const getActiveList = () => {
    switch (activeTab) {
      case "available": return filteredGigs;
      case "posted": return myPostedGigs;
      case "review": return myGigsWithProposals;
      case "applied": return appliedGigs;
      case "saved": return savedGigsFiltered;
      default: return filteredGigs;
    }
  };

  const currentList = getActiveList();

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {!isClient ? "Manage Your Gigs" : "Find Your Next Project"}
          </h1>
          <p className="text-muted-foreground">
            {!isClient ? "Post opportunities and review client proposals" : "Discover amazing opportunities from top freelancers worldwide"}
          </p>
          {!isClient && (
            <motion.div
              className="flex items-center gap-4 mt-2 text-sm text-muted-foreground"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{gigs.length} active gigs</span>
              </div>
            </motion.div>
          )}
        </div>
        {!isClient && (
          <Button
            className="glow-button w-full sm:w-auto"
            onClick={handleCreateGig}
          >
            <Plus className="w-4 h-4 mr-2" />
            Post a Gig
          </Button>
        )}
      </motion.div>

      {/* Role-Based Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full mt-6">
        <TabsList className="flex flex-wrap h-auto w-full justify-start gap-2 bg-transparent p-0 mb-4">
          {!isClient ? (
            <>
              <TabsTrigger value="available">Explore Gigs</TabsTrigger>
              <TabsTrigger value="posted">Your Gigs</TabsTrigger>
              <TabsTrigger value="review">Received Proposals</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="available">Available Gigs</TabsTrigger>
              <TabsTrigger value="applied">Sent Proposals</TabsTrigger>
              <TabsTrigger value="saved">Saved</TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Enhanced Filters (Only show for available gigs) */}
        {activeTab === "available" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: { staggerChildren: 0.1 },
              },
            }}
            className="mt-6"
          >
            <Card className="glass-effect border-2 border-primary/10">
              <CardHeader>
                <motion.div variants={fadeInUp}>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Filter className="w-5 h-5 mr-2" />
                      Search & Filters
                    </div>
                    {(selectedSkills.length > 0 ||
                      selectedCategory !== "all" ||
                      searchQuery) && (
                        <Button variant="outline" size="sm" onClick={clearFilters}>
                          Clear All (
                          {selectedSkills.length +
                            (selectedCategory !== "all" ? 1 : 0) +
                            (searchQuery ? 1 : 0)}
                          )
                        </Button>
                      )}
                  </CardTitle>
                </motion.div>
              </CardHeader>

              <CardContent className="space-y-4">
                <motion.div
                  className="flex flex-col lg:flex-row gap-4"
                  variants={fadeInUp}
                >
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search gigs by title, description, or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-12"
                    />
                  </div>

                  <Select
                    value={selectedCategory}
                    onValueChange={setSelectedCategory}
                  >
                    <SelectTrigger className="lg:w-48 h-12">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="web-development">Web Development</SelectItem>
                      <SelectItem value="mobile-development">Mobile Development</SelectItem>
                      <SelectItem value="ui-ux-design">UI/UX Design</SelectItem>
                      <SelectItem value="blockchain">Blockchain</SelectItem>
                      <SelectItem value="ai-ml">AI/ML</SelectItem>
                    </SelectContent>
                  </Select>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <h4 className="text-sm font-medium mb-3 flex items-center">
                    <Star className="w-4 h-4 mr-1" />
                    Popular Skills
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map((skill, index) => (
                      <motion.div key={skill} custom={index} variants={fadeInUp}>
                        <Badge
                          variant={
                            selectedSkills.includes(skill) ? "default" : "outline"
                          }
                          className="cursor-pointer hover:scale-105 transition-all duration-200 px-3 py-1"
                          onClick={() => toggleSkill(skill)}
                        >
                          {skill}
                          {selectedSkills.includes(skill) && " ✓"}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        <div className="mt-6">
          {/* Results Header */}
          <motion.div
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-1">
                {currentList.length} {activeTab === "review" ? "Gigs with Proposals" : activeTab === "applied" ? "Applications" : activeTab === "posted" ? "Posted Gigs" : "Gigs Found"}
              </h2>
            </motion.div>

            <motion.div
              className="flex items-center gap-2"
            >
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>

          {/* Enhanced Gig Grid/List */}
          {loading ? (
            <div
              className={`grid gap-6 ${viewMode === "grid"
                  ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
                }`}
            >
              {[...Array(6)].map((_, i) => (
                <GigCardSkeleton key={i} />
              ))}
            </div>
          ) : currentList.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`grid gap-6 ${viewMode === "grid"
                  ? "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3"
                  : "grid-cols-1"
                }`}
            >
              {currentList.map((gig, i) => (
                <motion.div
                  key={gig._id || gig.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                >
                  <GigCard
                    gig={gig}
                    onViewDetails={(id) => {
                      navigate(`/gig/${id}`);
                    }}
                    onPropose={
                      user?.role === 'client' && (gig.createdBy?._id || gig.createdBy) !== user?._id
                        ? (id) => navigate(`/gig/${id}/proposal`)
                        : undefined
                    }
                    isSaved={savedGigsIds.includes(gig._id || gig.id)}
                    onSave={handleToggleSave}
                  />
                  {/* Supplementary action states shown when applied or reviewing proposals */}
                  {activeTab === 'applied' && gig.applicationStatus && (
                    <div className="mt-2 text-sm px-4 py-2 border rounded-md border-cyan-accent text-cyan-accent bg-cyan-glow/30 flex justify-between items-center">
                      <span>Proposal Status:</span>
                      <strong className="uppercase">{gig.applicationStatus}</strong>
                    </div>
                  )}
                  {activeTab === 'posted' && (
                    <div className="mt-4 p-4 border rounded-md border-primary/30 bg-primary/5 flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">Proposals Received</span>
                        <Badge className="bg-primary/20 text-primary hover:bg-primary/30 font-bold border-primary/50 text-sm">
                          {gig.proposals?.length || 0} Total
                        </Badge>
                      </div>
                      {(gig.proposals?.length || 0) > 0 ? (
                        <Button
                          className="w-full mt-2"
                          variant="outline"
                          onClick={() => navigate(`/gig/${gig._id || gig.id}`)}
                        >
                          View All Proposals
                        </Button>
                      ) : (
                        <p className="text-sm text-muted-foreground text-center mt-2">No proposals yet.</p>
                      )}
                    </div>
                  )}
                  {activeTab === 'review' && gig.proposals && (
                    <Button
                      className="w-full mt-2 bg-obsidian-elevated border border-cyan-accent text-cyan-accent hover:bg-cyan-glow transition-all"
                      onClick={() => navigate(`/gig/${gig._id || gig.id}`)}
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Review {gig.proposals.length} Proposals
                    </Button>
                  )}
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="text-center py-12 border-2 border-dashed border-muted">
                <CardContent>
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">No gigs found</h3>
                  <p className="text-muted-foreground mb-4">
                    {activeTab === "available" ? "Try adjusting your filters or search terms." : "You haven't posted or applied to any gigs yet."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    {!isClient ? (
                      <Button onClick={handleCreateGig} className="glow-button">
                        <Plus className="w-4 h-4 mr-2" />
                        Post a Gig
                      </Button>
                    ) : (
                      <Button onClick={() => setActiveTab("available")} variant="outline">
                        Browse Available Gigs
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </Tabs>
    </div>
  );
};

export default FreelancePage;
