import { useCallback, useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Card } from "./ui/card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { API_BASE_URL } from "../lib/api";

type DashboardStats = {
  metrics: {
    totalDustbins: number;
    avgFillLevel: number;
    needAttention: number;
    collectionsToday: number;
  };
  fillLevelTrend: Array<{ date: string; level: number }>;
  collectionData: Array<{ zone: string; collections: number }>;
  statusDistribution: Array<{ name: string; value: number; color: string }>;
  recentActivity: Array<{
    dustbinId: string;
    status: "normal" | "attention" | "critical";
    message: string;
    time: string;
  }>;
};

const defaultStats: DashboardStats = {
  metrics: {
    totalDustbins: 0,
    avgFillLevel: 0,
    needAttention: 0,
    collectionsToday: 0,
  },
  fillLevelTrend: [],
  collectionData: [],
  statusDistribution: [],
  recentActivity: [],
};

export function StatisticsPanel() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard-stats`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch dashboard stats");
      }

      setStats(result);
      setError("");
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Failed to fetch dashboard stats";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const handleDustbinUpdate = () => {
      fetchStats();
    };

    window.addEventListener("dustbin-updated", handleDustbinUpdate);
    return () => {
      window.removeEventListener("dustbin-updated", handleDustbinUpdate);
    };
  }, [fetchStats]);

  if (loading) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">Loading dashboard statistics...</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-rose-600">{error}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-600">Total Dustbins</p>
              <p className="text-3xl font-bold text-slate-900">{stats.metrics.totalDustbins}</p>
            </div>
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <CheckCircle className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-600">Avg Fill Level</p>
              <p className="text-3xl font-bold text-slate-900">{stats.metrics.avgFillLevel}%</p>
            </div>
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-700">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-600">Need Attention</p>
              <p className="text-3xl font-bold text-slate-900">{stats.metrics.needAttention}</p>
            </div>
            <div className="rounded-2xl bg-rose-100 p-3 text-rose-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-slate-600">Collections Today</p>
              <p className="text-3xl font-bold text-slate-900">{stats.metrics.collectionsToday}</p>
            </div>
            <div className="rounded-2xl bg-sky-100 p-3 text-sky-700">
              <Clock className="h-6 w-6" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Fill Level Trend (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.fillLevelTrend}>
              <CartesianGrid stroke="#d9e9e2" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#d7e7e0",
                  boxShadow: "0 10px 24px -14px rgba(6, 47, 38, 0.6)",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="level"
                stroke="#0f766e"
                strokeWidth={3}
                dot={{ r: 4, fill: "#0f766e" }}
                name="Fill Level (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Collections by Zone (This Week)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={stats.collectionData}>
              <CartesianGrid stroke="#d9e9e2" strokeDasharray="4 4" vertical={false} />
              <XAxis dataKey="zone" tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#4b5563" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#d7e7e0",
                  boxShadow: "0 10px 24px -14px rgba(6, 47, 38, 0.6)",
                }}
              />
              <Legend />
              <Bar dataKey="collections" fill="#14b8a6" radius={[8, 8, 2, 2]} name="Collections" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Dustbin Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.statusDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                dataKey="value"
              >
                {stats.statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${entry.name}-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  borderColor: "#d7e7e0",
                  boxShadow: "0 10px 24px -14px rgba(6, 47, 38, 0.6)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-sm text-slate-500">No activity yet.</p>
            ) : (
              stats.recentActivity.map((activity) => {
                const isCritical = activity.status === "critical";
                const isAttention = activity.status === "attention";
                const badgeClass = isCritical
                  ? "bg-rose-100 text-rose-700"
                  : isAttention
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700";

                return (
                  <div
                    key={`${activity.dustbinId}-${activity.time}`}
                    className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-full p-2 ${badgeClass}`}>
                        {isCritical || isAttention ? (
                          <AlertTriangle className="h-4 w-4" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          {activity.dustbinId} - {activity.message}
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
