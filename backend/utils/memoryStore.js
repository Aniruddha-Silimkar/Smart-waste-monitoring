const defaultBins = [
  { id: 1, lat: 19.02305, lng: 72.85555, level: "half-full", percentage: 50, updatedAt: "10 mins ago" },
  { id: 2, lat: 19.0217, lng: 72.8556, level: "empty", percentage: 15, updatedAt: "25 mins ago" },
  { id: 3, lat: 19.0197, lng: 72.8559, level: "full", percentage: 95, updatedAt: "5 mins ago" },
  { id: 4, lat: 19.0209, lng: 72.8560, level: "half-full", percentage: 65, updatedAt: "1 hour ago" },
  { id: 5, lat: 19.0226, lng: 72.8564, level: "empty", percentage: 20, updatedAt: "2 hours ago" },
  { id: 6, lat: 19.0239, lng: 72.8568, level: "overflowing", percentage: 100, updatedAt: "Just now" },
];

let binsStore = [...defaultBins];
let historyStore = defaultBins.map((bin) => ({
  dustbinId: bin.id,
  level: bin.level,
  percentage: bin.percentage,
  source: "manual",
  createdAt: new Date(),
}));

function getBins() {
  return binsStore;
}

function updateBinsFromDb(dbBins) {
  if (!Array.isArray(dbBins) || dbBins.length === 0) return;
  dbBins.forEach((dbBin) => {
    const idx = binsStore.findIndex((b) => b.id === dbBin.id);
    if (idx === -1) {
      binsStore.push(dbBin);
    } else {
      binsStore[idx] = {
        ...binsStore[idx],
        ...dbBin,
      };
    }
  });
}

function updateBin({ id, level, percentage, lat, lng }) {
  const parsedId = Number(id);
  const parsedPct = Number(percentage);

  const idx = binsStore.findIndex((b) => b.id === parsedId);
  const nowStr = "Just now";

  const updatedItem = {
    id: parsedId,
    lat: lat || (idx !== -1 ? binsStore[idx].lat : 19.0222),
    lng: lng || (idx !== -1 ? binsStore[idx].lng : 72.8561),
    level: level || "half-full",
    percentage: Number.isNaN(parsedPct) ? 50 : parsedPct,
    updatedAt: nowStr,
  };

  if (idx !== -1) {
    binsStore[idx] = updatedItem;
  } else {
    binsStore.push(updatedItem);
  }

  historyStore.unshift({
    dustbinId: parsedId,
    level: updatedItem.level,
    percentage: updatedItem.percentage,
    source: "upload",
    createdAt: new Date(),
  });

  return updatedItem;
}

function getStats() {
  const totalDustbins = binsStore.length;
  const avgFillLevel = totalDustbins
    ? Math.round(binsStore.reduce((sum, bin) => sum + (Number(bin.percentage) || 0), 0) / totalDustbins)
    : 0;
  const needAttention = binsStore.filter((bin) => (Number(bin.percentage) || 0) >= 70).length;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const collectionsToday = historyStore.filter((entry) => {
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

  historyStore.forEach((entry) => {
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
  historyStore.forEach((entry) => {
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
  binsStore.forEach((bin) => {
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

  const recentActivity = historyStore.slice(0, 8).map((entry) => {
    const pct = Number(entry.percentage) || 0;
    const status = pct >= 90 ? "critical" : pct >= 70 ? "attention" : "normal";
    const message = pct >= 90 ? "Critical level" : `${pct}% full`;

    return {
      dustbinId: `DB-${String(entry.dustbinId).padStart(3, "0")}`,
      status,
      message,
      time: new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  });

  return {
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
  };
}

module.exports = {
  defaultBins,
  getBins,
  updateBinsFromDb,
  updateBin,
  getStats,
};
