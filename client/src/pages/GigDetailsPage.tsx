import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Clock, Users, MapPin, CheckCircle, XCircle, Edit } from "lucide-react";
import { useState, useEffect } from "react";
import PaymentButton from "@/components/PaymentButton";
import { useAuthState } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const GigDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthState();
  const { toast } = useToast();

  const [gig, setGig] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<any>({ title: "", description: "", minBudget: 0, maxBudget: 0 });

  const handleEditClick = () => {
    setEditData({
      title: gig.title,
      description: gig.description,
      minBudget: gig.minBudget,
      maxBudget: gig.maxBudget,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    try {
      if (!gig?._id) return;
      await axios.put(`${import.meta.env.VITE_API_URL}/api/gigs/${gig._id}`, editData);
      setGig({ ...gig, ...editData });
      setIsEditing(false);
      toast({ title: "Success", description: "Gig updated successfully." });
    } catch (err) {
      toast({ title: "Error", description: "Failed to update gig.", variant: "destructive" });
    }
  };

  const fetchProposals = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/proposals/gig/${id}`);
      setProposals(res.data);
    } catch (err) {
      console.error("Failed to fetch proposals", err);
    }
  };

  useEffect(() => {
    async function fetchGig() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/gigs/${id}`);
        if (!res.ok) {
          throw new Error("Gig not found");
        }
        const data = await res.json();
        setGig(data);
        fetchProposals();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchGig();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>Loading gig details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4">{error}</h1>
        <Button onClick={() => navigate("/freelance")}>
          Back to Freelance
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => navigate("/freelance")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Freelance
        </Button>
        {user?._id && gig?.createdBy?._id === user._id && (
          <Dialog open={isEditing} onOpenChange={setIsEditing}>
            <DialogTrigger asChild>
              <Button onClick={handleEditClick} className="glow-button">
                <Edit className="w-4 h-4 mr-2" />
                Edit Gig
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Gig Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={editData.title} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={editData.description} onChange={(e) => setEditData({...editData, description: e.target.value})} rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Budget ($)</Label>
                    <Input type="number" value={editData.minBudget} onChange={(e) => setEditData({...editData, minBudget: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Budget ($)</Label>
                    <Input type="number" value={editData.maxBudget} onChange={(e) => setEditData({...editData, maxBudget: Number(e.target.value)})} />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSaveEdit}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="glass-effect">
            <CardHeader>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <CardTitle className="text-2xl mb-2">{gig.title}</CardTitle>
                  <div className="text-3xl font-bold text-gradient mb-4">
                    ${gig.minBudget.toLocaleString()} - $
                    {gig.maxBudget.toLocaleString()}
                  </div>
                </div>
                <Badge>{gig.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-muted-foreground">{gig.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Skills Required</h3>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Experience Level</h4>
                  <Badge className="capitalize">{gig.experienceLevel}</Badge>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Category</h4>
                  <span className="text-muted-foreground">{gig.category}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12 cursor-pointer" onClick={() => navigate(`/profile/${gig?.createdBy?._id}`)}>
                  <AvatarImage
                    src={gig?.createdBy?.avatar}
                    alt={gig?.createdBy?.username}
                  />
                  <AvatarFallback className="text-foreground">
                    {gig?.createdBy?.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium cursor-pointer hover:underline" onClick={() => navigate(`/profile/${gig?.createdBy?._id}`)}>{gig?.createdBy?.username}</div>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{gig?.createdBy?.rating || 0}</span>
                    <span>({gig?.createdBy?.reviewCount || 0} reviews)</span>
                  </div>
                </div>
              </div>
              {gig?.createdBy?.isVerified && (
                <Badge variant="secondary" className="mb-4">
                  Verified Client
                </Badge>
              )}
              <Button 
                variant="outline" 
                className="w-full mt-4" 
                onClick={() => navigate(`/profile/${gig?.createdBy?._id}`)}
              >
                View Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Proposals</span>
                  <span className="font-medium">{proposals.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{gig?.duration || "N/A"}</span>
                </div>
              </div>
              {gig?._id && (gig?.createdBy?._id !== user?._id) && user?.role === 'client' && (
                <div>
                  <Button
                    className="w-full mt-6 glow-button"
                    onClick={() => navigate(`/gig/${gig._id}/proposal`)}
                    disabled={gig.status !== 'open'}
                  >
                    {gig.status === 'open' ? 'Submit Proposal' : 'Cannot Submit Proposal'}
                  </Button>
                  {gig.status === 'completed' && (
                    <PaymentButton
                      type="gig_payout"
                      itemId={gig._id}
                      amount={(gig.minBudget + gig.maxBudget) / 2}
                      className="w-full mt-2"
                    >
                      Request Payout
                    </PaymentButton>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {user && gig?.createdBy?._id === user._id && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Proposals ({proposals.length})</h2>
          {proposals.length === 0 ? (
            <p className="text-muted-foreground">No proposals yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {proposals.map(proposal => (
                <Card key={proposal._id} className="glass-effect">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate(`/profile/${proposal.user._id}`)}>
                        <Avatar>
                          <AvatarImage src={proposal.user.avatar} />
                          <AvatarFallback className="text-foreground">{proposal.user.username?.[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium hover:underline">{proposal.user.username}</div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 mr-1" />
                            {proposal.user.rating || 0}
                          </div>
                        </div>
                      </div>
                      <Badge variant={proposal.status === "Pending" ? "secondary" : proposal.status === "Accepted" ? "default" : "destructive"}>
                        {proposal.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm bg-accent/20 p-3 rounded-lg">
                      <div>
                        <span className="text-muted-foreground block text-xs">Proposed Budget</span>
                        <span className="font-semibold text-cyan-400">${proposal.budget}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs">Delivery Time</span>
                        <span className="font-semibold">{proposal.deliveryTime}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-semibold uppercase text-muted-foreground mb-1 block">Cover Letter</span>
                      <p className="text-sm line-clamp-3">{proposal.message}</p>
                    </div>

                    {proposal.status === "Pending" && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          className="flex-1 bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          onClick={async () => {
                            try {
                              await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals/${proposal._id}/accept`);
                              toast({ title: "Success", description: "Proposal Accepted" });
                              fetchProposals();
                            } catch (err: any) {
                              toast({ title: "Error", description: err.response?.data?.error || "Failed", variant: "destructive" });
                            }
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Accept
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={async () => {
                            try {
                              await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals/${proposal._id}/reject`);
                              toast({ title: "Success", description: "Proposal Rejected" });
                              fetchProposals();
                            } catch (err: any) {
                              toast({ title: "Error", description: err.response?.data?.error || "Failed", variant: "destructive" });
                            }
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetailsPage;
