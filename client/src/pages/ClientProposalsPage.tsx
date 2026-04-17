import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuthState } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useWeb3 } from '@/hooks/useWeb3';
import { getEscrowInstance, parseEscrowError } from '@/lib/escrow';
import {
  Card, CardContent, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Briefcase, CheckCircle2, Clock, DollarSign,
  FileText, User, Eye, Loader2, Send, Star
} from 'lucide-react';

interface ProposalItem {
  _id: string;
  message: string;
  budget: number;
  deliveryTime: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'FundReleased';
  submittedAt: string;
  escrowAddress?: string;
  gig: {
    _id: string;
    title: string;
    category: string;
    minBudget: number;
    maxBudget: number;
    createdBy: {
      _id: string;
      username: string;
    };
  };
  user: {
    _id: string;
    username: string;
    avatar?: string;
    email?: string;
  };
}

const statusColour = {
  Pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Accepted: 'bg-green-500/20 text-green-400 border-green-500/30',
  Rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
  FundReleased: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const ClientProposalsPage = () => {
  const { user } = useAuthState();
  const { signer } = useWeb3();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [releaseLoading, setReleaseLoading] = useState<string | null>(null);
  
  // Rating states
  const [ratingData, setRatingData] = useState<{ proposalId: string; userId: string; gigId: string } | null>(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);

  const fetchProposals = async () => {
    if (!user?._id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/proposals/user/${user._id}`
      );
      setProposals(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load your sent proposals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const handleReleaseEscrow = async (proposal: ProposalItem) => {
    if (!signer) {
      toast({ title: 'Wallet Required', description: 'Please connect your Web3 wallet to release funds.', variant: 'destructive' });
      return;
    }

    try {
      setReleaseLoading(proposal._id);
      if (!proposal.escrowAddress || proposal.escrowAddress === "pending-deployment") {
        toast({ title: "Error", description: "No valid escrow address found.", variant: 'destructive' });
        return;
      }
      
      const contract = getEscrowInstance(signer, proposal.escrowAddress);
      
      const tx = await contract.releaseFunds();
      await tx.wait();

      // Persist the status in the backend
      await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals/${proposal._id}/fund-released`);

      toast({ title: 'Funds Released!', description: `The escrow funds have been successfully released to the freelancer.` });
      setProposals(prev => prev.map(p => p._id === proposal._id ? { ...p, status: 'FundReleased' } : p));
      
      // We populated it in getProposalsByUser
      setRatingData({ proposalId: proposal._id, userId: proposal.gig.createdBy._id, gigId: proposal.gig._id });
    } catch (err: any) {
      console.error("Release error:", err);
      toast({ title: 'Release Failed', description: parseEscrowError(err), variant: 'destructive' });
    } finally {
      setReleaseLoading(null);
    }
  };

  const submitRating = async () => {
     if (!ratingData || !ratingData.userId) return;
     setRatingLoading(true);
     try {
       await axios.post(`${import.meta.env.VITE_API_URL}/api/users/${ratingData.userId}/reviews`, {
           reviewerId: user?._id,
           gigId: ratingData.gigId,
           rating: ratingValue,
           comment: ratingComment
       });
       toast({ title: '✅ Rating Submitted', description: 'Thank you for rating the freelancer!' });
       setRatingData(null);
     } catch (err) {
       toast({ title: 'Error', description: 'Failed to submit rating', variant: 'destructive' });
     } finally {
       setRatingLoading(false);
     }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-cyan-400 mb-2">
          Sent Proposals
        </h1>
        <p className="text-muted-foreground">Manage your outgoing proposals and track status across gigs.</p>
      </div>

      {proposals.length === 0 ? (
        <Card className="glass-effect text-center py-16">
          <CardContent>
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Send className="w-8 h-8 text-primary opacity-50" />
              </div>
              <h3 className="text-xl font-semibold">No Sent Proposals</h3>
              <p className="text-muted-foreground w-3/4 mx-auto">
                You haven't submitted any proposals to hire a freelancer yet. 
                Browse active gigs and apply to get started.
              </p>
              <Button className="glow-button mt-4" onClick={() => navigate('/freelance')}>
                Browse Gigs
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {proposals.map((proposal, index) => (
            <motion.div
              key={proposal._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-effect hover:bg-white/5 transition-colors group">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    {/* Left: Gig & Freelancer Details */}
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1 uppercase font-semibold tracking-wider">
                            Proposal Sent to Gig
                          </p>
                          <h3 
                            className="text-xl font-bold hover:text-primary cursor-pointer transition-colors"
                            onClick={() => navigate(`/gig/${proposal.gig._id}`)}
                          >
                            {proposal.gig.title}
                          </h3>
                          {proposal.status === 'FundReleased' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-yellow-500 w-full mt-2"
                              onClick={() => setRatingData({ proposalId: proposal._id, userId: proposal.gig.createdBy._id, gigId: proposal.gig._id })}
                            >
                               <Star className="w-4 h-4 mr-1.5" /> Rate Freelancer
                            </Button>
                          )}
                        </div>
                        <Badge variant="outline" className={`ml-4 ${statusColour[proposal.status] || ''}`}>
                          {proposal.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground border-t border-border-subtle pt-4">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 mr-1 text-primary" />
                          <span className="font-medium text-foreground">${proposal.budget} ETH</span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1 text-primary" />
                          <span className="font-medium text-foreground">{proposal.deliveryTime} Days</span>
                        </div>
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 mr-1 text-primary" />
                          <span>Submitted {new Date(proposal.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 min-w-[200px] justify-center pt-4 md:pt-0 md:border-l md:border-border-subtle md:pl-6">
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="w-full">
                            <Eye className="w-4 h-4 mr-2" />
                            View Letter
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl glass-effect">
                          <DialogHeader>
                            <DialogTitle>Your Proposal Letter</DialogTitle>
                            <DialogDescription>Submitted to the gig: {proposal.gig.title}</DialogDescription>
                          </DialogHeader>
                          <div className="mt-4 p-4 rounded-md bg-muted/50 whitespace-pre-wrap text-sm border min-h-[150px]">
                            {proposal.message || 'No message provided.'}
                          </div>
                        </DialogContent>
                      </Dialog>

                      {proposal.status === "Accepted" && (
                        <Button 
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                          onClick={() => handleReleaseEscrow(proposal)}
                          disabled={releaseLoading === proposal._id}
                        >
                          {releaseLoading === proposal._id ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Releasing...</>
                          ) : (
                            <><CheckCircle2 className="w-4 h-4 mr-2" /> Release Funds</>
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      {/* Rating Dialog */}
      <Dialog open={!!ratingData} onOpenChange={(open) => !open && setRatingData(null)}>
        <DialogContent className="sm:max-w-[425px] glass-effect">
          <DialogHeader>
            <DialogTitle>Rate the Freelancer</DialogTitle>
            <DialogDescription>
              The gig is complete! Please rate your experience with the freelancer.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center gap-2">
               {[1, 2, 3, 4, 5].map(val => (
                  <Star 
                     key={val} 
                     className={`w-8 h-8 cursor-pointer transition-all ${val <= ratingValue ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`}
                     onClick={() => setRatingValue(val)}
                  />
               ))}
            </div>
            <textarea
              className="w-full min-h-[100px] p-3 rounded-md bg-muted/50 border resize-none focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Leave a comment about their work..."
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRatingData(null)}>Cancel</Button>
            <Button className="glow-button" onClick={submitRating} disabled={ratingLoading}>
              {ratingLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Rating
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientProposalsPage;
