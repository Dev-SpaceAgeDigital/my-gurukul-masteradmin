'use client';
import { useState } from 'react';
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
  Rocket,
  ShieldCheck,
  Mail,
  Lock,
  Globe,
  FileText,
  Phone,
  Image as ImageIcon
} from 'lucide-react';

export default function OnboardTrustWizardPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Trust Profile & Governance
    trustName: '',
    slug: '',
    customDomain: '',
    domainPurchaseUrl: '',
    registrationNo: '',
    establishmentYear: '',
    presidentName: '',
    presidentNo: '',
    trusteesName: '',
    trusteesNo: '',
    logoUrl: '',
    primaryColor: '#0f172a',
    plan: 'PRO',
    maxSchools: '10',
    maxAlumni: '10000',
    taxExemptionNo: '',
    sponsorshipMode: 'ZAKAT_LILLAH',

    // SuperAdmin Credentials
    superAdminName: '',
    superAdminEmail: '',
    superAdminPassword: '',
    superAdminPhone: '',

    // Step 2: Payment & Email Gateways
    razorpayKeyId: '',
    razorpayKeySecret: '',
    brevoApiKey: '',
    brevoSenderEmail: '',
    brevoSenderName: '',
    bankAccountDetails: '',
  });

  // Multiple Schools Provisioning State Array
  const [schoolsList, setSchoolsList] = useState<any[]>([
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
      isSchoolPageEnabled: true,
      logoUrl: '',
      subdomain: '',
      customDomain: '',
      domainPurchaseUrl: '',
      domainDescription: '',
      razorpayKeyId: '',
      razorpayKeySecret: '',
      brevoApiKey: '',
      brevoSenderEmail: '',
      brevoSenderName: '',
      subAdminName: '',
      subAdminEmail: '',
      subAdminPassword: '',
      subAdminPhone: ''
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

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
        isSchoolPageEnabled: true,
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
      if (!formData.trustName || !formData.slug || !formData.superAdminEmail || !formData.superAdminPassword) {
        setError('Please fill in Trust Name, Subdomain Slug, SuperAdmin Email and Password');
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
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/master/trusts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          schoolsList
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to onboard trust');

      router.push('/master/trusts');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 mx-auto">
      {/* Header Title Card */}
      <div className="bg-white rounded-none p-6 md:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#020637] flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-md bg-[#0964e5] text-white flex items-center justify-center shadow-md shadow-[#0964e5]/20">
                <Sparkles className="w-5 h-5" />
              </div>
              <span>Multi-Tenant Onboarding Wizard</span>
            </h1>
            <p className="text-xs text-slate-400 font-medium ml-1 mt-1">Provision client Trust profile, payment/email gateways, SuperAdmin credentials & school domain</p>
          </div>
          <span className="bg-slate-100 text-slate-700 text-xs font-bold px-4 py-1.5 rounded-md border border-slate-200/60">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-4 gap-2 mt-6 pt-6 border-t border-slate-100">
          {[
            { step: 1, label: 'Trust & Admin', icon: Building2 },
            { step: 2, label: 'Gateways', icon: CreditCard },
            { step: 3, label: 'School Setup', icon: School },
            { step: 4, label: 'Review & Deploy', icon: Rocket },
          ].map((item) => {
            const StepIcon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div
                key={item.step}
                onClick={() => isDone && setCurrentStep(item.step)}
                className={`flex items-center gap-2.5 p-3 rounded-md transition-all ${isCurrent
                    ? 'bg-[#0964e5] text-white shadow-md'
                    : isDone
                      ? 'bg-slate-100 text-slate-800 cursor-pointer hover:bg-slate-200'
                      : 'bg-slate-50 text-slate-400'
                  }`}
              >
                <div className={`w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs ${isCurrent ? 'bg-white/20 text-white' : isDone ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                  }`}>
                  {isDone ? <CheckCircle2 className="w-4 h-4" /> : item.step}
                </div>
                <span className="text-xs font-bold hidden sm:inline">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-md text-xs font-semibold px-6 shadow-xs">
          {error}
        </div>
      )}

      {/* Main Wizard Form Container */}
      <form onSubmit={handleSubmit} className="bg-white rounded-none p-8 shadow-[0_10px_35px_rgba(0,0,0,0.03)] border border-slate-200 space-y-8">

        {/* STEP 1: Trust Identity & Governance */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Step 1: Trust Identity, Governance & Primary SuperAdmin</span>
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Subdomain Slug (URL Identifier) *</label>
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
                  placeholder="e.g. REG-TRUST-1998"
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
                <label className="block text-xs font-bold text-slate-700 mb-1">President Name</label>
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
                  folder="trust-logos"
                  placeholder="Upload logo file or paste image URL..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Subscription Plan</label>
                <select
                  value={formData.plan}
                  onChange={e => setFormData({ ...formData, plan: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-[#0964e5] focus:outline-none"
                >
                  <option value="STARTER">STARTER Plan (Basic Quota)</option>
                  <option value="PRO">PRO Plan (Standard Quota)</option>
                  <option value="ENTERPRISE">ENTERPRISE Plan (Custom Quota)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maximum School Campuses Quota (Limit) *</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  required
                  value={formData.maxSchools || '10'}
                  onChange={e => setFormData({ ...formData, maxSchools: e.target.value })}
                  placeholder="e.g. 5"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md px-4 py-2.5 text-xs text-slate-900 font-bold focus:bg-white focus:border-[#0964e5] focus:outline-none"
                />
                <span className="text-[10px] text-[#757e93] font-medium">SuperAdmin cannot add more than this number of school campuses under this Trust.</span>
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

            {/* SuperAdmin Credentials Subsection */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Primary SuperAdmin Account Credentials</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">SuperAdmin Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.superAdminName}
                    onChange={e => setFormData({ ...formData, superAdminName: e.target.value })}
                    placeholder="e.g. Dr. Rashid Khan"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
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
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={formData.superAdminPassword}
                    onChange={e => setFormData({ ...formData, superAdminPassword: e.target.value })}
                    placeholder="SuperAdmin Password"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Payment & Email Gateways */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-blue-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Step 2: Razorpay Payment & Brevo Email Gateways</span>
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-600" />
                  Razorpay Multi-Tenant Keys (Optional)
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
                      placeholder="Secret Key"
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Brevo Email Gateway Card */}
              <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 space-y-3">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-emerald-700" />
                  Trust-Wide Brevo Email Gateway (Optional)
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
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
          </div>
        )}

        {/* STEP 3: Multi-School Provisioning & SubAdmin Accounts */}
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
                        placeholder="e.g. DISE-99201"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Medium & Enrolled Students */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Medium of Instruction</label>
                      <select
                        value={schoolItem.medium}
                        onChange={e => updateSchoolCard(index, 'medium', e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
                      >
                        <option value="English">English Medium</option>
                        <option value="Gujarati">Gujarati Medium</option>
                        <option value="Hindi">Hindi Medium</option>
                        <option value="Urdu">Urdu Medium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Current Enrolled Students</label>
                      <input
                        type="number"
                        value={schoolItem.currentStudentsNo}
                        onChange={e => updateSchoolCard(index, 'currentStudentsNo', e.target.value)}
                        placeholder="e.g. 450"
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
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

                    {/* Public School Page Feature Toggle */}
                    <div className="md:col-span-2 pt-3 border-t border-slate-200/60">
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">Public School Page Access</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${schoolItem.isSchoolPageEnabled !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                              {schoolItem.isSchoolPageEnabled !== false ? 'Full School Page Enabled' : 'Faculty / Teachers Only'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {schoolItem.isSchoolPageEnabled !== false 
                              ? 'Sub-admin can manage full public school page (About, Academic Programs, Facilities, Co-Curriculars & Teachers).'
                              : 'Public school page is disabled. In sub-admin School Page, only School Faculty & Staff Register will be visible; all other sections are hidden.'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={schoolItem.isSchoolPageEnabled !== false}
                            onChange={(e) => updateSchoolCard(index, 'isSchoolPageEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
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
                          <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                          <input
                            type="password"
                            value={schoolItem.subAdminPassword}
                            onChange={e => updateSchoolCard(index, 'subAdminPassword', e.target.value)}
                            placeholder="Password"
                            className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 4: Review & Deploy */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-700 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Rocket className="w-4 h-4 text-emerald-600" />
              <span>Step 4: Final Provisioning Summary & Deployment</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Trust Details</div>
                <div className="text-sm font-bold text-slate-900">{formData.trustName || 'Not Set'}</div>
                <div className="text-xs text-blue-600 font-mono font-semibold">Slug: /{formData.slug}</div>
                <div className="text-xs text-slate-500">Plan: {formData.plan}</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">SuperAdmin User</div>
                <div className="text-sm font-bold text-slate-900">{formData.superAdminName || 'SuperAdmin'}</div>
                <div className="text-xs text-slate-600">{formData.superAdminEmail}</div>
                <div className="text-xs text-emerald-600 font-bold">Role: SUPER_ADMIN</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Gateway Setup</div>
                <div className="text-xs text-slate-700">Razorpay: {formData.razorpayKeyId ? 'Custom Key ID Configured' : 'Default Platform Gateway'}</div>
                <div className="text-xs text-slate-700">Platform Email: Brevo Transactional Service</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 col-span-1 md:col-span-2">
                <div className="text-xs font-bold text-slate-400 uppercase">Schools to Provision ({schoolsList.length})</div>
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

        {/* Wizard Navigation Buttons */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handlePrevStep}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-5 py-2.5 rounded-md text-xs transition-all flex items-center gap-1.5"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="bg-[#0964e5] hover:bg-[#033ac4] text-white font-bold px-6 py-2.5 rounded-md text-xs shadow-md shadow-[#0964e5]/20 transition-all flex items-center gap-1.5"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="bg-[#0964e5] hover:bg-[#033ac4] text-white font-bold px-8 py-3 rounded-md text-xs shadow-lg shadow-[#0964e5]/25 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
            >
              <Rocket className="w-4 h-4" />
              <span>{loading ? 'Deploying Trust...' : 'Deploy & Provision Ecosystem'}</span>
            </button>
          )}
        </div>

      </form>
    </div>
  );
}
