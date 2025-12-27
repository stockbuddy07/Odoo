export default function Layout({ title, children }) {
  return (
    <div>
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </header>

      <main className="p-6">{children}</main>
    </div>
  );
}
