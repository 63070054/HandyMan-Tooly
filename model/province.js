const mongoose = require("mongoose");

const provinceSchema = new mongoose.Schema({
  provinceId: { type: Number, unique: true },
  nameTH: String,
  nameEN: String,
});

module.exports = mongoose.model("Province", provinceSchema);