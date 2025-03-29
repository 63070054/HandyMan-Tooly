const mongoose = require("mongoose");

const tambonSchema = new mongoose.Schema({
    tambonId: { type: Number, unique: true },
    amphureId: { type: Number, require: true },
    nameTH: String,
    nameEN: String,
});

module.exports = mongoose.model("Tambon", tambonSchema);