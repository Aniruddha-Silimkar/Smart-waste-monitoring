import { Trash2, BarChart3 } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-green-600 to-emerald-700 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <Trash2 className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">SmartWaste Monitor</h1>
              <p className="text-sm text-green-100">AI-Powered Waste Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
            <BarChart3 className="h-5 w-5" />
            <span className="text-sm font-medium">VJTI College Campus</span>
          </div>
        </div>
      </div>
    </header>
  );
}
