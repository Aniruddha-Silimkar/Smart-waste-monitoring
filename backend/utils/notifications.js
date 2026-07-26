const AdminNotification = require("../models/AdminNotification");
const mongoose = require("mongoose");
const localAdminNotificationStore = require("./localAdminNotificationStore");

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function isAttentionLevel(level) {
  return level === "half" || level === "half-full" || level === "full" || level === "overflowing";
}

async function createAdminNotificationIfCritical({ previousBin, updatedBin, source }) {
  if (!updatedBin || !isAttentionLevel(updatedBin.level)) return;

  const dbId = String(updatedBin.id).padStart(3, "0");
  const percentage = Number(updatedBin.percentage) || 0;
  const levelText = updatedBin.level === "half-full" ? "half full" : updatedBin.level;
  const message = `Dustbin DB-${dbId} is ${levelText} at ${percentage}%`;
  const notification = {
    dustbinId: updatedBin.id,
    level: updatedBin.level,
    percentage,
    lat: Number(updatedBin.lat) || 0,
    lng: Number(updatedBin.lng) || 0,
    source: source || "upload",
    message,
  };

  localAdminNotificationStore.createNotification(notification);

  if (isMongoConnected()) {
    try {
      await AdminNotification.create(notification);
    } catch (err) {
      console.warn("MongoDB AdminNotification create notice:", err.message);
    }
  }
}

module.exports = {
  createAdminNotificationIfCritical,
  isAttentionLevel,
};
