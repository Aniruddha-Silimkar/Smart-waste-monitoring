import { Trash2, BarChart3, LogIn, User } from 'lucide-react';
import { Button } from './ui/button';
import { AdminNotificationCenter } from "./AdminNotificationCenter";

interface HeaderProps {
  userName?: string | null;
  userRole?: "user" | "admin" | null;
  token?: string | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export function Header({ userName, userRole, token, onLogout, onOpenAuth }: HeaderProps) {
  const isLoggedIn = Boolean(userName && token);

  return (
    <header className="sticky top-0 z-20 border-b border-white/55 bg-white/72 text-foreground backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 shadow-md shadow-emerald-950/25">
            <Trash2 className="h-7 w-7 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">SmartWaste Monitor</h1>
            <p className="text-sm text-slate-600">AI-powered campus waste intelligence</p>
          </div>
        </div>
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-end">
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-2 text-emerald-900 shadow-sm md:flex">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-semibold">VJTI College Campus</span>
          </div>

          {isLoggedIn ? (
            <>
              <div className="hidden text-right sm:block">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800">{userName}</p>
              </div>
              {userRole === "admin" && token && <AdminNotificationCenter token={token} />}
              <Button onClick={onLogout} variant="outline" size="sm" className="h-9">
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <div className="hidden text-right sm:block pr-1">
                <span className="rounded-md bg-amber-100/90 px-2 py-1 text-xs font-semibold text-amber-800">
                  Guest Mode
                </span>
              </div>
              <Button onClick={onOpenAuth} size="sm" className="h-9 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm">
                <LogIn className="h-4 w-4" />
                Log In / Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
