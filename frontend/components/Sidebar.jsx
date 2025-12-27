import { Wrench, Calendar, Cpu, Moon } from "lucide-react";

export default function Sidebar({ dark, toggleDark }) {
  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-700 h-screen p-4">
      <h2 className="text-xl font-bold mb-6 text-blue-600">GearGuard</h2>

      <nav className="space-y-3">
        <a className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
          <Wrench size={18} /> Maintenance
        </a>
        <a className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
          <Calendar size={18} /> Calendar
        </a>
        <a className="flex items-center gap-3 p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
          <Cpu size={18} /> Equipment
        </a>
      </nav>

      <button
        onClick={toggleDark}
        className="mt-10 flex items-center gap-2 text-sm text-gray-500"
      >
        <Moon size={16} /> Toggle Dark Mode
      </button>
    </aside>
  );
}
