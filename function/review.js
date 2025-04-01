const express = require("express");
const Review = require("../model/review");
const router = express.Router();
const { ObjectId } = require("mongoose").Types;

router.post("/", async (req, res) => {
  const { reviewerId, userId } = req.body;

  const objectReviewerId = new ObjectId(reviewerId);
  const objectUserId = new ObjectId(userId);

  try {
    const existingReview = await Review.findOne({ reviewerId: objectReviewerId, userId: objectUserId });

    if (existingReview) {
      return res.status(400).json({ error: "This reviewer has already reviewed this user" });
    }

    const newReview = new Review({
      ...req.body,
      reviewerId: objectReviewerId,
      userId: objectUserId,
    });
    await newReview.save();
    res.json({ message: "Review added" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
