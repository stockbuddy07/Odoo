import Sidebar from "./Sidebar.jsx";

export default function AppLayout({ children, dark, toggleDark }) {
  return (
    <div className={dark ? "dark" : ""}>
      <div className="flex min-h-screen bg-slate-100 dark:bg-slate-900">
        <Sidebar toggleDark={toggleDark} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
