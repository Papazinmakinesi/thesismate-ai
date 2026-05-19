'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BookOpen, MessageSquare, Table, ShieldCheck, Bot, Settings, BookOpenCheck, UserCircle2
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Account', href: '/auth', icon: UserCircle2 },
  { label: 'Source Manager', href: '/source-manager', icon: BookOpen },
  { label: 'Supervisor Comments', href: '/supervisor-comments', icon: MessageSquare },
  { label: 'Chapter Checker', href: '/chapter-checker', icon: ShieldCheck },
  { label: 'Literature Matrix', href: '/literature-matrix', icon: Table },
  { label: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white px-5 py-6 shadow-sm md:flex md:flex-col md:justify-between h-screen sticky top-0">
      <div className="space-y-8">
        <div className="flex items-center gap-2.5 px-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md">
            <BookOpenCheck size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-950">ThesisMate AI</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Workflow Suite</p>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold tracking-wide transition active:scale-98 ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                }`}
              >
                <Icon size={18} className={active ? 'text-white' : 'text-slate-400'} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-4 border-t border-slate-100/80">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Version 1.0.0 (Beta)</p>
      </div>
    </aside>
  );
}
