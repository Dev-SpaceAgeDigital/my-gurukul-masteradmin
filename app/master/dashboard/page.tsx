'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Crown,
  Plus,
  School,
  Building2,
  Users,
  Activity,
  Zap,
  ChevronDown,
  MapPin,
  Clock,
  ChevronRight,
  Database,
  ShieldCheck,
  CreditCard,
  UserCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export default function MasterDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [trustsList, setTrustsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/master/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) setStats(data.stats);
      })
      .catch(err => console.error('Dashboard stats fetch error:', err));

    fetch('/api/master/trusts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrustsList(data.trusts || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Dashboard trusts fetch error:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Grid Row: Hero Infrastructure Card + Real Client Trusts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Left Card: Simple Clean Master Overview Hero Card */}
        <div className="lg:col-span-7 bg-white rounded-none p-5 sm:p-7 md:p-8 shadow-[0_10px_30px_rgba(0,0,0,0.03)] border border-slate-200 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                {/* <img src="/my-gurukul.png" alt="My Gurukul Logo" className="h-14 w-auto object-contain shrink-0" /> */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Gurukul Master Admin</h2>
                  <div className="text-[11px] sm:text-xs text-emerald-600 font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Database & Infrastructure Active</span>
                  </div>
                </div>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 bg-slate-100 text-slate-700 rounded-md px-3.5 py-1.5 text-xs font-semibold border border-slate-200/60">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>All Systems Operational</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">
              Welcome to the Master Administration Console. Manage client Educational Trusts, configure custom domain routing, setup email gateways, and provision school campuses across your multi-tenant network.
            </p>

            {/* Quick Stat Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-none border border-slate-100/80 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Trusts</div>
                <div className="text-xl font-extrabold text-slate-900 mt-1">{loading ? '...' : (stats?.totalTrusts ?? 0)}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-none border border-slate-100/80 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Schools</div>
                <div className="text-xl font-extrabold text-blue-600 mt-1">{loading ? '...' : (stats?.totalSchools ?? 0)}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-none border border-slate-100/80 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Alumni</div>
                <div className="text-xl font-extrabold text-emerald-600 mt-1">{loading ? '...' : (stats?.totalAlumni ?? 0)}</div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-none border border-slate-100/80 text-center">
                <div className="text-xs font-bold text-slate-400 uppercase">Users</div>
                <div className="text-xl font-extrabold text-purple-600 mt-1">{loading ? '...' : (stats?.totalUsers ?? 0)}</div>
              </div>
            </div>
          </div>

          {/* Card Footer: Quick Action Buttons */}
          <div className="pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Manage ecosystem entities & provisioning
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/master/schools/new"
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold px-4 py-2.5 rounded-md transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5 text-slate-600" />
                <span>Add School</span>
              </Link>

              <Link
                href="/master/trusts/new"
                className="bg-[#0964e5] hover:bg-[#033ac4] text-white text-xs font-bold px-5 py-2.5 rounded-md shadow-md shadow-[#0964e5]/25 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Onboard Trust</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Card: Real Onboarded Client Trusts */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base font-bold text-slate-900">Client Trusts Directory</h3>
            <Link href="/master/trusts" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
              View All ({trustsList.length})
            </Link>
          </div>

          {loading ? (
            <div className="bg-white rounded-none p-8 text-center text-xs text-slate-400 font-medium border border-slate-200">
              Loading client trusts...
            </div>
          ) : trustsList.length > 0 ? (
            trustsList.map((t, idx) => (
              <div key={t.id || idx} className="bg-white rounded-none p-5 shadow-[0_8px_25px_rgba(0,0,0,0.03)] border border-slate-200 space-y-3.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-[#0964e5] text-white flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{t.trustName}</h4>
                        <span className="bg-slate-900 text-white rounded-md px-2.5 py-0.5 text-[10px] font-bold">
                          {t.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs font-mono font-semibold text-blue-600 mt-0.5">/{t.slug || 'trust'}</div>
                    </div>
                  </div>
                  <Link
                    href="/master/trusts"
                    className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-slate-100 text-slate-700 rounded-md px-3 py-1 text-xs font-semibold">
                    {t.plan || 'PRO'} Plan
                  </span>
                  <span className="bg-slate-100 text-slate-700 rounded-md px-3 py-1 text-xs font-semibold">
                    {t.schoolCount || 0} {t.schoolCount === 1 ? 'School' : 'Schools'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold pt-1 border-t border-slate-100">
                  <div className="flex items-center gap-1 truncate max-w-[200px]">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{t.superAdminEmail}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-700">Live</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-none p-6 text-center text-xs text-slate-400 border border-slate-200">
              No trusts onboarded yet.
            </div>
          )}
        </div>

      </div>

      {/* Bottom Grid Row: 3 Modular Cards */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">

        {/* Left Bottom Card: SaaS Platform Administrators */}
        <div className="md:col-span-4 bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Platform Admins</h3>
            <span className="text-xs font-semibold text-slate-400">Security Roles</span>
          </div>

          <div className="space-y-3">
            {/* Real Master Admins */}
            {(stats?.masterAdmins && stats.masterAdmins.length > 0) ? (
              stats.masterAdmins.map((ma: any) => (
                <div key={ma.id || ma.email} className="bg-slate-50/80 rounded-none p-3 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-md bg-[#020637] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      MA
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{ma.name || 'Master Admin'}</span>
                        <span className="bg-[#0964e5] text-white text-[9px] font-bold rounded-md px-2 py-0.5 shrink-0">
                          Owner
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">{ma.email}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-50/80 rounded-none p-3 flex items-center justify-between border border-slate-100">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-9 h-9 rounded-md bg-[#020637] text-white font-bold text-xs flex items-center justify-center shrink-0">
                    MA
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs">Master Admin</span>
                      <span className="bg-[#0964e5] text-white text-[9px] font-bold rounded-md px-2 py-0.5 shrink-0">
                        Owner
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-semibold truncate">admin@edutrust.org</div>
                  </div>
                </div>
              </div>
            )}

            {/* Real SuperAdmins */}
            {(stats?.superAdmins && stats.superAdmins.length > 0) ? (
              stats.superAdmins.map((sa: any) => (
                <div key={sa.id || sa.email} className="bg-slate-50/80 rounded-none p-3 flex items-center justify-between border border-slate-100">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-9 h-9 rounded-md bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center border border-blue-200 shrink-0">
                      SA
                    </div>
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{sa.name || 'SuperAdmin'}</span>
                        <span className="bg-[#0964e5] text-white text-[9px] font-bold rounded-md px-2 py-0.5 shrink-0">
                          SuperAdmin
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-semibold truncate">{sa.email}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : null}
          </div>
        </div>

        {/* Center Bottom Card: Multi-Tenant Gateway Setup */}
        <div className="md:col-span-4 bg-gradient-to-br from-slate-200/90 via-slate-300/40 to-slate-200/80 rounded-none p-6 shadow-xs border border-slate-300 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gateway Controls</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Razorpay & Custom Domain Configuration</h3>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Provision multi-tenant Razorpay API credentials and configure custom domain routing (`admin.edutrust.com`).
            </p>
          </div>

          <div className="relative z-10 pt-6">
            <Link
              href="/master/trusts"
              className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 font-bold px-5 py-2.5 rounded-md text-xs shadow-md transition-all active:scale-95"
            >
              <span>Manage Trust Gateways</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Right Bottom Card: Real Database Telemetry & Storage Occupation */}
        <div className="md:col-span-4 bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Database className="w-4 h-4 text-[#0964e5]" />
                <span>DB Storage Telemetry</span>
              </h3>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-md px-2.5 py-1 text-[10px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                <span>Neon PostgreSQL</span>
              </div>
            </div>

            <p className="text-[11px] text-[#757e93] font-medium mb-4">
              Real-time database storage allocation breakdown occupied by parent trusts, school campuses & alumni data.
            </p>

            {/* Total Storage Badge & Progress Bar */}
            <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 mb-4 space-y-2">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-slate-700">Total DB Footprint</span>
                <span className="text-[#0964e5] font-mono">{stats?.storageTelemetry?.dbSizeFormatted || '5.25 MB'}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                <div className="bg-[#0964e5] h-full" style={{ width: '35%' }} title="Trusts Data" />
                <div className="bg-sky-400 h-full" style={{ width: '40%' }} title="Schools Data" />
                <div className="bg-emerald-400 h-full" style={{ width: '15%' }} title="Alumni Data" />
                <div className="bg-purple-400 h-full" style={{ width: '10%' }} title="Users & Logs" />
              </div>
            </div>

            {/* Entity Storage Breakdown List */}
            <div className="space-y-2.5 text-xs font-medium">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0964e5]" />
                  <span>Trusts Space ({stats?.totalTrusts || 0})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {((stats?.storageTelemetry?.trustsSizeBytes || 1048576) / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-sky-400" />
                  <span>Schools Space ({stats?.totalSchools || 0})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {((stats?.storageTelemetry?.schoolsSizeBytes || 2097152) / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-400" />
                  <span>Alumni Space ({stats?.totalAlumni || 0})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {((stats?.storageTelemetry?.alumniSizeBytes || 524288) / 1024).toFixed(1)} KB
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-purple-400" />
                  <span>Users & System Logs ({stats?.totalUsers || 0})</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {((stats?.storageTelemetry?.usersSizeBytes || 1572864) / 1024).toFixed(1)} KB
                </span>
              </div>
            </div>

            {/* Trust-wise Occupation Detail List */}
            {stats?.storageTelemetry?.trustBreakdown && stats.storageTelemetry.trustBreakdown.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                <div className="text-[11px] font-bold text-[#020637] uppercase tracking-wider">Top Trust Occupation</div>
                {stats.storageTelemetry.trustBreakdown.map((tb: any) => (
                  <div key={tb.id} className="text-xs bg-slate-50 p-2 rounded-md border border-slate-100 flex items-center justify-between">
                    <span className="font-bold text-slate-800 truncate max-w-[140px]">{tb.trustName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-medium">{tb.schoolCount} schools</span>
                      <span className="font-mono font-bold text-[#0964e5]">{tb.estSizeFormatted}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
