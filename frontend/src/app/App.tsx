import { useEffect, useState } from "react";
import { BarChart3, Bell, Map, Upload } from "lucide-react";
import { Header } from "./components/Header";
import { UploadSection } from "./components/UploadSection";
import { StatisticsPanel } from "./components/StatisticsPanel";
import VJTIMap from "./components/VJTIMap";
import { AuthSection } from "./components/AuthSection";
import { AdminNotificationSection } from "./components/AdminNotificationCenter";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader } from "./components/ui/dialog";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
};

const TOKEN_KEY = "smartwaste_auth_token";
const USER_KEY = "smartwaste_auth_user";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const handleAuthSuccess = (payload: { token: string; user: AuthUser }) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
    setIsAuthOpen(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <div className="min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-[-210px] z-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_70%)]" />

      <Header
        userName={user?.name}
        userRole={user?.role}
        token={token}
        onLogout={handleLogout}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="w-full gap-6">
          <TabsList
            className={`mx-auto grid h-auto w-full ${
              user?.role === "admin" ? "max-w-3xl grid-cols-2 sm:grid-cols-4" : "max-w-xl grid-cols-3"
            }`}
          >
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>

            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>

            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Map
            </TabsTrigger>

            {user?.role === "admin" && (
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" forceMount className="mt-1 data-[state=inactive]:hidden">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="upload" forceMount className="mt-1 data-[state=inactive]:hidden">
            <div className="mx-auto max-w-2xl">
              <UploadSection user={user} onOpenAuth={() => setIsAuthOpen(true)} />
            </div>
          </TabsContent>

          <TabsContent value="map" forceMount className="mt-1 data-[state=inactive]:hidden">
            <div className="mx-auto max-w-5xl">
              <VJTIMap />
            </div>
          </TabsContent>

          {user?.role === "admin" && token && (
            <TabsContent value="notifications" forceMount className="mt-1 data-[state=inactive]:hidden">
              <div className="mx-auto max-w-5xl">
                <AdminNotificationSection token={token} />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>

      <Dialog open={isAuthOpen} onOpenChange={setIsAuthOpen}>
        <DialogContent className="max-w-md border-emerald-100/90 p-6 bg-white sm:rounded-2xl shadow-xl">
          <DialogHeader className="sr-only">
            <DialogTitle>Authentication</DialogTitle>
            <DialogDescription>Sign in or register for SmartWaste Monitor</DialogDescription>
          </DialogHeader>
          <AuthSection onAuthSuccess={handleAuthSuccess} isModal={true} />
        </DialogContent>
      </Dialog>

      <Toaster />
    </div>
  );
}
