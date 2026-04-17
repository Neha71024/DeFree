import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuthState } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserCheck, UserMinus, MessageSquare, Network, Users, Clock, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const ConnectionsPage = () => {
    const { user, isAuthenticated } = useAuthState();
    const { toast } = useToast();
    const navigate = useNavigate();

    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("discover");

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`);
            setAllUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setAllUsers([]);
        }
    };

    const fetchConnections = async () => {
        if (!user?._id) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/connections/${user._id}`);
            setConnections(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            console.error(err);
            setConnections([]);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            fetchUsers();
            fetchConnections();
        }
    }, [isAuthenticated, user]);

    const handleConnect = async (recipientId: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/request`, {
                requesterId: user?._id,
                recipientId
            });
            toast({ title: "Request Sent!", description: "Connection request sent successfully." });
            fetchConnections();
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.error || "Failed to connect", variant: "destructive" });
        }
    };

    const handleMessage = async (recipientId: string) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/groups/direct`, {
                user1Id: user?._id,
                user2Id: recipientId
            });
            navigate(`/community/${res.data._id}`);
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.error || "Failed to start chat.", variant: "destructive" });
        }
    };

    const handleAccept = async (connId: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/accept/${connId}`);
            toast({ title: "Connected!", description: "Connection accepted." });
            fetchConnections();
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.error || "Failed to accept", variant: "destructive" });
        }
    };

    const handleReject = async (connId: string) => {
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/connections/reject/${connId}`);
            toast({ title: "Rejected", description: "Connection request declined." });
            fetchConnections();
        } catch (err: any) {
            toast({ title: "Error", description: err.response?.data?.error || "Failed to reject", variant: "destructive" });
        }
    };

    // Compute derived data
    const connectedUserIds = new Set(connections.flatMap((c) => [c.requester?._id, c.recipient?._id]));
    const pendingUserIds = new Set(
        connections
            .filter(c => c.status === 'pending')
            .flatMap(c => [c.requester?._id, c.recipient?._id])
    );

    const discoverableUsers = allUsers.filter(
        (u) => u._id !== user?._id &&
            !connectedUserIds.has(u._id) &&
            !pendingUserIds.has(u._id) &&
            ((u.username || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (u.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                (Array.isArray(u.freelancerProfile?.skills) ? u.freelancerProfile.skills.join(' ') : "").toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const recommendedUsers = discoverableUsers.slice(0, 6);

    const pendingRequests = connections.filter(c => c.status === 'pending' && c.recipient?._id === user?._id);
    const sentRequests = connections.filter(c => c.status === 'pending' && c.requester?._id === user?._id);
    const acceptedConnections = connections.filter(c => c.status === 'accepted');

    const getRoleColor = (role: string) => {
        if (role === 'freelancer') return 'from-cyan-500 to-blue-500';
        if (role === 'client') return 'from-purple-500 to-pink-500';
        return 'from-gray-500 to-slate-500';
    };

    const getRoleBadgeClass = (role: string) => {
        if (role === 'freelancer') return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        if (role === 'client') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    const UserCard = ({ u, showConnect = true }: { u: any; showConnect?: boolean }) => (
        <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
        >
            <Card 
                className="glass-effect border border-white/5 hover:border-primary/30 transition-all duration-300 overflow-hidden group cursor-pointer"
                onClick={() => navigate(`/profile/${u._id}`)}
            >
                <div className={`h-1 bg-gradient-to-r ${getRoleColor(u.role)}`} />
                <CardContent className="p-6 text-center">
                    <div className="relative mb-4">
                        <Avatar className="w-20 h-20 mx-auto border-2 border-white/10 group-hover:border-primary/50 transition-all">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.username}`} />
                            <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                                {u.username?.[0]?.toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{u.username}</h3>
                    <Badge className={`text-xs border mb-3 ${getRoleBadgeClass(u.role)}`}>
                        {u.role || "User"}
                    </Badge>
                    {u.freelancerProfile?.skills?.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mb-4">
                            {u.freelancerProfile.skills.slice(0, 3).map((skill: string) => (
                                <span key={skill} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-muted-foreground">
                                    {skill}
                                </span>
                            ))}
                        </div>
                    )}
                    {u.location && (
                        <p className="text-xs text-muted-foreground mb-4">📍 {u.location}</p>
                    )}
                    <div className="flex gap-2">
                        {showConnect && (
                            <Button
                                onClick={(e) => { e.stopPropagation(); handleConnect(u._id); }}
                                className="flex-1 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
                                size="sm"
                                variant="outline"
                            >
                                <UserPlus className="w-3 h-3 mr-1" /> Connect
                            </Button>
                        )}
                        <Button
                            onClick={(e) => { e.stopPropagation(); navigate(`/profile/${u._id}`); }}
                            variant="outline"
                            className="flex-1"
                            size="sm"
                        >
                            View Profile
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );

    return (
        <motion.div
            className="min-h-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            {/* Premium Hero Section */}
            <div className="relative border-b border-white/10 bg-gradient-to-b from-primary/10 via-background to-background pb-12 mb-10 overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none transform translate-x-1/3 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/20 rounded-full blur-[100px] pointer-events-none transform -translate-x-1/2 translate-y-1/2"></div>
                
                <div className="relative z-10 px-4 pt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center text-center sm:items-start sm:text-left gap-4"
                    >
                        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 border border-primary/20 shadow-[0_0_30px_rgba(var(--primary),0.2)] backdrop-blur-md">
                            <Network className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]" />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground/60 leading-tight">
                            Your Network
                        </h1>
                        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl">
                            Discover top talent, expand your reach, and build meaningful professional connections.
                        </p>
                    </motion.div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 mt-10 max-w-4xl"
                    >
                        <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_rgba(var(--primary),0.15)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
                                <Users className="w-16 h-16 text-primary" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-primary/20 text-primary">
                                        <Users className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Connected</span>
                                </div>
                                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/70 tracking-tight">
                                    {acceptedConnections.length}
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 transition-all duration-500 hover:border-yellow-500/50 hover:shadow-[0_0_40px_rgba(234,179,8,0.15)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:-rotate-12 group-hover:scale-110">
                                <Clock className="w-16 h-16 text-yellow-500" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-500">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Pending</span>
                                </div>
                                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 tracking-tight">
                                    {pendingRequests.length}
                                </div>
                            </div>
                        </div>

                        <div className="relative overflow-hidden group rounded-2xl bg-gradient-to-b from-white/5 to-white/[0.02] border border-white/10 p-6 transition-all duration-500 hover:border-blue-500/50 hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity duration-500 transform group-hover:scale-110">
                                <Network className="w-16 h-16 text-blue-500" />
                            </div>
                            <div className="relative z-10 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-blue-500/20 text-blue-500">
                                        <Network className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Platform</span>
                                </div>
                                <div className="text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600 tracking-tight">
                                    {Math.max(0, allUsers.length - 1)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Tabs Section */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-8">
                    <TabsList className="bg-white/5 border border-white/10">
                        <TabsTrigger value="discover">
                            <Search className="w-4 h-4 mr-2" /> Discover All
                        </TabsTrigger>
                        <TabsTrigger value="connections">
                            <UserCheck className="w-4 h-4 mr-2" />
                            My Network
                            {acceptedConnections.length > 0 && (
                                <Badge className="ml-2 bg-primary/20 text-primary border-primary/20 text-xs">
                                    {acceptedConnections.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        {pendingRequests.length > 0 && (
                            <TabsTrigger value="pending">
                                <Clock className="w-4 h-4 mr-2" />
                                Requests
                                <Badge className="ml-2 bg-yellow-400/20 text-yellow-400 border-yellow-400/20 text-xs">
                                    {pendingRequests.length}
                                </Badge>
                            </TabsTrigger>
                        )}
                    </TabsList>

                    <div className="relative w-full sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by Name/Roll Number..."
                            className="pl-10 bg-white/5 border-white/10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Discover Tab */}
                <TabsContent value="discover" className="space-y-4">
                    {discoverableUsers.length === 0 ? (
                        <div className="text-center py-16">
                            <UserCheck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">You know everyone!</h3>
                            <p className="text-muted-foreground">You're connected with all users on the platform.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {discoverableUsers.map((u, i) => (
                                <motion.div
                                    key={u._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04 }}
                                >
                                    <UserCard u={u} showConnect={true} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* My Network Tab */}
                <TabsContent value="connections" className="space-y-6">
                    {acceptedConnections.length === 0 ? (
                        <div className="text-center py-16">
                            <Network className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-xl font-semibold mb-2">No connections yet</h3>
                            <p className="text-muted-foreground mb-4">Start building your network by connecting with others.</p>
                            <Button onClick={() => setActiveTab('discover')} variant="outline">
                                Discover People
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {acceptedConnections.map((c, i) => {
                                const partner = c.requester?._id === user?._id ? c.recipient : c.requester;
                                return (
                                    <motion.div
                                        key={c._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        whileHover={{ y: -4 }}
                                    >
                                        <Card className="glass-effect border border-white/5 hover:border-primary/30 transition-all overflow-hidden group">
                                            <div className={`h-1 bg-gradient-to-r ${getRoleColor(partner?.role)}`} />
                                            <CardContent className="p-6 text-center">
                                                <Avatar className="w-20 h-20 mx-auto mb-4 border-2 border-white/10">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${partner?.username}`} />
                                                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary/20 to-secondary/20">
                                                        {partner?.username?.[0]?.toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-bold text-lg mb-1">{partner?.username}</h3>
                                                <Badge className={`text-xs border mb-4 ${getRoleBadgeClass(partner?.role)}`}>
                                                    {partner?.role || "User"}
                                                </Badge>
                                                <div className="flex gap-2">
                                                    <Button
                                                        onClick={() => handleMessage(partner?._id)}
                                                        className="flex-1"
                                                        size="sm"
                                                    >
                                                        <MessageSquare className="w-3 h-3 mr-1" /> Message
                                                    </Button>
                                                    <Button
                                                        onClick={() => navigate(`/profile/${partner?._id}`)}
                                                        variant="outline"
                                                        size="sm"
                                                    >
                                                        Profile
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </TabsContent>

                {/* Pending Requests Tab */}
                <TabsContent value="pending" className="space-y-4">
                    {pendingRequests.length === 0 ? (
                        <p className="text-muted-foreground text-center py-8">No pending requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {pendingRequests.map((c, i) => (
                                <motion.div
                                    key={c._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: i * 0.06 }}
                                >
                                    <Card className="glass-effect border border-yellow-500/20">
                                        <div className="h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
                                        <CardContent className="p-6 text-center">
                                            <Avatar className="w-16 h-16 mx-auto mb-4 border-2 border-yellow-500/20">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${c.requester?.username}`} />
                                                <AvatarFallback>{c.requester?.username?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <h3 className="font-bold mb-1">{c.requester?.username}</h3>
                                            <Badge className={`text-xs border mb-4 ${getRoleBadgeClass(c.requester?.role)}`}>
                                                {c.requester?.role || "User"}
                                            </Badge>
                                            <div className="flex gap-2 mt-2">
                                                <Button onClick={() => handleAccept(c._id)} className="flex-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20" size="sm" variant="outline">
                                                    <UserCheck className="w-3 h-3 mr-1" /> Accept
                                                </Button>
                                                <Button onClick={() => handleReject(c._id)} variant="destructive" className="flex-1" size="sm">
                                                    <UserMinus className="w-3 h-3 mr-1" /> Decline
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Recommended Section */}
            {recommendedUsers.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-12 mb-10"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-400" />
                        <h2 className="text-xl font-bold">People You May Know</h2>
                        <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/20 text-xs">
                            Real Users
                        </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {recommendedUsers.map((u, i) => (
                            <motion.div
                                key={u._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.06 }}
                            >
                                <UserCard u={u} showConnect={true} />
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </motion.div>
    );
};

export default ConnectionsPage;
