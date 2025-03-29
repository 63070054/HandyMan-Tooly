const mongoose = require("mongoose");

const amphureSchema = new mongoose.Schema({
    amphureId: { type: Number, unique: true },
    provinceId: { type: Number, require: true },
    nameTH: String,
    nameEN: String,
  });

  module.exports = mongoose.model("Amphure", amphureSchema);