// const express = require("express");
// const mongoose = require("mongoose");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// // MongoDB Connection
// mongoose.connect(
//   process.env.MONGO_URI
// )
// .then(() => console.log("MongoDB Connected"))
// .catch((err) => console.log(err));

// // Test route
// app.get("/", (req, res) => {
//   res.send("Backend running");
// });

// // Start server
// app.listen(5000, () => {
//   console.log("Server running on port 5000");
// });


// const Dustbin = require("./models/Dustbin");

// app.get("/dustbins", async (req, res) => {
//   const bins = await Dustbin.find();
//   res.json(bins);
// });




// app.post("/update-dustbin", async (req, res) => {
//   const { id, level, percentage } = req.body;

//   try {
//     const bin = await Dustbin.findOneAndUpdate(
//       { id: id },
//       {
//         level,
//         percentage,
//         updatedAt: "Just now",
//       },
//       { new: true }
//     );

//     res.json(bin);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });



















const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const dns = require("dns");
const config = require("./config/env");

const app = express();
app.use(cors());
app.use(express.json());

// Import Model
const Dustbin = require("./models/Dustbin");
const DustbinHistory = require("./models/DustbinHistory");
const AdminNotification = require("./models/AdminNotification");
const authRoute = require("./routes/auth");
const uploadRoute = require("./routes/upload");
const { createAdminNotificationIfCritical, isAttentionLevel } = require("./utils/notifications");
const localAdminNotificationStore = require("./utils/localAdminNotificationStore");

try {
  dns.setServers(config.dnsServers);
} catch (dnsErr) {
  console.warn("DNS server setup notice:", dnsErr.message);
}

const defaultBins = [
  { id: 1, lat: 19.02305, lng: 72.85555, level: "half-full", percentage: 50, updatedAt: "10 mins ago" },
  { id: 2, lat: 19.0217, lng: 72.8556, level: "empty", percentage: 15, updatedAt: "25 mins ago" },
  { id: 3, lat: 19.0197, lng: 72.8559, level: "full", percentage: 95, updatedAt: "5 mins ago" },
  { id: 4, lat: 19.0209, lng: 72.8560, level: "half-full", percentage: 65, updatedAt: "1 hour ago" },
  { id: 5, lat: 19.0226, lng: 72.8564, level: "empty", percentage: 20, updatedAt: "2 hours ago" },
  { id: 6, lat: 19.0239, lng: 72.8568, level: "overflowing", percentage: 100, updatedAt: "Just now" },
];

async function seedIfEmpty() {
  try {
    const binCount = await Dustbin.countDocuments();
    if (binCount === 0) {
      await Dustbin.insertMany(defaultBins);
      console.log("Auto-seeded dustbins");
    }

    const historyCount = await DustbinHistory.countDocuments();
    if (historyCount === 0) {
      const now = new Date();
      const sampleHistory = defaultBins.map((bin) => ({
        dustbinId: bin.id,
        level: bin.level,
        percentage: bin.percentage,
        source: "manual",
        createdAt: now,
      }));
      await DustbinHistory.insertMany(sampleHistory);
      console.log("Auto-seeded dustbin history");
    }
  } catch (err) {
    console.error("Auto-seed error:", err);
  }
}

// MongoDB Connection
mongoose.connect(config.mongoUri)
.then(() => {
  console.log("MongoDB Connected");
  seedIfEmpty();
})
.catch((err) => console.log(err));


// ---------------- ROUTES ---------------- //

// Test route
app.get("/", (req, res) => {
  res.send("Backend running");
});

app.use("/auth", authRoute);
app.use("/upload", uploadRoute);

function isMongoConnected() {
  return mongoose.connection.readyState === 1;
}

function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const payload = jwt.verify(token, config.jwtSecret);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    req.auth = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

function createNotificationPayload(bin, source = "current-status") {
  const dbId = String(bin.id).padStart(3, "0");
  const percentage = Number(bin.percentage) || 0;
  const levelText = bin.level === "half-full" ? "half full" : bin.level;

  return {
    dustbinId: bin.id,
    level: bin.level,
    percentage,
    lat: Number(bin.lat) || 0,
    lng: Number(bin.lng) || 0,
    source,
    message: `Dustbin DB-${dbId} is ${levelText} at ${percentage}%`,
  };
}

async function getCurrentAdminNotifications(limit) {
  const attentionBins = (await Dustbin.find().lean()).filter((bin) => isAttentionLevel(bin.level));
  const notifications = [];

  for (const bin of attentionBins) {
    const existing = await AdminNotification.findOne({
      dustbinId: bin.id,
      level: bin.level,
      percentage: Number(bin.percentage) || 0,
    }).sort({ createdAt: -1 });

    if (existing) {
      notifications.push(existing.toObject());
      continue;
    }

    const created = await AdminNotification.create(createNotificationPayload(bin));
    notifications.push(created.toObject());
  }

  const sorted = notifications.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    notifications: sorted.slice(0, limit),
    unreadCount: sorted.filter((notification) => !notification.isRead).length,
  };
}

// // Get all dustbins
app.get("/dustbins", async (req, res) => {
  try {
    let bins = await Dustbin.find().lean();
    if (!bins || bins.length === 0) {
      bins = defaultBins;
    }
    res.json(bins);
  } catch (err) {
    res.json(defaultBins);
  }
});

// Update dustbin status
app.post("/update-dustbin", async (req, res) => {
  const { id, level, percentage } = req.body;
  const parsedId = Number(id);
  const parsedPercentage = Number(percentage);

  if (!parsedId || Number.isNaN(parsedId)) {
    return res.status(400).json({ error: "Valid dustbin id is required" });
  }

  if (Number.isNaN(parsedPercentage)) {
    return res.status(400).json({ error: "Valid percentage is required" });
  }

  try {
    const previousBin = await Dustbin.findOne({ id: parsedId });
    if (!previousBin) {
      return res.status(404).json({ message: "Dustbin not found" });
    }

    const bin = await Dustbin.findOneAndUpdate(
      { id: parsedId },
      {
        level: level,
        percentage: parsedPercentage,
        updatedAt: "Just now",
      },
      { new: true }
    );

    await DustbinHistory.create({
      dustbinId: parsedId,
      level: level || "unknown",
      percentage: parsedPercentage,
      source: "manual",
    });

    await createAdminNotificationIfCritical({
      previousBin,
      updatedBin: bin,
      source: "manual",
    });

    res.json(bin);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/admin/notifications", requireAdmin, async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    if (!isMongoConnected()) {
      return res.json({
        notifications: localAdminNotificationStore.listNotifications(limit),
        unreadCount: localAdminNotificationStore.countUnread(),
      });
    }

    res.json(await getCurrentAdminNotifications(limit));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch admin notifications" });
  }
});

app.patch("/admin/notifications/:id/read", requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      const updated = localAdminNotificationStore.markRead(req.params.id);
      if (!updated) {
        return res.status(404).json({ error: "Notification not found" });
      }

      return res.json({ notification: updated });
    }

    const updated = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true },
    );

    if (!updated) {
      return res.status(404).json({ error: "Notification not found" });
    }

    return res.json({ notification: updated });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update notification" });
  }
});

app.patch("/admin/notifications/read-all", requireAdmin, async (req, res) => {
  try {
    if (!isMongoConnected()) {
      localAdminNotificationStore.markAllRead();
      return res.json({ success: true });
    }

    await AdminNotification.updateMany({ isRead: false }, { isRead: true });
    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update notifications" });
  }
});

const defaultStats = {
  metrics: {
    totalDustbins: 6,
    avgFillLevel: 57,
    needAttention: 2,
    collectionsToday: 4,
  },
  fillLevelTrend: [
    { date: "Mon 21", level: 45 },
    { date: "Tue 22", level: 50 },
    { date: "Wed 23", level: 48 },
    { date: "Thu 24", level: 62 },
    { date: "Fri 25", level: 55 },
    { date: "Sat 26", level: 58 },
    { date: "Sun 27", level: 57 },
  ],
  collectionData: [
    { zone: "Zone A", collections: 12 },
    { zone: "Zone B", collections: 8 },
    { zone: "Zone C", collections: 15 },
    { zone: "Zone D", collections: 6 },
  ],
  statusDistribution: [
    { name: "Normal", value: 3, color: "#22c55e" },
    { name: "Attention", value: 2, color: "#eab308" },
    { name: "Critical", value: 1, color: "#ef4444" },
    { name: "Offline", value: 0, color: "#94a3b8" },
  ],
  recentActivity: [
    { dustbinId: "DB-006", status: "critical", message: "Critical level", time: "Just now" },
    { dustbinId: "DB-003", status: "critical", message: "Critical level", time: "5 mins ago" },
    { dustbinId: "DB-001", status: "normal", message: "50% full", time: "10 mins ago" },
    { dustbinId: "DB-004", status: "attention", message: "65% full", time: "1 hour ago" },
  ],
};

app.get("/dashboard-stats", async (req, res) => {
  try {
    let bins = await Dustbin.find().lean();
    let history = await DustbinHistory.find().sort({ createdAt: -1 }).lean();

    if (!bins || bins.length === 0) {
      bins = defaultBins;
    }

    const totalDustbins = bins.length;
    const avgFillLevel = totalDustbins
      ? Math.round(bins.reduce((sum, bin) => sum + (Number(bin.percentage) || 0), 0) / totalDustbins)
      : 0;
    const needAttention = bins.filter((bin) => (Number(bin.percentage) || 0) >= 70).length;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const collectionsToday = history.filter((entry) => {
      const createdAt = new Date(entry.createdAt);
      return createdAt >= startOfToday && (Number(entry.percentage) || 0) <= 20;
    }).length;

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const fillLevelTrend = [];
    const trendMap = new Map();
    for (let i = 6; i >= 0; i -= 1) {
      const day = new Date(now);
      day.setHours(0, 0, 0, 0);
      day.setDate(now.getDate() - i);
      const key = day.toISOString().slice(0, 10);
      trendMap.set(key, {
        date: `${dayNames[day.getDay()]} ${day.getDate()}`,
        sum: 0,
        count: 0,
      });
    }

    history.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const key = date.toISOString().slice(0, 10);
      if (!trendMap.has(key)) return;

      const bucket = trendMap.get(key);
      bucket.sum += Number(entry.percentage) || 0;
      bucket.count += 1;
    });

    trendMap.forEach((value) => {
      fillLevelTrend.push({
        date: value.date,
        level: value.count ? Math.round(value.sum / value.count) : 0,
      });
    });

    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const zoneCounts = {
      "Zone A": 0,
      "Zone B": 0,
      "Zone C": 0,
      "Zone D": 0,
    };
    history.forEach((entry) => {
      const createdAt = new Date(entry.createdAt);
      if (createdAt < weekAgo) return;

      const dustbinId = Number(entry.dustbinId) || 0;
      const mod = ((dustbinId - 1) % 4 + 4) % 4;
      if (mod === 0) zoneCounts["Zone A"] += 1;
      if (mod === 1) zoneCounts["Zone B"] += 1;
      if (mod === 2) zoneCounts["Zone C"] += 1;
      if (mod === 3) zoneCounts["Zone D"] += 1;
    });
    const collectionData = Object.entries(zoneCounts).map(([zone, collections]) => ({ zone, collections }));

    const statusCounts = {
      Normal: 0,
      Attention: 0,
      Critical: 0,
      Offline: 0,
    };
    bins.forEach((bin) => {
      const pct = Number(bin.percentage) || 0;
      if (pct >= 90) statusCounts.Critical += 1;
      else if (pct >= 70) statusCounts.Attention += 1;
      else statusCounts.Normal += 1;
    });

    const statusDistribution = [
      { name: "Normal", value: statusCounts.Normal, color: "#22c55e" },
      { name: "Attention", value: statusCounts.Attention, color: "#eab308" },
      { name: "Critical", value: statusCounts.Critical, color: "#ef4444" },
      { name: "Offline", value: statusCounts.Offline, color: "#94a3b8" },
    ];

    const recentActivity = history.slice(0, 8).map((entry) => {
      const pct = Number(entry.percentage) || 0;
      const status = pct >= 90 ? "critical" : pct >= 70 ? "attention" : "normal";
      const message = pct >= 90 ? "Critical level" : `${pct}% full`;

      return {
        dustbinId: `DB-${String(entry.dustbinId).padStart(3, "0")}`,
        status,
        message,
        time: new Date(entry.createdAt).toLocaleString(),
      };
    });

    res.json({
      metrics: {
        totalDustbins,
        avgFillLevel,
        needAttention,
        collectionsToday,
      },
      fillLevelTrend,
      collectionData,
      statusDistribution,
      recentActivity,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.json(defaultStats);
  }
});


// ---------------- START SERVER ---------------- //
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
