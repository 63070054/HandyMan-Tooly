const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    unique: true 
  },
  phone: { 
    type: String, 
    unique: true 
  },
  password: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: true,
    default: function() {
      return `https://robohash.org/${this._id}.png`; // Automatically set the imageUrl when user is created
    }
  },
});

module.exports = mongoose.model("User", userSchema);
