const bcrypt = require("bcryptjs");
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Review = require("../model/review");
const Post = require("../model/post");
const router = express.Router();
const { ObjectId } = require("mongoose").Types;

router.post("/register", async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ error: "Passwords do not match" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = new User({ name, email, phone, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const token = jwt.sign({ userId: user.id }, "secretkey");
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.get("/me", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, "secretkey");
    const userData = await getUserById(decoded.userId, req);
    res.json(userData);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

router.put("/me", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  const { name, email, phone } = req.body;

  try {
    const decoded = jwt.verify(token, "secretkey");
    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      { name, email, phone },
      { new: true, runValidators: true } // Return updated user & apply schema validation
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const userData = await getUserById(id, req);
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error });
  }
});

const getUserById = async (id, request) => {
  const { provinceId, amphureId, tambonId, query } = request.query;
  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const reviews = await Review.find({ userId: user.id })
    .populate("reviewerId")
    .exec();

  const averageReview = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const aggregates = [
    {
      $match: { userId: new ObjectId(id) }
    },
    {
      $lookup: {
        from: "provinces",
        localField: "provinceId",
        foreignField: "provinceId",
        as: "province"
      }
    },
    { $unwind: { path: "$province", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "amphures",
        localField: "amphureId",
        foreignField: "amphureId",
        as: "amphure"
      }
    },
    { $unwind: { path: "$amphure", preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: "tambons",
        localField: "tambonId",
        foreignField: "tambonId",
        as: "tambon"
      }
    },
    { $unwind: { path: "$tambon", preserveNullAndEmptyArrays: true } },
  ]

  const posts = await Post.aggregate(aggregates);

  const filteredPosts = posts.filter(post => {
    let isValid = true;

    if (provinceId) {
      isValid = isValid && post.provinceId === parseInt(provinceId);
    }

    if (amphureId) {
      isValid = isValid && post.amphureId === parseInt(amphureId);
    }

    if (tambonId) {
      isValid = isValid && post.tambonId === parseInt(tambonId);
    }

    if (query) {
      isValid = isValid && (post.title.includes(query) || post.services.some(service => service.includes(query)) || post.userId.name.includes(query));
    }

    return isValid;
  });

  const userData = {
    ...user.toObject(),
    averageReview,
    reviews: reviews.map(review => ({
      reviewerId: review.reviewerId.id,
      reviewerName: review.reviewerId.name,
      reviewerImage: review.reviewerId.imageUrl,
      review: review.review,
      rating: review.rating
    })),
    posts: filteredPosts,
  };

  return userData;
}

module.exports = router;