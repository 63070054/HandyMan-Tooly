const express = require("express");
const Post = require("../model/post");
const Review = require("../model/review");
const router = express.Router();
const { ObjectId } = require("mongoose").Types;

router.get("/", async (req, res) => {
  try {
    const { provinceId, amphureId, tambonId, query } = req.query;

    const posts = await getPosts();

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

    res.json(filteredPosts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

router.get("/:postId", async (req, res) => {
  try {
    const posts = await getPosts(req.params.postId);
    res.json(posts[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error: error.message });
  }
});

const getPosts = async (id) => {
  const aggregates = [
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

  if (id) {
    aggregates.push({
      $match: { _id: new ObjectId(id) }
    })
  }

  const posts = await Post.aggregate(aggregates);

  const userIds = posts.map(post => post.userId._id);

  const reviews = await Review.find({ userId: { $in: userIds } });

  const postsWithReviews = posts.map(post => {
    const averageReview = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    return {
      ...post,
      averageReview
    };
  });

  return await Post.populate(postsWithReviews, { path: 'userId' });
}

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json({ message: "Job posted successfully" });
});

module.exports = router;
