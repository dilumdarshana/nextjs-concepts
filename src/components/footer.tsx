'use client';

export default function Footer() {
  return (
    <footer className="text-center py-4 text-gray-500 text-sm border-t border-gray-200">
      <p>&copy; {new Date().getFullYear()} My Application</p>
    </footer>
  );
}
