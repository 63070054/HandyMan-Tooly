const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  review: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5']
  }
});

module.exports = mongoose.model("Review", reviewSchema);