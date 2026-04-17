"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SaaSNavbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/' },
    { name: 'Area Insights', href: '/areas' },
    { name: 'Plant Scanner', href: '/scanner' },
    { name: 'Community', href: '/community' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700 h-16 flex items-center px-6">
      <div className="flex items-center gap-2 mr-10 font-bold text-xl tracking-tight text-white hover:opacity-80 transition cursor-pointer">
        <span className="text-agrigreen-400">Agro</span>Tech AI
      </div>

      <div className="flex gap-2 text-sm font-medium">
        {links.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                isActive 
                  ? 'bg-agrigreen-600/20 text-agrigreen-400' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="ml-auto flex items-center gap-4">
        {/* Mock User Avatar */}
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-xs font-semibold text-slate-200">System Admin</span>
          <span className="text-[10px] text-slate-500">View Profile</span>
        </div>
        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-blue-500 to-agrigreen-500 border-2 border-slate-700 shadow-inner flex items-center justify-center text-white font-bold text-sm cursor-pointer hover:scale-105 transition-transform">
          A
        </div>
      </div>
    </nav>
  );
}
