'use client';
import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  School as SchoolIcon, 
  Building2, 
  ArrowLeft, 
  Users, 
  Globe, 
  CreditCard, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  Activity, 
  Clock, 
  Database,
  ExternalLink,
  UserCheck,
  Zap,
  Edit3
} from 'lucide-react';

export default function MasterSchoolDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const schoolId = resolvedParams.id;
  const router = useRouter();

  const [schoolData, setSchoolData] = useState<any>(null);
  const [trustData, setTrustData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'admins' | 'gateways' | 'activity'>('overview');

  useEffect(() => {
    fetch(`/api/master/schools/${schoolId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setSchoolData(data.school);
          setTrustData(data.trust);
          setUsersList(data.users || []);
          setTelemetry(data.telemetry);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [schoolId]);

  const toggleSchoolPage = async () => {
    const nextVal = schoolData.isSchoolPageEnabled === false ? true : false;
    try {
      const res = await fetch(`/api/master/schools/${schoolId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isSchoolPageEnabled: nextVal }),
      });
      const data = await res.json();
      if (data.success) {
        setSchoolData((prev: any) => ({ ...prev, isSchoolPageEnabled: nextVal }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-none p-12 text-center text-xs font-semibold text-slate-400 border border-slate-200">
        Loading school institution telemetry...
      </div>
    );
  }

  if (!schoolData) {
    return (
      <div className="bg-white rounded-none p-12 text-center text-xs font-semibold text-slate-500 border border-slate-200 space-y-3">
        <p>School institution record not found.</p>
        <Link href="/master/schools" className="inline-flex items-center gap-1.5 bg-[#0964e5] text-white px-4 py-2 rounded-md text-xs font-bold">
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Schools Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner Card */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {schoolData.logoUrl ? (
                <img src={schoolData.logoUrl} alt={schoolData.schoolName} className="w-full h-full object-cover" />
              ) : (
                <SchoolIcon className="w-7 h-7 text-[#0964e5]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-[#020637] tracking-tight">{schoolData.schoolName}</h1>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase">
                  ACTIVE CAMPUS
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase border ${schoolData.isSchoolPageEnabled !== false ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {schoolData.isSchoolPageEnabled !== false ? 'School Page: Active' : 'School Page: Teachers Only'}
                </span>
              </div>
              <p className="text-xs text-[#757e93] font-medium mt-1 flex items-center gap-2">
                <span>{schoolData.medium || 'English'} Medium</span>
                <span>•</span>
                <span>DISE Code: <strong className="font-mono text-slate-800">{schoolData.schoolDiseNo || 'N/A'}</strong></span>
                <span>•</span>
                <span>Est. Year: <strong>{schoolData.establishYear || 'N/A'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => router.back()}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-md transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-100 mt-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <SchoolIcon className="w-4 h-4" />
            <span>Campus Overview</span>
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
            <span>Campus Sub-Admins ({usersList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
              activeTab === 'gateways'
                ? 'bg-[#020637] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Email & Payment Gateways</span>
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

      {/* TAB 1: Campus Overview */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="md:col-span-2 bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#0964e5] pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0964e5]" />
              <span>Campus Profile & Parent Trust Association</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Parent Trust</span>
                <div className="font-bold text-[#020637] text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#0964e5]" />
                  {trustData ? (
                    <Link href={`/master/trusts/${trustData.id}`} className="hover:underline text-[#0964e5]">
                      {trustData.trustName}
                    </Link>
                  ) : (
                    <span>Unassigned Trust</span>
                  )}
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-100 space-y-1">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Enrolled Students</span>
                <div className="font-extrabold text-[#020637] text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>{schoolData.currentStudentsNo || 0} Students</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-100 space-y-1 sm:col-span-2">
                <span className="text-[11px] text-slate-400 font-bold uppercase">Subdomain & Routing URL</span>
                <div className="font-mono text-xs font-bold text-[#0964e5] flex items-center gap-2 pt-0.5">
                  <Globe className="w-4 h-4" />
                  <a href={`http://${schoolData.subdomain || 'school'}.mygurukul.org`} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1">
                    <span>{schoolData.subdomain ? `${schoolData.subdomain}.mygurukul.org` : 'Default Subdomain'}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </a>
                </div>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-md border border-slate-100 space-y-2 sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-400 font-bold uppercase">Public School Page Access</span>
                    <div className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schoolData.isSchoolPageEnabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                        {schoolData.isSchoolPageEnabled !== false ? 'Full School Page Enabled' : 'Faculty / Teachers Only'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={toggleSchoolPage}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                      schoolData.isSchoolPageEnabled !== false
                        ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {schoolData.isSchoolPageEnabled !== false ? 'Disable School Page' : 'Enable School Page'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  {schoolData.isSchoolPageEnabled !== false
                    ? 'Sub-admin has access to full public school page (About, Academic Programs, Facilities, Co-Curriculars & Teachers).'
                    : 'Public school page is disabled. In sub-admin School Page, only School Faculty & Staff Register will be visible.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Storage Telemetry Card */}
          <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Database className="w-4 h-4 text-[#0964e5]" />
              <span>Campus Storage Footprint</span>
            </h3>

            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-2">
              <div className="text-[11px] font-bold text-slate-500">Allocated Space</div>
              <div className="text-2xl font-black text-[#020637] font-mono">{telemetry?.estSizeFormatted || '153.6 KB'}</div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div className="bg-[#0964e5] h-full" style={{ width: '25%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Provisioned Sub-Admins */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0964e5] pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-[#0964e5]" />
            <span>Provisioned Campus Sub-Admins ({usersList.length})</span>
          </h2>

          {usersList.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">No sub-admins provisioned for this campus yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {usersList.map((usr) => (
                <div key={usr.id} className="p-4 bg-slate-50 rounded-md border border-slate-100 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                      <span>{usr.name || 'Campus Admin'}</span>
                      <span className="bg-blue-100 text-[#0964e5] text-[9px] font-bold px-2 py-0.5 rounded-md">
                        {usr.role || 'SUB_ADMIN'}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">{usr.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Gateways */}
      {activeTab === 'gateways' && (
        <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0964e5] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0964e5]" />
            <span>Campus Gateways & API Credentials</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-[#0964e5]" />
                  <span>Brevo Email Gateway</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {schoolData.brevoApiKey ? 'DEDICATED KEY' : 'PARENT TRUST FALLBACK'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {schoolData.brevoApiKey 
                  ? 'Dedicated Brevo API Key configured for school automated receipts & credentials.' 
                  : 'Inheriting parent Educational Trust Brevo API key configuration.'}
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-md border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0964e5]" />
                  <span>Razorpay Payment Gateway</span>
                </span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                  ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Razorpay online fees collection active under parent trust merchant account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Activity Preview Log */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-none p-6 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#0964e5] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#0964e5]" />
            <span>Campus Activity Preview Log</span>
          </h2>

          <div className="space-y-3">
            {[
              { title: 'Campus Onboarded', time: 'Initial Provisioning', desc: 'School campus profile created & assigned to parent trust.', icon: CheckCircle2, color: 'text-emerald-500' },
              { title: 'Subdomain Active', time: 'Live Routing', desc: `Routing active on ${schoolData.subdomain || 'school'}.mygurukul.org`, icon: Globe, color: 'text-[#0964e5]' },
              { title: 'Brevo Waterfall Active', time: 'Active Sync', desc: 'Email dispatch engine verified for automated 80G receipt delivery.', icon: Mail, color: 'text-purple-500' },
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
