

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Plus,
  Users,
  Globe,
  Lock,
  MessageSquare,
  Hash,
} from "lucide-react";
import { useAuthState } from "@/hooks/useAuth";
import { User } from "@/types";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const CommunityPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthState();
  const { toast } = useToast();
  // console.log(user)
  const [searchQuery, setSearchQuery] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("explore");
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    type: "public",
    maxMembers: 100,
  });
  const [dialogOpen, setDialogOpen] = useState(false);

  // 🟡 Fetch groups from backend
  const fetchGroups = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`);
      const data = await res.json();
      console.log(data);
      setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching groups:", error);
      setGroups([]);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    // Check if there's a join parameter in the URL
    const params = new URLSearchParams(window.location.search);
    const joinGroupId = params.get('join');
    
    if (joinGroupId && user && user._id) {
       const doJoin = async () => {
         try {
           const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${joinGroupId}/request-join`, {
             method: "POST",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ userId: user._id }),
           });
           if (res.ok) {
             toast({ title: "Invite Applied", description: "Your request to join the community has been sent." });
             fetchGroups();
           } else {
             const data = await res.json();
             // Only show toast if it's a new info, "Already a member" is benign.
             if(data.message !== 'Already a member') {
                toast({ title: "Invite Status", description: data.message || "Could not process invite" });
             }
           }
           // Remove 'join' param from url without refreshing
           const newUrl = window.location.pathname;
           window.history.replaceState({}, '', newUrl);
         } catch(e) {
           console.error(e);
         }
       };
       doJoin();
    }
  }, [user]);

  // 🟢 Create group by calling backend
  const handleAddGroup = async () => {
    if (!user?._id) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newGroup,
          userId: user._id, // Set creator as admin
        }),
      });

      if (res.ok) {
        const createdGroup = await res.json();
        setGroups((prev) => [...prev, createdGroup]);
        setNewGroup({ name: "", description: "", type: "public", maxMembers: 100 });
        setDialogOpen(false);
        navigate(`/community/${createdGroup._id}`);
      } else {
        console.error("Failed to create group");
      }
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  const filteredGroups = Array.isArray(groups) ? groups.filter(
    (group) =>
      (group?.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group?.description || "").toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getGroupIcon = (type: string) => {
    switch (type) {
      case "public":
        return <Globe className="w-4 h-4" />;
      case "private":
        return <Lock className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const handleRequestJoin = async (groupId: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/request-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user?._id }),
      });
      if (res.ok) {
        toast({ title: "Request Sent", description: "Your request to join has been sent." });
        fetchGroups();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAcceptJoin = async (groupId: string, userIdToAccept: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/accept-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: user?._id, userIdToAccept }),
      });
      if (res.ok) {
        toast({ title: "Member Accepted" });
        fetchGroups();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectJoin = async (groupId: string, userIdToReject: string) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}/reject-join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: user?._id, userIdToReject }),
      });
      if (res.ok) {
        toast({ title: "Request Rejected" });
        fetchGroups();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    if (!window.confirm("Are you sure you want to delete this community?")) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/groups/${groupId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: user?._id }),
      });
      if (res.ok) {
        toast({ title: "Community Deleted!" });
        fetchGroups();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyInviteLink = (groupId: string) => {
    const link = `${window.location.origin}/community?join=${groupId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link Copied!", description: "Invite link copied to clipboard." });
  };

  const GroupCard = ({ group }: { group: any }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary">
              {getGroupIcon(group.type)}
            </div>
            <div>
              <h3 className="font-semibold">{group.name}</h3>
              <p className="text-xs text-muted-foreground">
                {group.members?.length ?? 0} {group.maxMembers ? `/ ${group.maxMembers}` : ""} members
              </p>
            </div>
          </div>
          <Badge variant="outline">{group.type}</Badge>
        </div>
        <p className="text-sm mt-2 text-muted-foreground">
          {group.description}
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex -space-x-2">
          {Array.isArray(group?.members) &&
            group.members
              .slice(0, 5)
              .filter((member) => member)
              .map((member: any) => (
                <Avatar
                  key={member._id || member.id}
                  className="w-8 h-8 border-2 border-background mb-1"
                >
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${member?.username}`}
                  />
                  <AvatarFallback className="text-xs">
                    {member?.username ? member.username.charAt(0).toUpperCase() : "?"}
                  </AvatarFallback>
                </Avatar>
              ))}

          {group.members.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
              +{group.members.length - 5}
            </div>
          )}
        </div>

        <div className="text-xs text-muted-foreground mb-3">
          Last active: {new Date(group.lastActivity).toLocaleDateString()}
        </div>

        {user && user._id ? (
          group.members.some((m: any) => m?._id === user._id) ? (
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button variant="secondary" disabled className="flex-1">
                  <Users className="w-4 h-4 mr-2" /> Joined
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/community/${group._id}`)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </Button>
              </div>
              
              {group.admin === user._id && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-semibold mb-2">Admin Tools</h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => copyInviteLink(group._id)}>
                      Copy Invite Link
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group._id)}>
                      Delete Community
                    </Button>
                  </div>
                  
                  {group.pendingMembers && group.pendingMembers.length > 0 && (
                    <div className="bg-white/5 p-2 rounded-md">
                      <p className="text-xs mb-2">{group.pendingMembers.length} Pending Request(s)</p>
                      <div className="flex flex-col gap-2">
                        {group.pendingMembers.map((pid: string) => (
                           <div key={pid} className="flex items-center justify-between text-xs bg-black/20 p-2 rounded">
                              <span className="truncate">User: {pid.substring(0, 6)}...</span>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="h-6 text-[10px]" onClick={() => handleAcceptJoin(group._id, pid)}>Accept</Button>
                                <Button size="sm" variant="destructive" className="h-6 text-[10px]" onClick={() => handleRejectJoin(group._id, pid)}>Reject</Button>
                              </div>
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            group.pendingMembers && group.pendingMembers.includes(user._id) ? (
              <Button
                variant="outline"
                disabled
                className="w-full"
              >
                Request Pending...
              </Button>
            ) : (
              <Button
                className="w-full glow-button"
                onClick={() => handleRequestJoin(group._id)}
              >
                Request to Join
              </Button>
            )
          )
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => navigate("/login")}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Login to Join
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        className="flex justify-between items-center mb-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Community</h1>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Connect with others and explore groups
          </motion.p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="glow-button">
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., React Learners"
                  value={newGroup.name}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your group..."
                  value={newGroup.description}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, description: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="type">Group Type</Label>
                <Select
                  value={newGroup.type}
                  onValueChange={(value) =>
                    setNewGroup({ ...newGroup, type: value })
                  }
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select group type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="maxMembers">Maximum Members</Label>
                <Input
                  id="maxMembers"
                  type="number"
                  min="2"
                  value={newGroup.maxMembers}
                  onChange={(e) =>
                    setNewGroup({ ...newGroup, maxMembers: parseInt(e.target.value) || 100 })
                  }
                />
              </div>

              <Button onClick={handleAddGroup} className="w-full glow-button">
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Search */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search groups..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </motion.div>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <motion.div
              className="text-2xl font-bold text-gradient"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {groups.length}
            </motion.div>
            <div className="text-sm text-muted-foreground">Total Groups</div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <motion.div
              className="text-2xl font-bold text-gradient"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {groups.length}
            </motion.div>
            <div className="text-sm text-muted-foreground">Active Members</div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <motion.div
              className="text-2xl font-bold text-gradient"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              1.2K
            </motion.div>
            <div className="text-sm text-muted-foreground">Messages Today</div>
          </CardContent>
        </Card>
        <Card className="glass-effect">
          <CardContent className="pt-6 text-center">
            <motion.div
              className="text-2xl font-bold text-gradient"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              24
            </motion.div>
            <div className="text-sm text-muted-foreground">Online Now</div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.7 }}
      >
        <Tabs
          defaultValue="explore"
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="explore">
              <Globe className="w-4 h-4 mr-2" /> Explore
            </TabsTrigger>
            <TabsTrigger value="my-groups">
              <Users className="w-4 h-4 mr-2" /> My Groups
            </TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          <TabsContent value="explore">
            {filteredGroups.length > 0 ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1 }}
              >
                {filteredGroups.map((group) => (
                  <GroupCard key={group._id} group={group} />
                ))}
              </motion.div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No groups found. Try creating one!
              </p>
            )}
          </TabsContent>

          <TabsContent value="my-groups">
            {user?._id &&
              filteredGroups?.some(
                (g) =>
                  Array.isArray(g?.members) &&
                  g.members.some((m: any) => {
                    if (!m) return false;
                    if (typeof m === "string") return m === user._id;
                    if (typeof m === "object")
                      return m._id === user._id || m.id === user._id;
                    return false;
                  })
              ) ? (
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {filteredGroups
                  ?.filter(
                    (g) =>
                      Array.isArray(g?.members) &&
                      g.members.some((m: any) => {
                        if (!m) return false;
                        if (typeof m === "string") return m === user._id;
                        if (typeof m === "object")
                          return m._id === user._id || m.id === user._id;
                        return false;
                      })
                  )
                  .map((group) => (
                    <GroupCard key={group._id} group={group} />
                  ))}
              </motion.div>
            ) : (
              <motion.p
                className="text-center text-muted-foreground py-8"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                You're not part of any groups yet.
              </motion.p>
            )}
          </TabsContent>
          <TabsContent value="trending" className="space-y-6">
            <motion.div
              className="text-center py-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="text-6xl mb-4">🔥</div>
              <h3 className="text-xl font-semibold mb-2">
                Trending Communities
              </h3>
              <p className="text-muted-foreground">
                Coming soon - discover what's hot in the community
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default CommunityPage;
