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

mongoose.set("bufferCommands", false);

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
mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 5000 })
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

const memoryStore = require("./utils/memoryStore");

// Get all dustbins
app.get("/dustbins", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bins = await Dustbin.find().lean();
      if (bins && bins.length > 0) {
        memoryStore.updateBinsFromDb(bins);
      }
    }
  } catch (err) {
    console.warn("MongoDB dustbins fetch notice:", err.message);
  }
  res.json(memoryStore.getBins());
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

  const updatedItem = memoryStore.updateBin({
    id: parsedId,
    level,
    percentage: parsedPercentage,
  });

  if (mongoose.connection.readyState === 1) {
    try {
      const previousBin = await Dustbin.findOne({ id: parsedId });
      await Dustbin.findOneAndUpdate(
        { id: parsedId },
        {
          id: parsedId,
          level,
          percentage: parsedPercentage,
          updatedAt: "Just now",
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );

      await DustbinHistory.create({
        dustbinId: parsedId,
        level,
        percentage: parsedPercentage,
        source: "manual",
      });

      if (previousBin) {
        await createAdminNotificationIfCritical({
          previousBin: previousBin.toObject(),
          updatedBin: updatedItem,
          source: "manual",
        });
      }
    } catch (err) {
      console.warn("MongoDB update-dustbin notice:", err.message);
    }
  }

  res.json(updatedItem);
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

app.get("/dashboard-stats", async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const bins = await Dustbin.find().lean();
      if (bins && bins.length > 0) {
        memoryStore.updateBinsFromDb(bins);
      }
    }
  } catch (err) {
    console.warn("MongoDB dashboard-stats fetch notice:", err.message);
  }

  res.json(memoryStore.getStats());
});


// ---------------- START SERVER ---------------- //
app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});
