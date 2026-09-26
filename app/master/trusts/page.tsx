'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Building2, Plus, Eye, CheckCircle2, Trash2, Ban, ShieldAlert, ShieldCheck } from 'lucide-react';

export default function MasterTrustsPage() {
  const [trustsList, setTrustsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrusts = () => {
    fetch('/api/master/trusts')
      .then(res => res.json())
      .then(data => {
        if (data.success) setTrustsList(data.trusts);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTrusts();
  }, []);

  const handleDeleteTrust = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${name}" and all its associated schools and admin accounts?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/master/trusts/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete trust');

      setTrustsList(prev => prev.filter(t => t.id !== id));
    } catch (err: any) {
      alert(err.message || 'Error deleting trust');
    }
  };

  const handleToggleTrustStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      const res = await fetch(`/api/master/trusts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setTrustsList(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Educational Trusts Directory</h1>
            <span className="bg-[#0964e5]/10 text-[#0964e5] text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border border-[#0964e5]/20">
              {trustsList.length} TRUSTS
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Directory of all onboarded SaaS client trusts and active subscription plans
          </p>
        </div>

        <Link
          href="/master/trusts/new"
          className="inline-flex items-center gap-2 bg-[#0964e5] hover:bg-[#033ac4] text-white font-bold px-5 py-2.5 rounded-md text-xs shadow-md shadow-[#0964e5]/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 text-white" />
          <span>Onboard New Trust</span>
        </Link>
      </div>

      {/* Trusts Table */}
      {loading ? (
        <div className="bg-white rounded-none p-12 text-center text-xs font-semibold text-slate-400 border border-slate-200">
          Loading trusts console...
        </div>
      ) : trustsList.length === 0 ? (
        <div className="bg-white rounded-none p-12 text-center text-xs font-semibold text-slate-400 border border-slate-200">
          No trusts onboarded yet. Click "Onboard New Trust" to add one.
        </div>
      ) : (
        <div className="bg-white rounded-none shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 pl-3">Trust Name</th>
                <th className="py-3.5">Slug</th>
                <th className="py-3.5">SuperAdmin Email</th>
                <th className="py-3.5">Schools</th>
                <th className="py-3.5">Plan</th>
                <th className="py-3.5">Status</th>
                <th className="py-3.5 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trustsList.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-4 pl-3 font-bold text-slate-900">{t.trustName}</td>
                  <td className="py-4 text-[#0964e5] font-mono font-semibold">{t.slug || 'trust'}</td>
                  <td className="py-4 text-slate-500 font-medium">{t.superAdminEmail}</td>
                  <td className="py-4 font-bold text-slate-900">{t.schoolCount || 0}</td>
                  <td className="py-4">
                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase">
                      {t.plan || 'PRO'}
                    </span>
                  </td>
                  <td className="py-4">
                    {t.status === 'SUSPENDED' ? (
                      <span className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-200/60 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase">
                        <Ban className="w-3 h-3 text-rose-600" />
                        SUSPENDED
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] px-2.5 py-1 rounded-md font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        ACTIVE
                      </span>
                    )}
                  </td>
                  <td className="py-4 text-right pr-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/master/trusts/${t.id}`}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-md font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-600" />
                        <span>Inspect</span>
                      </Link>

                      <button
                        onClick={() => handleToggleTrustStatus(t.id, t.status)}
                        className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-md font-bold transition-all ${
                          t.status === 'SUSPENDED'
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200/60'
                        }`}
                      >
                        {t.status === 'SUSPENDED' ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Enable Access</span>
                          </>
                        ) : (
                          <>
                            <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                            <span>Disable Access</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteTrust(t.id, t.trustName)}
                        className="inline-flex items-center gap-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 text-xs px-3 py-1.5 rounded-md font-bold transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Delete</span>
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
  );
}
