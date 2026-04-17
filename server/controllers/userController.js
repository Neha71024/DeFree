const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, fullName, email, password, location, role, walletAddress, freelancerProfile, clientProfile } = req.body;


    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use" });
    }


    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const user = new User({
      username,
      fullName,
      email,
      password: hashedPassword,
      location,
      role,
      walletAddress,
      freelancerProfile,
      clientProfile
    });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    // Exclude password in response
    const { password: _, ...userWithoutPassword } = user._doc;

    return res.status(201).json({ token, user: userWithoutPassword });
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const { password: _, ...userWithoutPassword } = user._doc;

    return res.json({ token, user: userWithoutPassword });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};


exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { password: _, ...userWithoutPassword } = user._doc;
    res.json(userWithoutPassword);
  } catch (err) {
    res.status(404).json({ error: "User not found" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};


exports.updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const updatedData = req.body;

  try {
    console.log("Updating user:", id, updatedData);
    const updatedUser = await User.findByIdAndUpdate(id, { $set: req.body }, {
      new: true,

      runValidators: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // No need to call save() here
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Error updating user:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.toggleSaveGig = async (req, res) => {
  const { id } = req.params; // userId
  const { gigId } = req.body;

  try {
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isSaved = user.savedGigs.includes(gigId);
    const update = isSaved ? { $pull: { savedGigs: gigId } } : { $addToSet: { savedGigs: gigId } };
    
    const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });
    res.status(200).json({ savedGigs: updatedUser.savedGigs });
  } catch (err) {
    console.error("Error toggling saved gig:", err);
    res.status(500).json({ error: "Server error" });
  }
};

const Review = require("../models/Review.js");

exports.addReview = async (req, res) => {
  try {
    const { id } = req.params; // reviewee
    const { reviewerId, gigId, rating, comment } = req.body;

    // Create review
    const newReview = new Review({
      reviewer: reviewerId,
      reviewee: id,
      gig: gigId,
      rating: Number(rating),
      comment
    });

    await newReview.save();

    // Update user's aggregate rating
    const reviewee = await User.findById(id);
    if (reviewee) {
      const currentTotal = (reviewee.rating || 0) * (reviewee.reviewCount || 0);
      const newCount = (reviewee.reviewCount || 0) + 1;
      const newRating = (currentTotal + Number(rating)) / newCount;

      reviewee.rating = newRating;
      reviewee.reviewCount = newCount;
      await reviewee.save();
    }

    res.status(201).json(newReview);
  } catch (err) {
    res.status(500).json({ error: "Failed to add review" });
  }
};

exports.getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'username avatar email role')
      .populate('gig', 'title')
      .sort('-createdAt');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.params.id;
    const User = require("../models/User.js");
    
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Load other models
    const Gig = require("../models/Gig.js");
    const Proposal = require("../models/Proposal.js");
    const Connection = require("../models/Connection.js");
    const Group = require("../models/Group.js");
    const Message = require("../models/Message.js");
    const Review = require("../models/Review.js");
    
    // Cascade Deletion
    // Delete Gigs created by this user
    await Gig.deleteMany({ freelancer: userId });
    
    // Delete Proposals involving this user (either they proposed or they received)
    await Proposal.deleteMany({ freelancer: userId });
    await Proposal.deleteMany({ client: userId });
    
    // Delete Connections involving this user
    await Connection.deleteMany({ $or: [{ requester: userId }, { recipient: userId }] });
    
    // Delete Messages sent by this user
    await Message.deleteMany({ sender: userId });
    
    // Delete Reviews written by or for this user
    await Review.deleteMany({ $or: [{ reviewer: userId }, { reviewee: userId }] });
    
    // Remove user from Group members and delete Groups they admin
    await Group.updateMany(
      { $or: [{ members: userId }, { pendingMembers: userId }] },
      { $pull: { members: userId, pendingMembers: userId } }
    );
    await Group.deleteMany({ admin: userId });

    // Permanent delete of the user profile, allowing the email to be reused.
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "Account and all associated personal data have been permanently deleted." });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account" });
  }
};
