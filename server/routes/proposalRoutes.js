const express = require("express");
const router = express.Router();
const proposalController = require("../controllers/proposalController");

router.post("/", proposalController.createProposalWithEscrow);
router.get("/user/:userId", proposalController.getProposalsByUser);
router.get("/gig/:gigId", proposalController.getProposalsByGig);
router.get("/owner/:ownerId", proposalController.getProposalsByOwner);
router.post("/:proposalId/accept", proposalController.acceptProposal);
router.post("/:proposalId/reject", proposalController.rejectProposal);
router.post("/:proposalId/fund-released", proposalController.fundReleased);

module.exports = router;

