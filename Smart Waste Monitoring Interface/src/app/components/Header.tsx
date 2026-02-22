import { Trash2, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';

interface HeaderProps {
  userName: string;
  onLogout: () => void;
}

export function Header({ userName, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/55 bg-white/72 text-foreground backdrop-blur-lg">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary p-2.5 shadow-md shadow-emerald-950/25">
            <Trash2 className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">SmartWaste Monitor</h1>
            <p className="text-sm text-slate-600">AI-powered campus waste intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/80 px-4 py-2 text-emerald-900 shadow-sm md:flex">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-semibold">VJTI College Campus</span>
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-xs text-slate-500">Signed in as</p>
            <p className="text-sm font-semibold text-slate-800">{userName}</p>
          </div>
          <Button onClick={onLogout} variant="outline" size="sm" className="h-9">
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
