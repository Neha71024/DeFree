const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserProfile);
router.put("/:id", userController.updateUserProfile);
router.post("/:id/reviews", userController.addReview);
router.get("/:id/reviews", userController.getUserReviews);
router.post("/:id/save-gig", userController.toggleSaveGig);
router.delete("/:id", userController.deleteAccount);

module.exports = router;