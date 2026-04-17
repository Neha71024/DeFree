import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuthState } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import ClientDashboardPage from "./ClientDashboardPage";
import {
  Briefcase,
  Calendar,
  TrendingUp,
  DollarSign,
  Users,
  Clock,
  Star,
  Activity,
  Bell,
  Plus,
  ArrowRight,
  MessageSquare,
  Award,
  Target,
  Eye,
  CheckCircle,
  Search,
  Compass,
  FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

// interface Project {
//   id: string;
//   title: string;
//   description: string;
//   technologies: string[];
//   status: string;
//   client: string;
//   budget: string;
//   progress: number;
// }

interface EventData {
  id: string;
  title: string;
  startDate: string; // Use string type to handle date format from backend
}

const DashboardPage = () => {
  const { user, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Dashboard data definitions

  const [completedProjects, setCompletedProjects] = useState("");
  const [totalEarnings, setTotalEarnings] = useState("");
  const [activeProjects, setActiveProjects] = useState("");
  const [gigsPosted, setGigsPosted] = useState(0);
  const [proposalsReceived, setProposalsReceived] = useState(0);
  const [acceptedProjects, setAcceptedProjects] = useState(0);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [showAllEvents, setShowAllEvents] = useState(false);
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [network, setNetwork] = useState("");
  const [changeStats, setChangeStats] = useState({
    projectChange: 0,
    earningsChange: 0,
    successRate: 0,
    newConnections: 0,
  });
  const [performance, setPerformance] = useState({
    successRate: 0,
    clientSatisfaction: 0,
    responseTime: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/${user._id}`
        );
        const data = await res.json();

        setActiveProjects(data.activeProjects);
        setCompletedProjects(data.completedProjects);
        setTotalEarnings(data.totalEarnings);
        setNetwork(data.network);
        setGigsPosted(data.gigsPosted || 0);

        // Map the new fields to component state
        setProposalsReceived(data.proposalsReceived || 0);
        setAcceptedProjects(data.acceptedProjects || 0);

        setRecentActivities(data.recentActivities || []);
        setChangeStats(data.changeStats || {
          projectChange: 0, earningsChange: 0, successRate: 0, newConnections: 0
        });
        setPerformance(data.performance || {
          successRate: 0, clientSatisfaction: 0, responseTime: 0
        });
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
      fetchDashboardStats();
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const eventsRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/events`
        );

        const eventsData = await eventsRes.json();
        if (Array.isArray(eventsData)) {
          const sortedEvents = eventsData.sort(
            (a: EventData, b: EventData) =>
              new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
          );
          setUpcomingEvents(sortedEvents);
        } else {
          setUpcomingEvents([]);
          console.warn("Expected eventsData to be an array, but got:", eventsData);
        }

        console.log("Fetched Events:", eventsData);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    if (user?._id) {
      fetchDashboardData();
    }
  }, [user]);

  const eventsToDisplay = showAllEvents
    ? upcomingEvents || []
    : (upcomingEvents || []).slice(0, 3);

  // ✅ Welcome Toast – Always runs once on mount
  useEffect(() => {
    // avoid redundant toast
    const hasToasted = sessionStorage.getItem("dashboardToasted");
    if (!hasToasted) {
      toast({
        title: "Welcome to DeFree!",
        description: "Your collaboration dashboard is ready",
      });
      sessionStorage.setItem("dashboardToasted", "true");
    }
  }, [toast]);

  const isClient = (user?.role as string) === 'client';

  // ✅ Stats and Data
  const quickStats = [
    {
      title: "Gigs Posted",
      value: gigsPosted,
      icon: Target,
      change: "Lifetime amount",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Active Projects",
      value: activeProjects,
      icon: Briefcase,
      change: `${changeStats?.projectChange >= 0 ? "+" : ""}${changeStats?.projectChange || 0} this week`,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Proposals Received",
      value: proposalsReceived,
      icon: Users,
      change: "Lifetime amount",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Accepted Projects",
      value: acceptedProjects,
      icon: Star,
      change: "From your gigs",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  // ✅ Handler Functions — also declared at top level
  const handleCreateGig = () => {
    navigate("/freelance/create");
    toast({
      title: "Create New Gig",
      description: "Starting gig creation process",
    });
  };

  const handleViewGigs = () => {
    navigate("/freelance");
    toast({
      title: "Browse Gigs",
      description: "Exploring available freelance opportunities",
    });
  };

  const handleDiscoverFreelancers = () => {
    navigate("/connections");
    toast({
      title: "Discover Freelancers",
      description: "Browsing top talent on the network",
    });
  };

  const handleReviewProposals = () => {
    navigate("/freelance"); // Will update route if we make a bespoke active gigs page
    toast({
      title: "Review Proposals",
      description: "Checking applications for your gigs",
    });
  };

  const handleJoinCommunity = () => {
    navigate("/community");
    toast({
      title: "Join Community",
      description: "Connecting with fellow developers",
    });
  };

  const handleViewProfile = () => {
    navigate("/profile");
    toast({
      title: "View Profile",
      description: "Managing your professional profile",
    });
  };

  const handleStartChat = () => {
    navigate("/community");
    toast({
      title: "Start Chatting",
      description: "Opening real-time collaboration chat",
    });
  };

  const handleViewNotifications = () => {
    navigate("/notifications");
    toast({
      title: "Notifications",
      description: "Checking your latest updates",
    });
  };

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Please Log In</h2>
            <p className="text-muted-foreground mb-6">
              You need to be logged in to access your dashboard.
            </p>
            <Button asChild className="w-full">
              <Link to="/login">Log In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Earnings Chart Data
  const chartData = [
    { name: "Customers", value: parseFloat(String(totalEarnings).replace(/[^0-9.]/g, "")) * 0.4 || 1250 },
    { name: "Projects", value: parseFloat(String(totalEarnings).replace(/[^0-9.]/g, "")) * 0.35 || 980 },
    { name: "Gigs", value: parseFloat(String(totalEarnings).replace(/[^0-9.]/g, "")) * 0.15 || 420 },
    { name: "Events", value: parseFloat(String(totalEarnings).replace(/[^0-9.]/g, "")) * 0.1 || 210 },
  ];

  const COLORS = ["#6366f1", "#3b82f6", "#a855f7", "#f59e0b"];

  // Route clients to dedicated client dashboard
  if (user?.role === "client") {
    return <ClientDashboardPage />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome back! 👋
          </h1>
          <motion.p
            className="text-muted-foreground text-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Ready to spark some collaboration today?
          </motion.p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleCreateGig} className="glow-button">
            <Plus className="w-4 h-4 mr-2" />
            Create Gig
          </Button>
        </div>
      </motion.div>

      {/* Wallet Connection */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {quickStats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
          >
            <Card
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={handleViewProfile}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <motion.div
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Earnings Overview Graph */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Earnings Overview
              </CardTitle>
              <CardDescription>
                Distribution of money received across categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#f8fafc' }}
                      formatter={(value) => [`$${value}`, 'Earnings']}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>


          {/* Recent Activity */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Recent Activity
                </div>
                <Button
                  onClick={handleViewNotifications}
                  variant="outline"
                  size="sm"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View All
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
              >
                {(recentActivities || []).map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={handleViewNotifications}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{activity?.actionTitle}</p>
                      <p className="text-sm text-muted-foreground">
                        {activity?.context}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          activity?.status === "completed"
                            ? "default"
                            : activity?.status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {activity?.status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity?.time}
                      </p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Sidebar */}
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          {/* Performance Overview */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Project Success Rate</span>
                  <span>{performance?.successRate || 0}%</span>
                </div>
                <Progress value={Number(performance?.successRate || 0)} className="h-2" />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Client Satisfaction</span>
                  <span>{performance?.clientSatisfaction || 0}/5</span>
                </div>
                <Progress
                  value={(Number(performance?.clientSatisfaction || 0) / 5) * 100}
                  className="h-2"
                />
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Response Time</span>
                  <span>{performance?.responseTime || "0 hrs"}</span>
                </div>
                <Progress
                  value={Math.max(0, 100 - (Number(String(performance?.responseTime || "").replace(/[^0-9.]/g, '')) || 0) * 10)}
                  className="h-2"
                />
              </div>

              <Button
                onClick={handleViewProfile}
                variant="outline"
                className="w-full mt-4"
              >
                <Star className="w-4 h-4 mr-2" />
                View Full Profile
              </Button>
            </CardContent>
          </Card>

        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
