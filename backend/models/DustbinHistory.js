const mongoose = require("mongoose");

const DustbinHistorySchema = new mongoose.Schema(
  {
    dustbinId: {
      type: Number,
      required: true,
      index: true,
    },
    level: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      enum: ["manual", "upload"],
      default: "upload",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("DustbinHistory", DustbinHistorySchema);
