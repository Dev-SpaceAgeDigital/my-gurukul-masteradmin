'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  School as SchoolIcon, 
  Building2, 
  Plus, 
  Search, 
  Globe, 
  Users, 
  ExternalLink,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Eye,
  Ban
} from 'lucide-react';

export default function MasterSchoolsPage() {
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/api/master/schools')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setSchools(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSchoolStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await fetch(`/api/master/schools/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setSchools(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      }
    } catch (err) {
      console.error('Error toggling school status:', err);
    }
  };

  const filteredSchools = schools.filter(s => 
    s.schoolName?.toLowerCase().includes(search.toLowerCase()) ||
    s.trustName?.toLowerCase().includes(search.toLowerCase()) ||
    s.schoolDiseNo?.toLowerCase().includes(search.toLowerCase()) ||
    s.subdomain?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#020637] flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-md bg-[#0964e5] text-white flex items-center justify-center shadow-md shadow-[#0964e5]/20">
                <SchoolIcon className="w-5 h-5" />
              </div>
              <span>Global Educational Institutions</span>
            </h1>
            <p className="text-xs text-[#757e93] font-medium ml-1 mt-1">Manage and separately onboard schools linked to client Educational Trusts</p>
          </div>

          <Link
            href="/master/schools/new"
            className="bg-[#0964e5] hover:bg-[#033ac4] text-white font-bold px-6 py-3 rounded-md text-xs shadow-md shadow-[#0964e5]/20 transition-all flex items-center gap-2 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Onboard New School</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">{schools.length}</div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Total Schools</div>
          </div>
          <div className="w-10 h-10 rounded-md bg-blue-50 text-[#0964e5] flex items-center justify-center">
            <SchoolIcon className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">
              {new Set(schools.map(s => s.trustId)).size}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Active Parent Trusts</div>
          </div>
          <div className="w-10 h-10 rounded-md bg-orange-50 text-orange-600 flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-none p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-2xl font-black text-slate-900">
              {schools.reduce((acc, s) => acc + (s.currentStudentsNo || 0), 0)}
            </div>
            <div className="text-xs text-slate-400 font-semibold mt-0.5">Total Enrolled Students</div>
          </div>
          <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Directory Table Container */}
      <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search school name, DISE code, or trust..."
            className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 pl-10 text-xs text-slate-900 focus:bg-white focus:border-[#0964e5] focus:outline-none"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">Loading schools directory...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400 font-medium">No schools found. Onboard your first school using the button above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 px-3">School Name</th>
                  <th className="pb-3 px-3">Parent Trust</th>
                  <th className="pb-3 px-3">Subdomain / Custom URL</th>
                  <th className="pb-3 px-3">DISE Code</th>
                  <th className="pb-3 px-3">Students</th>
                  <th className="pb-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSchools.map((school) => (
                  <tr key={school.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                          {school.logoUrl ? (
                            <img src={school.logoUrl} alt={school.schoolName} className="w-full h-full object-cover" />
                          ) : (
                            <SchoolIcon className="w-5 h-5 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{school.schoolName}</div>
                          <div className="text-[11px] text-slate-400">{school.medium || 'English'} Medium • Est. {school.establishYear || 'N/A'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200/60">
                        <Building2 className="w-3 h-3 text-orange-500" />
                        <span>{school.trustName || 'Unassigned'}</span>
                      </span>
                    </td>

                    <td className="py-4 px-3">
                      <div className="font-mono text-[11px] text-[#0964e5] font-bold flex items-center gap-1">
                        <Globe className="w-3.5 h-3.5 text-[#0964e5]" />
                        <span>{school.subdomain ? `${school.subdomain}.mygurukul.org` : (school.customDomain || 'Default Domain')}</span>
                      </div>
                    </td>

                    <td className="py-4 px-3 font-mono text-slate-600">{school.schoolDiseNo || 'N/A'}</td>

                    <td className="py-4 px-3 font-bold text-slate-900">{school.currentStudentsNo || 0}</td>

                    <td className="py-4 px-3">
                      {school.status === 'SUSPENDED' ? (
                        <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase">
                          <Ban className="w-3 h-3 text-rose-600" />
                          SUSPENDED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-md font-bold uppercase">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/master/schools/${school.id}`}
                          className="inline-flex items-center gap-1.5 bg-[#0964e5]/10 hover:bg-[#0964e5] text-[#0964e5] hover:text-white font-bold px-3 py-1.5 rounded-md text-[11px] transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </Link>

                        <button
                          onClick={() => handleToggleSchoolStatus(school.id, school.status)}
                          className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-md font-bold transition-all ${
                            school.status === 'SUSPENDED'
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {school.status === 'SUSPENDED' ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Enable</span>
                            </>
                          ) : (
                            <>
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                              <span>Disable</span>
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
