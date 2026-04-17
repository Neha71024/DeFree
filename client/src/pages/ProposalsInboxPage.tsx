import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
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
  Briefcase, CheckCircle2, XCircle, Clock, DollarSign,
  FileText, User, AlertCircle, Loader2,
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

const ProposalsInboxPage = () => {
  const { user } = useAuthState();
  const { toast } = useToast();
  const { signer } = useWeb3();
  const navigate = useNavigate();

  const [proposals, setProposals] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  const fetchProposals = async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/proposals/owner/${user._id}`
      );
      setProposals(res.data);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error', description: 'Failed to load proposals', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [user]);

  const handleAccept = async (proposalId: string, gigTitle: string) => {
    // Check if any proposal for this gig is already accepted
    const proposal = proposals.find(p => p._id === proposalId);
    if (proposal) {
      const gigId = proposal.gig?._id;
      const alreadyAccepted = proposals.some(
        p => p.gig?._id === gigId && p.status === 'Accepted'
      );
      if (alreadyAccepted) {
        toast({ 
          title: 'Already Accepted', 
          description: `You have already accepted a proposal for "${gigTitle}". Only one proposal can be accepted per gig.`, 
          variant: 'destructive' 
        });
        return;
      }
    }

    setActionLoading(proposalId);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals/${proposalId}/accept`);
      toast({ title: '✅ Proposal Accepted', description: `You accepted a proposal for "${gigTitle}". The client has been notified.` });
      setProposals(prev =>
        prev.map(p => p._id === proposalId ? { ...p, status: 'Accepted' } : p)
      );
    } catch (err: any) {
      toast({ title: 'Error', description: err.response?.data?.error || 'Failed to accept proposal', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: string, gigTitle: string) => {
    const proposal = proposals.find(p => p._id === proposalId);
    setActionLoading(proposalId);

    // If proposal has an escrow, refund it on-chain first
    if (proposal?.escrowAddress && proposal.escrowAddress !== 'pending-deployment') {
      if (!signer) {
        toast({ title: 'Wallet Required', description: 'Please connect your wallet to refund the escrow.', variant: 'destructive' });
        setActionLoading(null);
        return;
      }

      try {
        toast({ title: 'Refunding Escrow', description: 'Please confirm the transaction to refund the client\'s locked ETH.' });
        const escrowContract = getEscrowInstance(signer, proposal.escrowAddress);
        const tx = await escrowContract.refundFunds();
        await tx.wait();
        toast({ title: '💸 Escrow Refunded', description: 'The client\'s ETH has been returned to their wallet.' });
      } catch (err: any) {
        const errMsg = parseEscrowError(err);
        // If funds were already released/refunded, still proceed with rejection
        if (!errMsg.includes('already been released')) {
          toast({ title: 'Refund Failed', description: errMsg, variant: 'destructive' });
          setActionLoading(null);
          return;
        }
      }
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/api/proposals/${proposalId}/reject`);
      toast({ title: 'Proposal Rejected', description: `You rejected a proposal for "${gigTitle}". The client has been notified.` });
      setProposals(prev =>
        prev.map(p => p._id === proposalId ? { ...p, status: 'Rejected' } : p)
      );
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to reject proposal', variant: 'destructive' });
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = filter === 'all' ? proposals : proposals.filter(p => p.status === filter);

  const counts = {
    all: proposals.length,
    Pending: proposals.filter(p => p.status === 'Pending').length,
    Accepted: proposals.filter(p => p.status === 'Accepted').length,
    Rejected: proposals.filter(p => p.status === 'Rejected').length,
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Proposal Inbox
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage all proposals submitted to your gigs
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {(['all', 'Pending', 'Accepted', 'Rejected'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                filter === f
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
              }`}
            >
              {f === 'all' ? 'All' : f}
              <span className="ml-1.5 text-xs opacity-70">({counts[f] ?? 0})</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Summary cards */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
      >
        {[
          { label: 'Total', value: counts.all, icon: FileText, colour: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pending', value: counts.Pending, icon: Clock, colour: 'text-yellow-500', bg: 'bg-yellow-500/10' },
          { label: 'Accepted', value: counts.Accepted, icon: CheckCircle2, colour: 'text-green-500', bg: 'bg-green-500/10' },
          { label: 'Rejected', value: counts.Rejected, icon: XCircle, colour: 'text-red-500', bg: 'bg-red-500/10' },
        ].map(({ label, value, icon: Icon, colour, bg }) => (
          <Card key={label} className="glass-effect">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2 rounded-lg ${bg}`}>
                <Icon className={`w-5 h-5 ${colour}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Proposals list */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-24 text-center"
        >
          <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No proposals yet</h3>
          <p className="text-muted-foreground max-w-sm">
            {filter === 'all'
              ? 'No clients have applied to your gigs yet. Make sure your gigs are published!'
              : `No ${filter.toLowerCase()} proposals found.`}
          </p>
          <Button className="mt-6" onClick={() => navigate('/freelance/create')}>
            Create a Gig
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-4">
            {filtered.map((proposal, i) => (
              <motion.div
                key={proposal._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.97 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              >
                <Card className="glass-effect border hover:border-primary/30 transition-all duration-200">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Client info */}
                      <div className="flex items-start gap-4 min-w-0 flex-1">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={proposal.user?.avatar} />
                          <AvatarFallback>
                            {proposal.user?.username?.charAt(0)?.toUpperCase() ?? 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-lg">
                              {proposal.user?.username ?? 'Unknown User'}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColour[proposal.status]}`}
                            >
                              {proposal.status}
                            </span>
                          </div>

                          {/* Gig info */}
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
                            <span
                              className="truncate cursor-pointer hover:text-primary transition-colors"
                              onClick={() => navigate(`/gig/${proposal.gig?._id}`)}
                            >
                              {proposal.gig?.title ?? 'Unknown Gig'}
                            </span>
                          </div>

                          {/* Cover letter */}
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                            {proposal.message}
                          </p>

                          {/* Meta */}
                          <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-foreground">{proposal.budget} ETH</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Clock className="w-4 h-4 text-blue-500" />
                              <span>{proposal.deliveryTime} days delivery</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <User className="w-4 h-4" />
                              <span>
                                Applied{' '}
                                {new Date(proposal.submittedAt).toLocaleDateString('en-US', {
                                  month: 'short', day: 'numeric', year: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      {proposal.status === 'Pending' && (
                        <div className="flex flex-row lg:flex-col gap-3 items-center lg:items-end justify-end lg:justify-start flex-shrink-0">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white min-w-[110px]"
                            disabled={actionLoading === proposal._id}
                            onClick={() => handleAccept(proposal._id, proposal.gig?.title ?? 'this gig')}
                          >
                            {actionLoading === proposal._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                                Accept
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500/50 text-red-500 hover:bg-red-500/10 min-w-[110px]"
                            disabled={actionLoading === proposal._id}
                            onClick={() => handleReject(proposal._id, proposal.gig?.title ?? 'this gig')}
                          >
                            {actionLoading === proposal._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <>
                                <XCircle className="w-4 h-4 mr-1.5" />
                                Reject
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      {proposal.status === 'Accepted' && (
                        <div className="flex flex-col gap-2 items-end flex-shrink-0">
                          <div className="flex items-center gap-2 text-green-500 font-semibold">
                            <CheckCircle2 className="w-5 h-5" />
                            Accepted
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/gig/${proposal.gig?._id}`)}
                          >
                            View Gig
                          </Button>
                        </div>
                      )}

                      {proposal.status === 'Rejected' && (
                        <div className="flex items-center gap-2 text-red-500 font-semibold flex-shrink-0">
                          <XCircle className="w-5 h-5" />
                          Rejected
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default ProposalsInboxPage;
