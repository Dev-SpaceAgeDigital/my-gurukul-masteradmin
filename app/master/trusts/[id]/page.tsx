'use client';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import LogoUploadInput from '@/app/components/LogoUploadInput';
import { 
  Building2, 
  School, 
  UserCheck, 
  CreditCard, 
  FileText, 
  Phone, 
  Globe, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Award,
  Users,
  Image as ImageIcon,
  Edit3,
  X,
  Loader2,
  Save,
  Trash2,
  Activity
} from 'lucide-react';

export default function TrustInspectPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const trustId = resolvedParams.id;
  const router = useRouter();

  const [trustData, setTrustData] = useState<any>(null);
  const [schoolsList, setSchoolsList] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'governance' | 'schools' | 'admins' | 'gateways' | 'activity'>('governance');

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchTrustData = () => {
    fetch(`/api/master/trusts/${trustId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTrustData(data.trust);
          setSchoolsList(data.schools || []);
          setUsersList(data.users || []);
          setEditForm(data.trust);
        } else {
          setError(data.error || 'Failed to load trust details');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching data');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTrustData();
  }, [trustId]);

  const openEditModal = () => {
    setEditForm({ ...trustData });
    setSaveError('');
    setSaveSuccess('');
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveError('');
    setSaveSuccess('');

    try {
      const res = await fetch(`/api/master/trusts/${trustId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update trust');

      setTrustData(data.trust);
      setSaveSuccess('Trust setup updated successfully!');
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess('');
      }, 1200);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save updates');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteTrust = async () => {
    if (!confirm(`Are you sure you want to permanently delete "${trustData?.trustName}" and ALL its associated schools and admin accounts? This action cannot be undone.`)) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/master/trusts/${trustId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete trust');

      router.push('/master/trusts');
    } catch (err: any) {
      alert(err.message || 'Error deleting trust');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-12 text-center text-xs font-bold text-slate-400 shadow-xs border border-white/80">
        Loading trust governance profile...
      </div>
    );
  }

  if (error || !trustData) {
    return (
      <div className="bg-white rounded-[32px] p-8 text-center space-y-4 shadow-xs border border-white/80">
        <div className="text-rose-600 font-bold text-sm">{error || 'Trust record not found'}</div>
        <Link
          href="/master/trusts"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-full transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Trusts Console</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-white/80 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {trustData.logoUrl ? (
              <img
                src={trustData.logoUrl}
                alt={trustData.trustName}
                className="w-14 h-14 rounded-2xl object-contain p-1 border-2 border-slate-100 bg-slate-50 shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-md shadow-slate-900/10">
                {trustData.trustName?.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{trustData.trustName}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {trustData.status || 'ACTIVE'}
                </span>
                <span className="bg-[#0964e5]/10 text-[#0964e5] border border-[#0964e5]/20 text-[10px] font-extrabold px-3 py-1 rounded-md uppercase">
                  {trustData.plan || 'PRO'} PLAN
                </span>
                <span className="bg-purple-50 text-purple-700 border border-purple-200/60 text-[10px] font-extrabold px-3 py-1 rounded-md uppercase">
                  QUOTA: {schoolsList.length} / {trustData.maxSchools || 10} SCHOOLS
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-4">
                <span>Subdomain Slug: <strong className="text-blue-600 font-mono">/{trustData.slug}</strong></span>
                <span>•</span>
                <span>Reg No: <strong>{trustData.registrationNo || 'N/A'}</strong></span>
                {trustData.establishmentYear && (
                  <>
                    <span>•</span>
                    <span>Est. Year: <strong>{trustData.establishmentYear}</strong></span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/master/trusts/${trustId}/edit`}
              className="bg-[#0964e5] hover:bg-[#033ac4] text-white text-xs font-bold px-4 py-2.5 rounded-md shadow-md shadow-[#0964e5]/20 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit 4-Step Setup</span>
            </Link>

            <button
              onClick={handleDeleteTrust}
              disabled={deleting}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold px-4 py-2.5 rounded-md transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              <span>{deleting ? 'Deleting...' : 'Delete Trust'}</span>
            </button>

            <Link
              href="/master/trusts"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-md transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
          </div>
        </div>

        {/* Navigation Inspection Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('governance')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'governance'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Governance & Management</span>
          </button>

          <button
            onClick={() => setActiveTab('schools')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'schools'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <School className="w-4 h-4" />
            <span>Schools Directory ({schoolsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'admins'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Provisioned Admins ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'gateways'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Gateways & Banking</span>
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'activity'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Activity Preview Log</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: Governance & Management */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Users className="w-4 h-4 text-slate-700" />
              <span>Trust Executive Leadership</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">President / Chairman Name</span>
                <span className="font-bold text-slate-900 text-sm">{trustData.presidentName || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">President Contact No</span>
                <span className="font-semibold text-slate-700">{trustData.presidentNo || 'Not Specified'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Board Trustees</span>
                {Array.isArray(trustData.trusteesName) && trustData.trusteesName.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {trustData.trusteesName.map((tName: string, i: number) => (
                      <span key={i} className="bg-slate-100 text-slate-800 text-[11px] font-bold px-3 py-1 rounded-full">
                        {tName}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-500 font-medium">No additional trustees specified</span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 pb-2 border-b border-slate-100">
              <Award className="w-4 h-4 text-slate-700" />
              <span>Legal Compliance & Limits</span>
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Sponsorship & Aid Framework Lock</span>
                <div className="mt-1">
                  {trustData.sponsorshipMode === 'DONATION' ? (
                    <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-3 py-1 rounded-md border border-emerald-200">
                      <span>🤝</span>
                      <span>Donation / Scholarship Mode (Secular & General Aid)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 text-[11px] font-extrabold px-3 py-1 rounded-md border border-amber-200">
                      <span>🕌</span>
                      <span>Zakat & Lillah Mode (Faith-Based Welfare)</span>
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">80G Tax Exemption No</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{trustData.taxExemptionNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">SaaS Subscription Limits</span>
                <div className="flex items-center gap-4 mt-1">
                  <div className="bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-full text-xs">
                    Max Schools: {trustData.maxSchools || 10}
                  </div>
                  <div className="bg-emerald-50 text-emerald-700 font-bold px-3 py-1 rounded-full text-xs">
                    Max Alumni: {trustData.maxAlumni || 10000}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: Schools Directory */}
      {activeTab === 'schools' && (
        <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Associated Schools List</h3>
            <Link
              href={`/master/schools/new?trustId=${trustData.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-colors"
            >
              + Add School to Trust
            </Link>
          </div>

          {schoolsList.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 font-semibold">No schools provisioned under this trust yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {schoolsList.map((s) => (
                <div key={s.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                  <div className="flex items-center gap-3">
                    {s.logoUrl ? (
                      <img src={s.logoUrl} alt={s.schoolName} className="w-10 h-10 rounded-xl object-contain p-0.5 bg-white border border-slate-200 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {s.schoolName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{s.schoolName}</h4>
                      <p className="text-[11px] text-blue-600 font-mono font-semibold">Subdomain: /{s.subdomain}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-200/60 text-slate-600">
                    <div>Medium: <strong className="text-slate-900">{s.medium || 'English'}</strong></div>
                    <div>DISE: <strong className="text-slate-900 font-mono">{s.schoolDiseNo || 'N/A'}</strong></div>
                    <div>Students: <strong className="text-slate-900">{s.currentStudentsNo || 0}</strong></div>
                    <div>RTE: <strong className="text-slate-900">{s.isHaveRTE ? 'Yes' : 'No'}</strong></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT 3: Provisioned Admins */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 overflow-hidden">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="text-slate-400 text-[11px] font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="pb-3 pl-2">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Phone</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pl-2 font-bold text-slate-900">{u.name}</td>
                  <td className="py-3 text-slate-600 font-medium">{u.email}</td>
                  <td className="py-3">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase ${
                      u.role === 'SUPER_ADMIN' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 text-slate-500">{u.phoneNo || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB CONTENT 4: Gateways & Banking */}
      {activeTab === 'gateways' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-700" />
              <span>Razorpay Payment Gateway</span>
            </h3>
            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-400 font-semibold block">Razorpay Key ID</span>
                <span className="font-mono font-bold text-slate-900">{trustData.razorpayKeyId || 'Platform Default'}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-[32px] p-6 shadow-xs border border-white/80 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <span>Bank Account Details</span>
            </h3>
            <div className="text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 text-slate-800">
              {trustData.bankAccountDetails || 'No bank account details uploaded.'}
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRUST SETUP MODAL */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[32px] max-w-3xl w-full p-6 md:p-8 shadow-2xl border border-white/80 my-8 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#E64A19] flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Edit Trust & Governance Setup</h3>
                  <p className="text-xs text-slate-400">Update trust profile, branding, leadership, and subscription limits</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveError && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200">
                {saveError}
              </div>
            )}

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-200 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{saveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-6">
              {/* SECTION 1: Identity & Branding */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>1. Trust Identity & Branding</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Trust Official Name *</label>
                    <input
                      type="text"
                      required
                      value={editForm.trustName || ''}
                      onChange={e => setEditForm({ ...editForm, trustName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subdomain Slug *</label>
                    <input
                      type="text"
                      required
                      value={editForm.slug || ''}
                      onChange={e => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Registration No</label>
                    <input
                      type="text"
                      value={editForm.registrationNo || ''}
                      onChange={e => setEditForm({ ...editForm, registrationNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Establishment Year</label>
                    <input
                      type="number"
                      value={editForm.establishmentYear || ''}
                      onChange={e => setEditForm({ ...editForm, establishmentYear: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <LogoUploadInput
                      label="Trust Official Logo (Upload File or Enter Image URL)"
                      value={editForm.logoUrl || ''}
                      onChange={(url) => setEditForm({ ...editForm, logoUrl: url })}
                      folder="trust-logos-edit"
                      placeholder="Upload logo file or paste image URL..."
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: Leadership & Governance */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-700" />
                  <span>2. Executive Leadership & Governance</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">President / Chairman Name</label>
                    <input
                      type="text"
                      value={editForm.presidentName || ''}
                      onChange={e => setEditForm({ ...editForm, presidentName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">President Contact No</label>
                    <input
                      type="text"
                      value={editForm.presidentNo || ''}
                      onChange={e => setEditForm({ ...editForm, presidentNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">80G Tax Exemption No</label>
                    <input
                      type="text"
                      value={editForm.taxExemptionNo || ''}
                      onChange={e => setEditForm({ ...editForm, taxExemptionNo: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Plan</label>
                    <select
                      value={editForm.plan || 'PRO'}
                      onChange={e => setEditForm({ ...editForm, plan: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                    >
                      <option value="STARTER">STARTER</option>
                      <option value="PRO">PRO</option>
                      <option value="ENTERPRISE">ENTERPRISE</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Schools Limit</label>
                    <input
                      type="number"
                      value={editForm.maxSchools || 10}
                      onChange={e => setEditForm({ ...editForm, maxSchools: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Alumni Limit</label>
                    <input
                      type="number"
                      value={editForm.maxAlumni || 10000}
                      onChange={e => setEditForm({ ...editForm, maxAlumni: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3: Razorpay & Banking */}
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 pb-1 border-b border-slate-100 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  <span>3. Payment Gateway & Banking Setup</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={editForm.razorpayKeyId || ''}
                      onChange={e => setEditForm({ ...editForm, razorpayKeyId: e.target.value })}
                      placeholder="rzp_live_..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      value={editForm.razorpayKeySecret || ''}
                      onChange={e => setEditForm({ ...editForm, razorpayKeySecret: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Details</label>
                    <textarea
                      rows={3}
                      value={editForm.bankAccountDetails || ''}
                      onChange={e => setEditForm({ ...editForm, bankAccountDetails: e.target.value })}
                      placeholder="Bank Name, Account Number, IFSC Code, Branch..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveLoading}
                  className="bg-[#0964e5] hover:bg-[#033ac4] text-white text-xs font-bold px-6 py-2.5 rounded-full shadow-md shadow-[#0964e5]/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: Activity Preview Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0964e5] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0964e5]" />
            <span>Educational Trust Activity Preview Log</span>
          </h2>

          <div className="space-y-3">
            {[
              { title: 'Trust Provisioned', time: 'Initial Deployment', desc: `Trust account "${trustData.trustName}" provisioned with ${trustData.plan || 'PRO'} plan subscription.`, icon: Building2, color: 'text-[#0964e5]' },
              { title: 'Schools Linked', time: 'Active Campuses', desc: `Associated ${schoolsList.length} school campus(es) under trust management.`, icon: School, color: 'text-emerald-500' },
              { title: 'SuperAdmin Account', time: 'Governance', desc: `Primary SuperAdmin assigned: ${trustData.superAdminEmail || 'admin@mygurukul.org'}`, icon: UserCheck, color: 'text-purple-500' },
              { title: 'Payment Gateway', time: 'Razorpay Key Sync', desc: 'Razorpay API credentials set up for multi-tenant fee receipts.', icon: CreditCard, color: 'text-sky-500' },
            ].map((act, idx) => {
              const IconComp = act.icon;
              return (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-md border border-slate-100 flex items-start gap-3 text-xs">
                  <IconComp className={`w-4 h-4 mt-0.5 ${act.color}`} />
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <span>{act.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">• {act.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{act.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
