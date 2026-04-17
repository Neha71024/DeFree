import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuth";
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Plus, Briefcase, Users, DollarSign, Search,
  MessageSquare, ArrowRight, Star, CheckCircle, Clock, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

const ClientDashboardPage = () => {
  const { user } = useAuthState();
  const navigate = useNavigate();

  const [myGigs, setMyGigs] = useState<any[]>([]);
  const [connections, setConnections] = useState<any[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?._id) return;
      setLoading(true);
      try {
        const [gigsRes, connRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/gigs`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/connections/${user._id}`)
        ]);
        const allGigs = gigsRes.data;
        const myPostedGigs = allGigs.filter(
          (g: any) => {
            const creatorId = g.createdBy?._id || g.createdBy;
            return creatorId?.toString() === user._id?.toString();
          }
        );
        setMyGigs(myPostedGigs);

        // Collect proposals from all my gigs
        const allProposals: any[] = [];
        for (const gig of myPostedGigs) {
          if (gig.proposals?.length > 0) {
            try {
              const propRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/proposals/gig/${gig._id}`);
              allProposals.push(...propRes.data);
            } catch {}
          }
        }
        setProposals(allProposals);
        setConnections(connRes.data.filter((c: any) => c.status === 'accepted'));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?._id]);

  const activeGigs = myGigs.filter(g => g.status === 'open').length;
  const totalProposals = proposals.length;
  const pendingProposals = proposals.filter(p => p.status === 'Pending').length;
  const acceptedProposals = proposals.filter(p => p.status === 'Accepted').length;
  const connectedFreelancers = connections.filter(
    (c: any) => {
      const partner = c.requester?._id === user?._id ? c.recipient : c.requester;
      return partner?.role === 'freelancer';
    }
  ).length;

  const stats = [
    { label: "Active Gigs", value: activeGigs, icon: TrendingUp, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    { label: "Total Proposals", value: totalProposals, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
    { label: "Connections", value: connectedFreelancers, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  ];

  const quickActions = [
    { label: "Explore Gigs", icon: Briefcase, onClick: () => navigate('/freelance'), primary: true },
    { label: "Browse Freelancers", icon: Search, onClick: () => navigate('/connections') },
    { label: "View Sent Proposals", icon: CheckCircle, onClick: () => navigate('/client-proposals') },
    { label: "Community Chat", icon: MessageSquare, onClick: () => navigate('/community') },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.09 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
            Client Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, <span className="text-foreground font-medium">{user?.username}</span>. Here's your hiring overview.
          </p>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className={`glass-effect border ${stat.border} hover:scale-[1.02] transition-transform`}>
              <CardContent className="p-5">
                <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3 border ${stat.border}`}>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>
                  {loading ? "—" : stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                onClick={action.onClick}
                className={`h-auto py-4 flex flex-col gap-2 ${action.primary ? 'glow-button' : 'glass-effect border border-white/10 hover:border-primary/30'}`}
                variant={action.primary ? "default" : "outline"}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        {/* Recent Proposals */}
        <motion.div variants={itemVariants}>
          <Card className="glass-effect border border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Proposals</CardTitle>
              <div className="flex gap-2 text-xs">
                <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20">
                  <Clock className="w-3 h-3 mr-1" /> {pendingProposals} pending
                </Badge>
                <Badge className="bg-green-400/10 text-green-400 border-green-400/20">
                  <CheckCircle className="w-3 h-3 mr-1" /> {acceptedProposals} accepted
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : proposals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground text-sm">No proposals received yet.</p>
                </div>
              ) : (
                proposals.slice(0, 4).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/5"
                    onClick={() => navigate(`/gig/${p.gig?._id || p.gig}`)}
                  >
                    <Avatar className="w-9 h-9 border border-white/10 shrink-0">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user?.username}`} />
                      <AvatarFallback>{p.user?.username?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{p.user?.username}</div>
                      <div className="text-xs text-muted-foreground truncate">${p.budget} · {p.deliveryTime}</div>
                    </div>
                    <Badge
                      className={`text-xs shrink-0 ${p.status === 'Pending'
                        ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
                        : p.status === 'Accepted'
                          ? 'bg-green-400/10 text-green-400 border-green-400/20'
                          : 'bg-red-400/10 text-red-400 border-red-400/20'
                      }`}
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Connected Freelancers */}
      {connections.length > 0 && (
        <motion.div variants={itemVariants}>
          <Card className="glass-effect border border-white/5">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Connected Freelancers</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/connections')}>
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {connections.slice(0, 8).map((c) => {
                  const partner = c.requester?._id === user?._id ? c.recipient : c.requester;
                  return (
                    <div
                      key={c._id}
                      className="flex items-center gap-2 p-2 pr-4 rounded-full bg-white/5 hover:bg-white/10 cursor-pointer transition-all border border-white/10 hover:border-primary/30"
                      onClick={() => navigate(`/profile/${partner?._id}`)}
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.username}`} />
                        <AvatarFallback>{partner?.username?.[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{partner?.username}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ClientDashboardPage;
