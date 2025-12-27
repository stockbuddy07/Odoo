import Sidebar from "./Sidebar";

export default function AppLayout({ children, dark, toggleDark }) {
  return (
    <div className={`flex ${dark ? "dark" : ""}`}>
      <Sidebar dark={dark} toggleDark={toggleDark} />
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 min-h-screen">
        {children}
      </div>
    </div>
  );
}
