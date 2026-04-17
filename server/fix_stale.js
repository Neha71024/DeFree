const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Proposal = require("./models/Proposal");

async function fixStaleProposals() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const result = await Proposal.updateMany({ status: "Accepted" }, { status: "FundReleased" });
    console.log(`Successfully updated ${result.modifiedCount} proposals from Accepted to FundReleased.`);
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

fixStaleProposals();
