'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Crown,
  Search,
  Bell,
  ArrowLeft,
  ChevronRight,
  SlidersHorizontal,
  LogOut,
  Building2,
  School,
  LayoutDashboard
} from 'lucide-react';

export default function MasterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === '/master/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  const isDashboard = pathname === '/master/dashboard';

  const handleLogout = async () => {
    router.push('/master/login');
  };

  return (
    <div className="min-h-screen bg-[#f0f4fd] text-[#020637] font-sans antialiased flex flex-col">
      {/* Sticky Transparent Top Navbar */}
      <header className="sticky top-0 z-50 w-full bg-[#f0f4fd]/80 backdrop-blur-md border-b border-slate-200/60 px-4 md:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-8">
          <Link href="/master/dashboard" className="flex items-center group shrink-0">
            <img src="/my-gurukul.png" alt="My Gurukul Logo" className="h-14 md:h-16 w-auto object-contain group-hover:scale-105 transition-transform" />
          </Link>

          {/* Top Menu Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs md:text-sm font-semibold text-[#757e93]">
            <Link
              href="/master/dashboard"
              className={`transition-colors py-1 relative ${pathname === '/master/dashboard'
                ? 'text-[#020637] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0964e5] after:rounded-full'
                : 'hover:text-[#0964e5]'
                }`}
            >
              Dashboard
            </Link>
            <Link
              href="/master/trusts"
              className={`transition-colors py-1 relative ${pathname.startsWith('/master/trusts')
                ? 'text-[#020637] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0964e5] after:rounded-full'
                : 'hover:text-[#0964e5]'
                }`}
            >
              Trusts Console
            </Link>
            <Link
              href="/master/schools"
              className={`transition-colors py-1 relative ${pathname.startsWith('/master/schools')
                ? 'text-[#020637] font-bold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0964e5] after:rounded-full'
                : 'hover:text-[#0964e5]'
                }`}
            >
              Global Schools
            </Link>
          </nav>
        </div>

        {/* Right Action Controls & Profile Avatar */}
        <div className="flex items-center gap-3">
          {!isDashboard && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 text-xs font-bold text-[#020637] bg-white hover:bg-slate-50 px-3.5 py-1.5 rounded-md shadow-xs transition-all active:scale-95 border border-slate-200/60"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#757e93]" />
              <span>Back</span>
            </button>
          )}

          <button className="w-8 h-8 rounded-md bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-[#757e93] shadow-xs transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-[#0029dc] absolute top-1 right-1" />
          </button>

          {/* User Avatar Capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-300/50">
            <div className="w-8 h-8 rounded-md bg-[#020637] text-white font-bold text-xs flex items-center justify-center overflow-hidden shadow-md shadow-[#022590]/20">
              MA
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              className="w-8 h-8 rounded-md bg-slate-100 hover:bg-rose-50 hover:text-rose-600 flex items-center justify-center text-[#757e93] shadow-xs transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Canvas Body Container */}
      <main className="w-full mx-auto flex-1 p-4 md:p-6">
        {/* Mobile Top Navigation Pills */}
        <nav className="flex md:hidden items-center justify-around bg-white/90 backdrop-blur-md rounded-md p-1.5 mb-5 shadow-xs border border-slate-200/60 text-xs font-bold text-[#757e93]">
          <Link
            href="/master/dashboard"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              pathname === '/master/dashboard'
                ? 'bg-[#0964e5] text-white shadow-xs'
                : 'hover:text-[#020637]'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/master/trusts"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              pathname.startsWith('/master/trusts')
                ? 'bg-[#0964e5] text-white shadow-xs'
                : 'hover:text-[#020637]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Trusts</span>
          </Link>
          <Link
            href="/master/schools"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              pathname.startsWith('/master/schools')
                ? 'bg-[#0964e5] text-white shadow-xs'
                : 'hover:text-[#020637]'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Schools</span>
          </Link>
        </nav>

        {children}
      </main>
    </div>
  );
}
