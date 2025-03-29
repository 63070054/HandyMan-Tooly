const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    require: true,
    ref: "User"
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  services: [String],
  provinceId: Number,
  amphureId: Number,
  tambonId: Number,
  minimumPrice: Number,
  maximumPrice: Number,
});
module.exports = mongoose.model("Post", postSchema);