'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  LogOut,
  Menu,
  X,
  CreditCard,
  Settings
} from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { name: 'Tableau de bord', href: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'Demandes', href: '/dashboard/admin/demandes', icon: FileText },
    { name: 'Planning & Missions', href: '/dashboard/admin/planning', icon: Calendar },
    { name: 'Familles & Bénéficiaires', href: '/dashboard/admin/beneficiaires', icon: Users },
    { name: 'Facturation & SAP', href: '/dashboard/admin/facturation', icon: CreditCard },
    { name: 'Paramètres', href: '/dashboard/admin/parametres', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-sand-100 flex flex-col md:flex-row">
      {/* Menu burger (Mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-sage-200">
        <span className="font-bold font-sans text-forest-900 text-lg">Inspire Répit - Admin</span>
        <button onClick={() => setIsSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-forest-800" />
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-forest-900 text-white transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex justify-between items-center border-b border-forest-800">
          <Link href="/dashboard/admin">
            <span className="text-xl font-bold font-sans tracking-wide">Inspire Répit</span>
            <span className="block text-xs text-sage-400 mt-1 uppercase tracking-widest">Espace Admin</span>
          </Link>
          <button className="md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <X className="w-6 h-6 text-sage-300" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-white font-bold'
                    : 'text-sage-300 hover:bg-forest-800/50 hover:text-white'
                }`}
                onClick={() => setIsSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-forest-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-terracotta-400 hover:bg-forest-800 hover:text-terracotta-300 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Overlay pour mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-forest-900/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Contenu principal */}
      <main className="flex-1 p-6 md:p-8 lg:p-10 h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
