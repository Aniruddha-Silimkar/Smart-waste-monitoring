import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bell, CheckCheck, MapPin, RefreshCw, TriangleAlert } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { toast } from "sonner";
import { API_BASE_URL } from "../lib/api";

type AdminNotification = {
  _id: string;
  dustbinId: number;
  level: "half" | "half-full" | "full" | "overflowing";
  percentage: number;
  lat: number;
  lng: number;
  message: string;
  isRead: boolean;
  createdAt: string;
};

interface AdminNotificationCenterProps {
  token: string;
}

function formatLevel(level: AdminNotification["level"]) {
  return level === "half-full" ? "half full" : level;
}

export function AdminNotificationCenter({ token }: AdminNotificationCenterProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const previousNotificationIds = useRef<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications?limit=25`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load notifications");
      }

      const nextNotifications = result.notifications as AdminNotification[];
      const nextUnread = Number(result.unreadCount) || 0;

      const currentIds = new Set(nextNotifications.map((item) => item._id));
      const isFirstLoad = previousNotificationIds.current.size === 0;

      const newUnread = nextNotifications.filter(
        (item) => !item.isRead && !previousNotificationIds.current.has(item._id),
      );

      newUnread.forEach((item) => {
        const dbId = String(item.dustbinId).padStart(3, "0");
        toast.error(`Dustbin alert: DB-${dbId} (${formatLevel(item.level)})`, {
          description: `${item.percentage}% full at ${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}`,
        });
      });

      previousNotificationIds.current = currentIds;
      setNotifications(nextNotifications);
      setUnreadCount(nextUnread);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load notifications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const timer = setInterval(() => {
      fetchNotifications();
    }, 10000);

    const handleUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener("dustbin-updated", handleUpdate);

    return () => {
      clearInterval(timer);
      window.removeEventListener("dustbin-updated", handleUpdate);
    };
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mark notification");
      }
      await fetchNotifications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark notification";
      toast.error(message);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update notifications");
      }
      await fetchNotifications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update notifications";
      toast.error(message);
    }
  };

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  return (
    <div className="relative">
      <Button variant="outline" size="sm" className="relative h-9" onClick={() => setOpen((prev) => !prev)}>
        <Bell className="h-4 w-4" />
        Alerts
        {unreadCount > 0 && (
          <span className="absolute -right-2 -top-2 rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <Card className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-[360px] border-slate-200 bg-white p-4 shadow-xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900">Admin Notifications</p>
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={markAllRead}>
              <CheckCheck className="mr-1 h-3.5 w-3.5" />
              Mark all read
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">Loading alerts...</p>
          ) : sorted.length === 0 ? (
            <p className="text-sm text-slate-500">No critical alerts yet.</p>
          ) : (
            <div className="max-h-[340px] space-y-2 overflow-y-auto pr-1">
              {sorted.map((item) => {
                const dbId = String(item.dustbinId).padStart(3, "0");
                return (
                  <button
                    key={item._id}
                    className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                      item.isRead
                        ? "border-slate-200 bg-slate-50"
                        : "border-rose-200 bg-rose-50 hover:bg-rose-100/70"
                    }`}
                    onClick={() => markRead(item._id)}
                  >
                    <div className="flex items-start gap-2">
                      <TriangleAlert className="mt-0.5 h-4 w-4 text-rose-600" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-900">
                          DB-{dbId} {formatLevel(item.level)}
                        </p>
                        <p className="text-xs text-slate-600">{item.percentage}% full</p>
                        <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function AdminNotificationSection({ token }: AdminNotificationCenterProps) {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/notifications?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to load notifications");
      }

      setNotifications(result.notifications as AdminNotification[]);
      setUnreadCount(Number(result.unreadCount) || 0);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load notifications";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const timer = setInterval(fetchNotifications, 10000);
    return () => clearInterval(timer);
  }, [fetchNotifications]);

  const markRead = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to mark notification");
      }
      await fetchNotifications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to mark notification";
      toast.error(message);
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/notifications/read-all`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to update notifications");
      }
      await fetchNotifications();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update notifications";
      toast.error(message);
    }
  };

  const sorted = useMemo(
    () =>
      [...notifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [notifications],
  );

  return (
    <Card className="border-slate-200 bg-white/92 p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Admin Notifications</h2>
          <p className="text-sm text-slate-600">
            Alerts for half-full and full dustbins, including dustbin number and location.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-1.5 text-sm font-semibold text-rose-700">
            {unreadCount} unread
          </span>
          <Button variant="outline" size="sm" onClick={fetchNotifications} disabled={loading}>
            <RefreshCw className="mr-1.5 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={markAllRead} disabled={sorted.length === 0}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          Loading alerts...
        </p>
      ) : sorted.length === 0 ? (
        <p className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-6 text-sm text-slate-500">
          No dustbin alerts yet.
        </p>
      ) : (
        <div className="grid gap-3">
          {sorted.map((item) => {
            const dbId = String(item.dustbinId).padStart(3, "0");
            return (
              <button
                key={item._id}
                className={`w-full rounded-lg border px-4 py-3 text-left transition ${
                  item.isRead
                    ? "border-slate-200 bg-slate-50"
                    : "border-rose-200 bg-rose-50 hover:bg-rose-100/70"
                }`}
                onClick={() => markRead(item._id)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <TriangleAlert className="mt-0.5 h-5 w-5 text-rose-600" />
                    <div>
                      <p className="font-semibold text-slate-900">
                        DB-{dbId} is {formatLevel(item.level)}
                      </p>
                      <p className="text-sm text-slate-600">{item.percentage}% full</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="h-3.5 w-3.5" />
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {item.isRead ? "Read" : "Unread"}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
