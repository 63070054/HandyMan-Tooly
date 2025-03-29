const express = require("express");
const Review = require("../model/review");
const router = express.Router();

router.post("/", async (req, res) => {
  const { reviewerId, userId } = req.body;

  try {
    const existingReview = await Review.findOne({ reviewerId, userId });

    if (existingReview) {
      return res.status(400).json({ error: "This reviewer has already reviewed this user" });
    }

    const newReview = new Review(req.body);
    await newReview.save();
    res.json({ message: "Review added" });
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;
