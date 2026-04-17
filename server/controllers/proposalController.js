const Proposal = require("../models/Proposal");
const Gig = require("../models/Gig");
const notificationService = require('../services/notificationService');
const logActivity = require('../utils/logActivity');

exports.createProposalWithEscrow = async (req, res) => {
  try {
    const { gigId, userId, coverLetter, proposedBudget, deliveryTime, escrowAddress } = req.body;

    // Basic validation
    if (!gigId || !userId || !coverLetter || !proposedBudget || !deliveryTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if gig exists
    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    // Create proposal
    const proposal = await Proposal.create({
      user: userId,
      gig: gigId,
      message: coverLetter,
      budget: proposedBudget,
      deliveryTime,
      escrowAddress,
      status: "Pending",
    });
    await logActivity({
      userId: gig.createdBy.toString(),
      actionTitle: "New proposal received",
      context: gig.title,
      status: "pending"
    });
    // Ensure gig.proposals is an array
    if (!Array.isArray(gig.proposals)) {
      gig.proposals = [];
    }

    gig.proposals.push(proposal._id);
    await gig.save();

    await notificationService.createAndSendNotification({
      userId: gig.createdBy.toString(),
      type: 'gig',
      title: 'New Proposal Received',
      message: `You received a new proposal for your gig '${gig.title}'.`,
      sourceId: gig._id,
      actionUrl: `/gig/${gig._id}`
    });
    // Notify proposal creator (for demo)
    await notificationService.createAndSendNotification({
      userId: userId,
      type: 'gig',
      title: 'Proposal Submitted',
      message: `Your proposal for gig '${gig.title}' has been submitted.`,
      sourceId: gig._id,
      actionUrl: `/gig/${gig._id}`
    });

    return res.status(201).json(proposal);
  } catch (err) {
    console.error("❌ Error creating proposal with escrow:", err);
    return res.status(500).json({ message: "Failed to create proposal with escrow" });
  }
};

exports.getProposalsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const proposals = await Proposal.find({ user: userId }).populate({ path: 'gig', populate: { path: 'createdBy' } });
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProposalsByGig = async (req, res) => {
  try {
    const gigId = req.params.gigId;
    const proposals = await Proposal.find({ gig: gigId }).populate('user', 'username avatar rating');
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.acceptProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate('gig');
    if (!proposal) return res.status(404).json({ error: "Proposal not found" });

    // Guard: prevent accepting if the gig already has an accepted proposal
    const gig = proposal.gig;
    if (gig && gig.status !== 'open') {
      return res.status(400).json({ error: "This gig already has an accepted proposal. Only one proposal can be accepted per gig." });
    }

    if (req.body?.escrowAddress) {
      proposal.escrowAddress = req.body.escrowAddress;
    }
    proposal.status = "Accepted";
    await proposal.save();

    // Update gig status
    if (gig) {
      gig.status = "in progress";
      gig.assignedTo = proposal.user;
      await gig.save();
    }

    // Notify client (the proposal submitter)
    await notificationService.createAndSendNotification({
      userId: proposal.user.toString(),
      type: 'gig',
      title: 'Proposal Accepted!',
      message: `Your proposal for the gig '${gig?.title}' was accepted.`,
      sourceId: proposal._id,
      actionUrl: `/gig/${gig?._id}`
    });

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.rejectProposal = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate('gig');
    if (!proposal) return res.status(404).json({ error: "Proposal not found" });

    proposal.status = "Rejected";
    await proposal.save();

    // Notify freelancer
    const gig = proposal.gig;
    await notificationService.createAndSendNotification({
      userId: proposal.user.toString(),
      type: 'gig',
      title: 'Proposal Rejected',
      message: `Your proposal for the gig '${gig?.title}' was not accepted.`,
      sourceId: proposal._id,
      actionUrl: `/gig/${gig?._id}`
    });

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get ALL proposals for all gigs owned by a given user (freelancer inbox)
exports.getProposalsByOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    // Find all gigs owned by this user
    const gigs = await Gig.find({ createdBy: ownerId }, '_id title category minBudget maxBudget');
    const gigIds = gigs.map(g => g._id);

    if (gigIds.length === 0) return res.json([]);

    // Get all proposals for those gigs
    const proposals = await Proposal
      .find({ gig: { $in: gigIds } })
      .populate('user', 'username avatar email walletAddress')
      .populate('gig', 'title category minBudget maxBudget')
      .sort({ submittedAt: -1 });

    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.fundReleased = async (req, res) => {
  try {
    const { proposalId } = req.params;
    const proposal = await Proposal.findById(proposalId).populate('gig');
    if (!proposal) return res.status(404).json({ error: "Proposal not found" });

    proposal.status = "FundReleased";
    await proposal.save();

    // Mark gig as completed
    const gig = proposal.gig;
    if (gig) {
      gig.status = "completed";
      await gig.save();
    }

    // Notify freelancer
    await notificationService.createAndSendNotification({
      userId: proposal.user.toString(),
      type: 'gig',
      title: 'Funds Released!',
      message: `The funds for gig '${gig?.title}' have been released.`,
      sourceId: proposal._id,
      actionUrl: `/gig/${gig?._id}`
    });

    res.json(proposal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};