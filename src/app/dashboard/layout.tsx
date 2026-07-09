export default function DashboardLayout({
  children,
  sidebar,
}: {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}) {
  return (
    <div className="flex gap-6 max-w-5xl mx-auto">
      <aside className="w-64 shrink-0">
        {sidebar}
      </aside>
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
