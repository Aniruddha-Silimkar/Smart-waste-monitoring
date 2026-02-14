const mongoose = require("mongoose");

const DustbinSchema = new mongoose.Schema({
  id: Number,
  lat: Number,
  lng: Number,
  level: {
    type: String,
    default: "empty",
  },
  percentage: {
    type: Number,
    default: 0,
  },
  updatedAt: {
    type: String,
    default: "Just now",
  },
});

module.exports = mongoose.model("Dustbin", DustbinSchema);
