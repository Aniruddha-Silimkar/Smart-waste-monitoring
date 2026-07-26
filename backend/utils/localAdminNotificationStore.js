const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DATA_FILE = path.join(__dirname, "..", "local-admin-notifications.json");

const defaultNotifications = [
  {
    _id: "init-notif-6",
    dustbinId: 6,
    level: "overflowing",
    percentage: 100,
    lat: 19.0239,
    lng: 72.8568,
    source: "manual",
    message: "Dustbin DB-006 is overflowing at 100%",
    isRead: false,
    createdAt: new Date(Date.now() - 60000).toISOString(),
    updatedAt: new Date(Date.now() - 60000).toISOString(),
  },
  {
    _id: "init-notif-3",
    dustbinId: 3,
    level: "full",
    percentage: 95,
    lat: 19.0197,
    lng: 72.8559,
    source: "manual",
    message: "Dustbin DB-003 is full at 95%",
    isRead: false,
    createdAt: new Date(Date.now() - 300000).toISOString(),
    updatedAt: new Date(Date.now() - 300000).toISOString(),
  },
];

function readNotifications() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      writeNotifications(defaultNotifications);
      return defaultNotifications;
    }

    const raw = fs.readFileSync(DATA_FILE, "utf8");
    const parsed = raw ? JSON.parse(raw) : [];
    return parsed.length > 0 ? parsed : defaultNotifications;
  } catch (error) {
    console.error("Local notification store read error:", error);
    return defaultNotifications;
  }
}

function writeNotifications(notifications) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(notifications, null, 2));
}

function createNotification(data) {
  const notifications = readNotifications();
  const now = new Date().toISOString();
  const notification = {
    _id: crypto.randomUUID(),
    ...data,
    isRead: false,
    createdAt: now,
    updatedAt: now,
  };

  notifications.push(notification);
  writeNotifications(notifications);
  return notification;
}

function listNotifications(limit = 20) {
  return readNotifications()
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function countUnread() {
  return readNotifications().filter((notification) => !notification.isRead).length;
}

function markRead(id) {
  const notifications = readNotifications();
  const index = notifications.findIndex((notification) => notification._id === id);
  if (index === -1) return null;

  notifications[index] = {
    ...notifications[index],
    isRead: true,
    updatedAt: new Date().toISOString(),
  };
  writeNotifications(notifications);
  return notifications[index];
}

function markAllRead() {
  const now = new Date().toISOString();
  const notifications = readNotifications().map((notification) => ({
    ...notification,
    isRead: true,
    updatedAt: now,
  }));
  writeNotifications(notifications);
}

module.exports = {
  countUnread,
  createNotification,
  listNotifications,
  markAllRead,
  markRead,
};
