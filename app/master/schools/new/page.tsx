'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LogoUploadInput from '@/app/components/LogoUploadInput';
import {
  School as SchoolIcon,
  Building2,
  Sparkles,
  CreditCard,
  Mail,
  Globe,
  UserCheck,
  Rocket,
  ArrowLeft,
  CheckCircle2
} from 'lucide-react';

export default function OnboardSchoolPage() {
  const [trustsList, setTrustsList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    trustId: '',
    schoolName: '',
    schoolDiseNo: '',
    medium: 'English',
    establishYear: '',
    totalStandards: '10',
    currentStudentsNo: '',
    isHaveRTE: false,
    isSchoolPageEnabled: true,
    address: '',
    phoneNo: '',
    email: '',
    sscIndexNo: '',
    hscIndexNo: '',

    // Branding & Domain
    logoUrl: '',
    subdomain: '',
    customDomain: '',
    domainPurchaseUrl: '',
    domainDescription: '',

    // School-level Gateways
    brevoApiKey: '',
    brevoSenderEmail: '',
    brevoSenderName: '',
    razorpayKeyId: '',
    razorpayKeySecret: '',

    // SubAdmin Officer Provisioning
    subAdminName: '',
    subAdminEmail: '',
    subAdminPassword: '',
    subAdminPhone: ''
  });

  const [loading, setLoading] = useState(false);
  const [fetchingTrusts, setFetchingTrusts] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/master/trusts')
      .then(res => res.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.trusts || []);
        setTrustsList(list);
        if (list.length > 0) {
          setFormData(prev => ({ ...prev, trustId: list[0].id }));
        }
      })
      .catch(console.error)
      .finally(() => setFetchingTrusts(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trustId) {
      setError('Please select a parent Educational Trust');
      return;
    }
    if (!formData.schoolName) {
      setError('Please enter the School Name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/master/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard school');

      router.push('/master/schools');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      {/* Header Banner */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200">
        <h1 className="text-2xl font-bold text-[#020637] flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-md bg-[#0964e5] text-white flex items-center justify-center shadow-md shadow-[#0964e5]/20">
            <SchoolIcon className="w-5 h-5" />
          </div>
          <span>Onboard New Educational Institution</span>
        </h1>
        <p className="text-xs text-[#757e93] font-medium ml-1 mt-1">Provision a new school under an existing Educational Trust with custom logo, subdomain & gateways</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-semibold px-6 shadow-xs">
          {error}
        </div>
      )}

      {/* Main Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-none p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-8">

        {/* SECTION 1: Parent Trust Selection & School Profile */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>1. Parent Trust Association & School Profile</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Select Parent Educational Trust *</label>
                <a
                  href="/master/trusts/new"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 underline flex items-center gap-1"
                >
                  <span>+ Onboard New Trust</span>
                </a>
              </div>
              {fetchingTrusts ? (
                <div className="text-xs text-slate-400 py-2.5">Loading trusts...</div>
              ) : (
                <select
                  required
                  value={formData.trustId}
                  onChange={e => setFormData({ ...formData, trustId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                >
                  {trustsList.length === 0 ? (
                    <option value="">No Trusts Found — Click "+ Onboard New Trust" above</option>
                  ) : (
                    trustsList.map(trust => (
                      <option key={trust.id} value={trust.id}>
                        {trust.trustName} ({trust.slug})
                      </option>
                    ))
                  )}
                </select>
              )}
              {trustsList.length === 0 && !fetchingTrusts && (
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center justify-between gap-2">
                  <span>⚠️ No Educational Trust exists in database yet. Please onboard a Trust first.</span>
                  <a
                    href="/master/trusts/new"
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg shrink-0 transition-colors"
                  >
                    Create Trust Now
                  </a>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Legal Name *</label>
              <input
                type="text"
                required
                value={formData.schoolName}
                onChange={e => setFormData({ ...formData, schoolName: e.target.value })}
                placeholder="e.g. Madni Higher Secondary School"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Government DISE Code</label>
              <input
                type="text"
                value={formData.schoolDiseNo}
                onChange={e => setFormData({ ...formData, schoolDiseNo: e.target.value })}
                placeholder="e.g. DISE-240105001"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Medium of Instruction</label>
              <select
                value={formData.medium}
                onChange={e => setFormData({ ...formData, medium: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              >
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
                <option value="Gujarati">Gujarati</option>
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Establishment Year</label>
              <input
                type="number"
                value={formData.establishYear}
                onChange={e => setFormData({ ...formData, establishYear: e.target.value })}
                placeholder="e.g. 2005"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Total Student Enrolled</label>
              <input
                type="number"
                value={formData.currentStudentsNo}
                onChange={e => setFormData({ ...formData, currentStudentsNo: e.target.value })}
                placeholder="e.g. 450"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: School Logo & Custom Subdomain Routing */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>2. School Logo Branding & Domain Routing</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <LogoUploadInput
                label="School Campus Logo (Upload File or Enter Image URL)"
                value={formData.logoUrl}
                onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                folder="school-logos"
                placeholder="Upload school logo file or paste image URL..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Subdomain Slug</label>
              <input
                type="text"
                value={formData.subdomain}
                onChange={e => setFormData({ ...formData, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="e.g. madni-highschool"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom Domain URL</label>
              <input
                type="text"
                value={formData.customDomain}
                onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                placeholder="e.g. highschool.madni.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Domain Purchase / Registrar Link</label>
              <input
                type="url"
                value={formData.domainPurchaseUrl}
                onChange={e => setFormData({ ...formData, domainPurchaseUrl: e.target.value })}
                placeholder="e.g. https://godaddy.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Domain Notes / Description</label>
              <input
                type="text"
                value={formData.domainDescription}
                onChange={e => setFormData({ ...formData, domainDescription: e.target.value })}
                placeholder="Primary school routing description"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Public School Page Feature Toggle */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4 mt-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">Public School Page Access</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.isSchoolPageEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                  {formData.isSchoolPageEnabled ? 'Full School Page Enabled' : 'Faculty / Teachers Only'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {formData.isSchoolPageEnabled 
                  ? 'Sub-admin can manage full public school page (About, Academic Programs, Facilities, Co-Curriculars & Teachers).'
                  : 'Public school page is disabled. In sub-admin School Page, only School Faculty & Staff Register will be visible; all other sections are hidden.'}
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={formData.isSchoolPageEnabled}
                onChange={(e) => setFormData({ ...formData, isSchoolPageEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* SECTION 3: School-Specific Gateways */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600" />
            <span>3. School-Level Gateways (Optional Override)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Razorpay Key ID</label>
              <input
                type="text"
                value={formData.razorpayKeyId}
                onChange={e => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                placeholder="rzp_live_..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Razorpay Key Secret</label>
              <input
                type="password"
                value={formData.razorpayKeySecret}
                onChange={e => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                placeholder="Secret Key (Inherit Trust if blank)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">School Brevo API Key</label>
              <input
                type="password"
                value={formData.brevoApiKey}
                onChange={e => setFormData({ ...formData, brevoApiKey: e.target.value })}
                placeholder="xkeysib-... (Inherit Trust if blank)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Custom School Sender Email</label>
              <input
                type="email"
                value={formData.brevoSenderEmail}
                onChange={e => setFormData({ ...formData, brevoSenderEmail: e.target.value })}
                placeholder="admissions@school.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: SubAdmin Officer Credentials */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700 pb-2 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>4. SubAdmin Officer Credentials (Optional)</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Officer Name</label>
              <input
                type="text"
                value={formData.subAdminName}
                onChange={e => setFormData({ ...formData, subAdminName: e.target.value })}
                placeholder="Officer Full Name"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Officer Email</label>
              <input
                type="email"
                value={formData.subAdminEmail}
                onChange={e => setFormData({ ...formData, subAdminEmail: e.target.value })}
                placeholder="officer@school.org"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.subAdminPassword}
                onChange={e => setFormData({ ...formData, subAdminPassword: e.target.value })}
                placeholder="Temporary Password"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0964e5] hover:bg-[#033ac4] text-white font-bold py-3.5 rounded-md text-xs transition-all shadow-md shadow-[#0964e5]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Rocket className="w-4 h-4 text-white" />
          <span>{loading ? 'Onboarding School...' : 'Onboard School & Link to Educational Trust'}</span>
        </button>
      </form>
    </div>
  );
}
