const mongoose = require("mongoose");

const AdminNotificationSchema = new mongoose.Schema(
  {
    dustbinId: {
      type: Number,
      required: true,
      index: true,
    },
    level: {
      type: String,
      enum: ["half", "half-full", "full", "overflowing"],
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    lat: {
      type: Number,
      required: true,
    },
    lng: {
      type: Number,
      required: true,
    },
    source: {
      type: String,
      enum: ["manual", "upload", "current-status"],
      default: "upload",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("AdminNotification", AdminNotificationSchema);
