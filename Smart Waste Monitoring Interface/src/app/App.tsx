import { useEffect, useState } from "react";
import { BarChart3, Map, Upload } from "lucide-react";
import { Header } from "./components/Header";
import { UploadSection } from "./components/UploadSection";
import { StatisticsPanel } from "./components/StatisticsPanel";
import VJTIMap from "./components/VJTIMap";
import { AuthSection } from "./components/AuthSection";
import { Toaster } from "./components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

const TOKEN_KEY = "smartwaste_auth_token";
const USER_KEY = "smartwaste_auth_user";

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (!savedToken || !savedUser) return;

    try {
      const parsedUser = JSON.parse(savedUser) as AuthUser;
      setToken(savedToken);
      setUser(parsedUser);
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const handleAuthSuccess = (payload: { token: string; user: AuthUser }) => {
    setToken(payload.token);
    setUser(payload.user);
    localStorage.setItem(TOKEN_KEY, payload.token);
    localStorage.setItem(USER_KEY, JSON.stringify(payload.user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  if (!token || !user) {
    return (
      <div className="min-h-screen text-foreground">
        <div className="pointer-events-none fixed inset-x-0 top-[-210px] z-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_70%)]" />
        <AuthSection onAuthSuccess={handleAuthSuccess} />
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      <div className="pointer-events-none fixed inset-x-0 top-[-210px] z-0 h-[420px] bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_70%)]" />
      <Header userName={user.name} onLogout={handleLogout} />

      <main className="relative z-10 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="dashboard" className="w-full gap-6">
          <TabsList className="mx-auto grid w-full max-w-xl grid-cols-3">
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
          </TabsList>

          <TabsContent value="dashboard" className="mt-1">
            <StatisticsPanel />
          </TabsContent>

          <TabsContent value="upload" className="mt-1">
            <div className="mx-auto max-w-2xl">
              <UploadSection />
            </div>
          </TabsContent>

          <TabsContent value="map" className="mt-1">
            <div className="mx-auto max-w-5xl">
              <VJTIMap />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <Toaster />
    </div>
  );
}
