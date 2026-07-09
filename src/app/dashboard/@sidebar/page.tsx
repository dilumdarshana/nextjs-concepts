import Link from 'next/link';

const nav = [
  { href: '/dashboard', label: 'Overview', icon: '◉' },
  { href: '/dashboard/analytics', label: 'Analytics', icon: '◈' },
  { href: '/dashboard/settings', label: 'Settings', icon: '⚙' },
];

export default function Sidebar() {
  return (
    <nav className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-1 sticky top-4">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 pb-2">
        Navigation
      </p>
      {nav.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <span className="text-gray-400">{item.icon}</span>
          {item.label}
        </Link>
      ))}

      <div className="pt-4 mt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 px-3">
          This sidebar is an <code className="text-xs">@sidebar</code> parallel route
        </p>
      </div>
    </nav>
  );
}
