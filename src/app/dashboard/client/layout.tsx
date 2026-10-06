'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Heart, Home, Users, CalendarDays, FileText, LogOut, Clock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ClientDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const navItems = [
    { name: 'Vue d\'ensemble', href: '/dashboard/client', icon: Home },
    { name: 'Mes Bénéficiaires', href: '/dashboard/client/beneficiaires', icon: Users },
    { name: 'Réserver un créneau', href: '/dashboard/client/reserver', icon: CalendarDays },
    { name: 'Mes Interventions', href: '/dashboard/client/interventions', icon: Clock },
    { name: 'Factures & Documents', href: '/dashboard/client/documents', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-forest-900 text-cream-50 flex flex-col border-r border-forest-800">
        <div className="p-6 flex items-center gap-2 border-b border-forest-800">
          <Heart className="w-6 h-6 text-terracotta-500" />
          <span className="text-xl font-bold font-sans tracking-tight">Espace Client</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-forest-800 text-white font-bold'
                    : 'text-sage-200 hover:bg-forest-800 hover:text-white'
                }`}
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
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sage-200 hover:bg-terracotta-500/20 hover:text-terracotta-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-grow p-6 lg:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
