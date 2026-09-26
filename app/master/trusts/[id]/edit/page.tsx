'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import LogoUploadInput from '@/app/components/LogoUploadInput';
import { 
  Sparkles, 
  Building2, 
  CreditCard, 
  UserCheck, 
  School,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Save,
  ShieldCheck,
  Mail,
  Lock,
  Globe,
  FileText,
  Phone,
  ArrowLeft,
  Loader2
} from 'lucide-react';

export default function EditTrustWizardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const trustId = resolvedParams.id;
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Step 1 & Step 2 Trust Data
  const [formData, setFormData] = useState<any>({
    trustName: '',
    slug: '',
    registrationNo: '',
    establishmentYear: '',
    presidentName: '',
    presidentNo: '',
    trusteesName: '',
    logoUrl: '',
    primaryColor: '#0f172a',
    plan: 'PRO',
    maxSchools: '10',
    maxAlumni: '10000',
    taxExemptionNo: '',
    sponsorshipMode: 'ZAKAT_LILLAH',

    // SuperAdmin Credentials
    superAdminId: '',
    superAdminName: '',
    superAdminEmail: '',
    superAdminPassword: '',
    superAdminPhone: '',

    // Step 2: Payment Gateways & Banking
    razorpayKeyId: '',
    razorpayKeySecret: '',
    bankAccountDetails: '',
  });

  // Step 3: Schools Array
  const [schoolsList, setSchoolsList] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/master/trusts/${trustId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const t = data.trust;
          const superAdminUser = (data.users || []).find((u: any) => u.role === 'SUPER_ADMIN') || {};

          setFormData({
            trustName: t.trustName || '',
            slug: t.slug || '',
            customDomain: t.customDomain || '',
            domainPurchaseUrl: t.domainPurchaseUrl || '',
            registrationNo: t.registrationNo || '',
            establishmentYear: t.establishmentYear ? String(t.establishmentYear) : '',
            presidentName: t.presidentName || '',
            presidentNo: t.presidentNo || '',
            trusteesName: Array.isArray(t.trusteesName) ? t.trusteesName.join(', ') : '',
            logoUrl: t.logoUrl || '',
            primaryColor: t.primaryColor || '#0f172a',
            plan: t.plan || 'PRO',
            maxSchools: t.maxSchools ? String(t.maxSchools) : '10',
            maxAlumni: t.maxAlumni ? String(t.maxAlumni) : '10000',
            taxExemptionNo: t.taxExemptionNo || '',
            sponsorshipMode: t.sponsorshipMode || 'ZAKAT_LILLAH',

            superAdminId: superAdminUser.id || '',
            superAdminName: superAdminUser.name || '',
            superAdminEmail: superAdminUser.email || '',
            superAdminPassword: '',
            superAdminPhone: superAdminUser.phoneNo || '',

            razorpayKeyId: t.razorpayKeyId || '',
            razorpayKeySecret: t.razorpayKeySecret || '',
            brevoApiKey: t.brevoApiKey || '',
            brevoSenderEmail: t.brevoSenderEmail || '',
            brevoSenderName: t.brevoSenderName || '',
            bankAccountDetails: t.bankAccountDetails || '',
          });

          // Map Schools & SubAdmin Officers
          const mappedSchools = (data.schools || []).map((s: any) => {
            const officer = (data.users || []).find((u: any) => u.role === 'SUB_ADMIN' && u.schoolId === s.id) || {};
            return {
              id: s.id,
              schoolName: s.schoolName || '',
              schoolDiseNo: s.schoolDiseNo || '',
              medium: s.medium || 'English',
              address: s.address || '',
              phoneNo: s.phoneNo || '',
              email: s.email || '',
              establishYear: s.establishYear ? String(s.establishYear) : '',
              totalStandards: s.totalStandards ? String(s.totalStandards) : '10',
              currentStudentsNo: s.currentStudentsNo ? String(s.currentStudentsNo) : '',
              isHaveRTE: Boolean(s.isHaveRTE),
              logoUrl: s.logoUrl || '',
              subdomain: s.subdomain || '',
              customDomain: s.customDomain || '',
              domainPurchaseUrl: s.domainPurchaseUrl || '',
              domainDescription: s.domainDescription || '',
              razorpayKeyId: s.razorpayKeyId || '',
              razorpayKeySecret: s.razorpayKeySecret || '',
              brevoApiKey: s.brevoApiKey || '',
              brevoSenderEmail: s.brevoSenderEmail || '',
              brevoSenderName: s.brevoSenderName || '',
              subAdminId: officer.id || '',
              subAdminName: officer.name || '',
              subAdminEmail: officer.email || '',
              subAdminPassword: '',
              subAdminPhone: officer.phoneNo || ''
            };
          });

          if (mappedSchools.length === 0) {
            mappedSchools.push({
              schoolName: '',
              schoolDiseNo: '',
              medium: 'English',
              subdomain: '',
              logoUrl: '',
              subAdminName: '',
              subAdminEmail: '',
              subAdminPassword: '',
              subAdminPhone: ''
            });
          }

          setSchoolsList(mappedSchools);
        } else {
          setError(data.error || 'Failed to load trust details');
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch trust details');
        setLoading(false);
      });
  }, [trustId]);

  const addSchoolCard = () => {
    setSchoolsList(prev => [
      ...prev,
      {
        schoolName: '',
        schoolDiseNo: '',
        medium: 'English',
        address: '',
        phoneNo: '',
        email: '',
        establishYear: '',
        totalStandards: '10',
        currentStudentsNo: '',
        isHaveRTE: false,
        logoUrl: '',
        subdomain: '',
        customDomain: '',
        domainDescription: '',
        razorpayKeyId: '',
        razorpayKeySecret: '',
        subAdminName: '',
        subAdminEmail: '',
        subAdminPassword: '',
        subAdminPhone: ''
      }
    ]);
  };

  const removeSchoolCard = (index: number) => {
    if (schoolsList.length === 1) return;
    setSchoolsList(prev => prev.filter((_, i) => i !== index));
  };

  const updateSchoolCard = (index: number, field: string, value: any) => {
    setSchoolsList(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleNextStep = () => {
    setError('');
    if (currentStep === 1) {
      if (!formData.trustName || !formData.slug || !formData.superAdminEmail) {
        setError('Please fill in Trust Name, Subdomain Slug, and SuperAdmin Email');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch(`/api/master/trusts/${trustId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          schoolsList
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update trust setup');

      setSuccess('Trust setup updated successfully!');
      setTimeout(() => {
        router.push(`/master/trusts/${trustId}`);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Error saving changes');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-[32px] p-12 text-center text-xs font-bold text-slate-400 shadow-xs border border-white/80">
        Loading trust setup wizard...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Wizard Header Banner */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[#0964e5] text-white flex items-center justify-center shadow-md shadow-[#0964e5]/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#020637] tracking-tight">Edit Trust Setup</h1>
              <p className="text-xs text-slate-500 font-medium">Modify 4-step governance setup for {formData.trustName || 'Trust'}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => router.back()}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-md transition-all flex items-center gap-1.5 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Back</span>
        </button>
      </div>

      {/* 4-Step Progress Indicator Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { step: 1, label: '1. Identity & Admin', icon: Building2 },
          { step: 2, label: '2. Payment Gateways', icon: CreditCard },
          { step: 3, label: '3. Multi-School Setup', icon: School },
          { step: 4, label: '4. Save & Deploy', icon: Save },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <button
              key={item.step}
              onClick={() => setCurrentStep(item.step)}
              className={`p-3.5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center gap-2.5 ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md shadow-slate-900/10'
                  : isDone
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : isDone ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 text-xs font-bold rounded-2xl border border-rose-200/80">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-2xl border border-emerald-200/80 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Wizard Card */}
      <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-white/80">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: Trust Identity & SuperAdmin Credentials */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Step 1: Trust Identity & SuperAdmin Credentials</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trust Legal Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.trustName}
                    onChange={e => setFormData({ ...formData, trustName: e.target.value })}
                    placeholder="e.g. Crescent Education Trust"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subdomain Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={e => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="e.g. crescent-trust"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Custom Trust Domain URL (Optional)</label>
                  <input
                    type="text"
                    value={formData.customDomain}
                    onChange={e => setFormData({ ...formData, customDomain: e.target.value })}
                    placeholder="e.g. crescenttrust.org"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domain Purchase / Provider Link (Optional)</label>
                  <input
                    type="url"
                    value={formData.domainPurchaseUrl}
                    onChange={e => setFormData({ ...formData, domainPurchaseUrl: e.target.value })}
                    placeholder="e.g. https://godaddy.com or registrar management URL"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registration No</label>
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                    placeholder="e.g. REG/2021/1004"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Establishment Year</label>
                  <input
                    type="number"
                    value={formData.establishmentYear}
                    onChange={e => setFormData({ ...formData, establishmentYear: e.target.value })}
                    placeholder="e.g. 1998"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">President / Chairman Name</label>
                  <input
                    type="text"
                    value={formData.presidentName}
                    onChange={e => setFormData({ ...formData, presidentName: e.target.value })}
                    placeholder="President Name"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">President Contact No</label>
                  <input
                    type="text"
                    value={formData.presidentNo}
                    onChange={e => setFormData({ ...formData, presidentNo: e.target.value })}
                    placeholder="+91 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <LogoUploadInput
                    label="Trust Official Logo (Upload File or Enter Image URL)"
                    value={formData.logoUrl}
                    onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                    folder="trust-logos-edit"
                    placeholder="Upload logo file or paste image URL..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Plan</label>
                  <select
                    value={formData.plan}
                    onChange={e => setFormData({ ...formData, plan: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-blue-600 focus:outline-none"
                  >
                    <option value="STARTER">STARTER</option>
                    <option value="PRO">PRO</option>
                    <option value="ENTERPRISE">ENTERPRISE</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tax Exemption No (80G)</label>
                  <input
                    type="text"
                    value={formData.taxExemptionNo}
                    onChange={e => setFormData({ ...formData, taxExemptionNo: e.target.value })}
                    placeholder="e.g. 80G/TRUST/2022/1004"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* SPONSORSHIP MECHANISM & TERMINOLOGY LOCK */}
              <div className="p-5 bg-gradient-to-br from-slate-50 to-blue-50/40 rounded-xl border border-blue-100/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-600" />
                      <span>Sponsorship & Student Aid Framework Lock</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Lock the financial aid terminology and student bulk import categories for this Trust and all its school sub-admins.
                    </p>
                  </div>
                  <span className="bg-blue-100/80 text-blue-700 text-[10px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    Mandatory Governance
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {/* Option 1: Faith-Based (Zakat & Lillah) */}
                  <div
                    onClick={() => setFormData({ ...formData, sponsorshipMode: 'ZAKAT_LILLAH' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      formData.sponsorshipMode === 'ZAKAT_LILLAH'
                        ? 'border-blue-600 bg-white shadow-md shadow-blue-500/10'
                        : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🕌</span>
                          <h4 className="text-xs font-extrabold text-slate-900">Zakat & Lillah Framework</h4>
                        </div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-amber-50 text-amber-700 border border-amber-200/60">
                          Faith-Based Welfare
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="sponsorshipMode"
                        checked={formData.sponsorshipMode === 'ZAKAT_LILLAH'}
                        onChange={() => setFormData({ ...formData, sponsorshipMode: 'ZAKAT_LILLAH' })}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Student Excel template accepts <b className="text-slate-800">ZAKAT</b>, <b className="text-slate-800">LILLAH</b>, <b className="text-slate-800">GENERAL</b>. Sub-Admin dashboards report separate Zakat vs Lillah Fund Focus.
                    </p>
                  </div>

                  {/* Option 2: General / Secular (Donation) */}
                  <div
                    onClick={() => setFormData({ ...formData, sponsorshipMode: 'DONATION' })}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      formData.sponsorshipMode === 'DONATION'
                        ? 'border-blue-600 bg-white shadow-md shadow-blue-500/10'
                        : 'border-slate-200 bg-white/60 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">🤝</span>
                          <h4 className="text-xs font-extrabold text-slate-900">Donation / Scholarship Framework</h4>
                        </div>
                        <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          Secular & General Aid
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="sponsorshipMode"
                        checked={formData.sponsorshipMode === 'DONATION'}
                        onChange={() => setFormData({ ...formData, sponsorshipMode: 'DONATION' })}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Student Excel template accepts <b className="text-slate-800">DONATION</b>, <b className="text-slate-800">GENERAL</b>. Sub-Admin dashboards report unified Donation & Scholarship Fund Focus.
                    </p>
                  </div>
                </div>
              </div>

              {/* SuperAdmin User Subsection */}
              <div className="p-5 bg-orange-50/70 rounded-2xl border border-orange-200/80 space-y-4">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-orange-600" />
                  Primary SuperAdmin Account Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SuperAdmin Name</label>
                    <input
                      type="text"
                      value={formData.superAdminName}
                      onChange={e => setFormData({ ...formData, superAdminName: e.target.value })}
                      placeholder="Admin Name"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">SuperAdmin Email *</label>
                    <input
                      type="email"
                      required
                      value={formData.superAdminEmail}
                      onChange={e => setFormData({ ...formData, superAdminEmail: e.target.value })}
                      placeholder="admin@trust.org"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Optional)</label>
                    <input
                      type="password"
                      value={formData.superAdminPassword}
                      onChange={e => setFormData({ ...formData, superAdminPassword: e.target.value })}
                      placeholder="Leave blank to keep current"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Gateways & Banking */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                <span>Step 2: Razorpay Payment Gateway & Banking Setup</span>
              </h2>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-700" />
                  Razorpay Merchant API Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key ID</label>
                    <input
                      type="text"
                      value={formData.razorpayKeyId}
                      onChange={e => setFormData({ ...formData, razorpayKeyId: e.target.value })}
                      placeholder="rzp_live_..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Razorpay Key Secret</label>
                    <input
                      type="password"
                      value={formData.razorpayKeySecret}
                      onChange={e => setFormData({ ...formData, razorpayKeySecret: e.target.value })}
                      placeholder="••••••••••••"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Brevo Email Gateway Card */}
              <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 space-y-4">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  Trust-Wide Brevo Email Gateway (Optional)
                </h3>
                <p className="text-[11px] text-slate-600 font-medium">
                  Configure custom Brevo API key for this Trust. All schools under this Trust will inherit this key unless a school sets its own dedicated key.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Brevo API Key</label>
                    <input
                      type="password"
                      value={formData.brevoApiKey}
                      onChange={e => setFormData({ ...formData, brevoApiKey: e.target.value })}
                      placeholder="xkeysib-..."
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Custom Trust Sender Email</label>
                    <input
                      type="email"
                      value={formData.brevoSenderEmail}
                      onChange={e => setFormData({ ...formData, brevoSenderEmail: e.target.value })}
                      placeholder="notifications@trustdomain.org"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank Account Details</label>
                <textarea
                  rows={4}
                  value={formData.bankAccountDetails}
                  onChange={e => setFormData({ ...formData, bankAccountDetails: e.target.value })}
                  placeholder="Bank Name, Account Number, IFSC Code, Branch..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Multi-School Provisioning & SubAdmins */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100">
                <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 flex items-center gap-2">
                  <School className="w-4 h-4 text-blue-600" />
                  <span>Step 3: Provision Schools & SubAdmin Officers ({schoolsList.length})</span>
                </h2>
                <button
                  type="button"
                  onClick={addSchoolCard}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-full transition-all shadow-xs flex items-center gap-1.5 shrink-0"
                >
                  <span>+ Add Another School</span>
                </button>
              </div>

              <div className="space-y-6">
                {schoolsList.map((schoolItem, index) => (
                  <div key={index} className="p-6 bg-slate-50/90 rounded-3xl border border-slate-200/80 space-y-5 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px]">
                          {index + 1}
                        </span>
                        <span>School #{index + 1}: {schoolItem.schoolName || 'New School'}</span>
                      </span>
                      {schoolsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSchoolCard(index)}
                          className="text-rose-600 hover:text-rose-700 text-xs font-bold px-3 py-1 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200/60 transition-colors"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">School Legal Name *</label>
                        <input
                          type="text"
                          value={schoolItem.schoolName}
                          onChange={e => updateSchoolCard(index, 'schoolName', e.target.value)}
                          placeholder="e.g. Crescent High School"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">School DISE Code</label>
                        <input
                          type="text"
                          value={schoolItem.schoolDiseNo}
                          onChange={e => updateSchoolCard(index, 'schoolDiseNo', e.target.value)}
                          placeholder="e.g. DISE-240105001"
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Medium of Instruction</label>
                        <select
                          value={schoolItem.medium}
                          onChange={e => updateSchoolCard(index, 'medium', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                        >
                          <option value="English">English</option>
                          <option value="Urdu">Urdu</option>
                          <option value="Gujarati">Gujarati</option>
                          <option value="Hindi">Hindi</option>
                          <option value="Marathi">Marathi</option>
                        </select>
                      </div>

                      {/* Subdomain & Custom Domain */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">School Subdomain Slug</label>
                          <input
                            type="text"
                            value={schoolItem.subdomain}
                            onChange={e => updateSchoolCard(index, 'subdomain', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                            placeholder="e.g. crescent-highschool"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Custom School Domain (Optional)</label>
                          <input
                            type="text"
                            value={schoolItem.customDomain || ''}
                            onChange={e => updateSchoolCard(index, 'customDomain', e.target.value)}
                            placeholder="e.g. crescenthigh.ac.in"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Domain Purchase / Registrar URL</label>
                          <input
                            type="url"
                            value={schoolItem.domainPurchaseUrl || ''}
                            onChange={e => updateSchoolCard(index, 'domainPurchaseUrl', e.target.value)}
                            placeholder="e.g. https://godaddy.com"
                            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <LogoUploadInput
                          label="School Campus Logo (Upload File or Enter Image URL)"
                          value={schoolItem.logoUrl}
                          onChange={(url) => updateSchoolCard(index, 'logoUrl', url)}
                          folder={`school-logos-${index}`}
                          placeholder="Upload school logo file or paste image URL..."
                        />
                      </div>

                      {/* Dedicated School Brevo Gateway Subsection */}
                      <div className="md:col-span-2 pt-3 border-t border-slate-200/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-2 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dedicated School Brevo Gateway (Optional — Leave blank to inherit Trust key)</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">School Brevo API Key</label>
                            <input
                              type="password"
                              value={schoolItem.brevoApiKey || ''}
                              onChange={e => updateSchoolCard(index, 'brevoApiKey', e.target.value)}
                              placeholder="xkeysib-... (Inherit Trust if blank)"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Custom School Sender Email</label>
                            <input
                              type="email"
                              value={schoolItem.brevoSenderEmail || ''}
                              onChange={e => updateSchoolCard(index, 'brevoSenderEmail', e.target.value)}
                              placeholder="admissions@school.org"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>

                      {/* SubAdmin Officer Credentials Subsection */}
                      <div className="md:col-span-2 pt-3 border-t border-slate-200/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2 flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>SubAdmin Officer Credentials for School #{index + 1}</span>
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Officer Name</label>
                            <input
                              type="text"
                              value={schoolItem.subAdminName}
                              onChange={e => updateSchoolCard(index, 'subAdminName', e.target.value)}
                              placeholder="Officer Name"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Officer Email</label>
                            <input
                              type="email"
                              value={schoolItem.subAdminEmail}
                              onChange={e => updateSchoolCard(index, 'subAdminEmail', e.target.value)}
                              placeholder="officer@school.org"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">New Password (Optional)</label>
                            <input
                              type="password"
                              value={schoolItem.subAdminPassword}
                              onChange={e => updateSchoolCard(index, 'subAdminPassword', e.target.value)}
                              placeholder="Leave blank to keep current"
                              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Summary & Save Changes */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Save className="w-4 h-4 text-emerald-600" />
                <span>Step 4: Final Summary Review & Save Setup</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Trust Profile</div>
                  <div className="text-sm font-bold text-slate-900">{formData.trustName}</div>
                  <div className="text-xs text-blue-600 font-mono font-semibold">Slug: /{formData.slug}</div>
                  <div className="text-xs text-slate-500">Plan: {formData.plan}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">SuperAdmin User</div>
                  <div className="text-sm font-bold text-slate-900">{formData.superAdminName || 'SuperAdmin'}</div>
                  <div className="text-xs text-slate-600">{formData.superAdminEmail}</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 col-span-1 md:col-span-2">
                  <div className="text-xs font-bold text-slate-400 uppercase">Schools Provisioned ({schoolsList.length})</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                    {schoolsList.map((s, idx) => (
                      <div key={idx} className="p-2.5 bg-white rounded-xl border border-slate-200/80 text-xs">
                        <div className="font-bold text-slate-900">{s.schoolName || `School #${idx+1}`}</div>
                        <div className="text-[11px] text-slate-500 font-mono">DISE: {s.schoolDiseNo || 'Auto'} • Subdomain: {s.subdomain || 'Auto'}</div>
                        {s.subAdminEmail && <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">Officer: {s.subAdminEmail}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wizard Navigation Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handlePrevStep}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-md transition-colors flex items-center gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : <div />}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={handleNextStep}
                className="bg-[#0964e5] hover:bg-[#033ac4] text-white text-xs font-bold px-6 py-2.5 rounded-md transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={saving}
                className="bg-[#0964e5] hover:bg-[#033ac4] text-white text-xs font-bold px-7 py-3 rounded-md shadow-lg shadow-[#0964e5]/25 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-white" />
                    <span>Save All 4-Step Updates</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
