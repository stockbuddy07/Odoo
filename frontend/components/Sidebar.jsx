import { Wrench, Calendar, Cpu, Moon } from "lucide-react";

export default function Sidebar({ toggleDark }) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-800 border-r p-4">
      <h1 className="text-xl font-bold text-blue-600 mb-6">GearGuard</h1>

      <nav className="space-y-3">
        <div className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded">
          <Wrench size={18} /> Maintenance
        </div>
        <div className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded">
          <Calendar size={18} /> Calendar
        </div>
        <div className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded">
          <Cpu size={18} /> Equipment
        </div>
      </nav>

      <button
        onClick={toggleDark}
        className="mt-8 flex items-center gap-2 text-sm text-gray-600"
      >
        <Moon size={16} /> Dark Mode
      </button>
    </aside>
  );
}
