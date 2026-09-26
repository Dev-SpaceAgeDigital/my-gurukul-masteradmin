'use client';

import { useState } from 'react';
import { ShieldCheck, ShieldAlert, QrCode, Key, Copy, Check, Lock, ChevronRight } from 'lucide-react';

export default function TwoFactorAuthSetupCard({
  email,
  role,
  isEnabledInitially = false,
}: {
  email: string;
  role: string;
  isEnabledInitially?: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(isEnabledInitially);
  const [step, setStep] = useState<'IDLE' | 'SETUP' | 'VERIFY' | 'SUCCESS'>('IDLE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupData, setSetupData] = useState<{
    secret: string;
    qrCodeUrl: string;
    backupCodes: string[];
  } | null>(null);
  const [totpInput, setTotpInput] = useState('');
  const [copied, setCopied] = useState(false);

  const startSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/2fa/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate 2FA setup');
      
      setSetupData(data);
      setStep('SETUP');
    } catch (err: any) {
      setError(err.message || 'Error generating 2FA QR code');
    } finally {
      setLoading(false);
    }
  };

  const confirmEnable = async () => {
    if (!totpInput || totpInput.length !== 6) {
      setError('Please enter the 6-digit code from Google Authenticator.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          role,
          secret: setupData?.secret,
          token: totpInput,
          backupCodes: setupData?.backupCodes,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid TOTP code');

      setIsEnabled(true);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to verify TOTP code.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!confirm('Are you sure you want to disable Two-Factor Authentication? Your account will be less secure.')) return;

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to disable 2FA');

      setIsEnabled(false);
      setStep('IDLE');
      setSetupData(null);
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    if (!setupData?.backupCodes) return;
    navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 ${
            isEnabled ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-600'
          }`}>
            {isEnabled ? <ShieldCheck className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Two-Factor Authentication (2FA)</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Secure your account using Google Authenticator, Authy, or Microsoft Authenticator app.
            </p>
          </div>
        </div>

        <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
          isEnabled
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-slate-100 text-slate-600 border-slate-200'
        }`}>
          {isEnabled ? '2FA Active ✅' : '2FA Disabled'}
        </span>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-200">
          {error}
        </div>
      )}

      {/* IDLE state */}
      {step === 'IDLE' && (
        <div className="flex items-center justify-between gap-4 pt-1">
          <div className="text-xs text-slate-500 font-medium">
            {isEnabled
              ? 'Your account is protected with TOTP 2FA. Every login attempt will require a 6-digit Authenticator code.'
              : 'Require a 6-digit verification code from an Authenticator app whenever you log in.'}
          </div>

          {!isEnabled ? (
            <button
              onClick={startSetup}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <span>Enable 2FA Now</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleDisable}
              disabled={loading}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-4 py-2 rounded-full border border-rose-200 transition-colors disabled:opacity-50"
            >
              Turn Off 2FA
            </button>
          )}
        </div>
      )}

      {/* SETUP step */}
      {step === 'SETUP' && setupData && (
        <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="p-2 bg-white rounded-2xl border border-slate-200 shadow-xs shrink-0">
              <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-36 h-36" />
            </div>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="font-bold text-slate-900 text-sm">Step 1: Scan QR Code in Authenticator App</div>
              <p>1. Open **Google Authenticator**, **Authy**, or **Microsoft Authenticator** on your smartphone.</p>
              <p>2. Tap **+** and select **Scan QR Code**.</p>
              <p className="font-mono text-[11px] bg-white p-2 rounded-lg border border-slate-200">
                Secret Key: <strong className="text-blue-700">{setupData.secret}</strong>
              </p>
            </div>
          </div>

          {/* Backup Codes Section */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600" />
                <span>Emergency Backup Codes (Save these safely!)</span>
              </span>
              <button
                onClick={copyBackupCodes}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy All'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-center text-xs">
              {setupData.backupCodes.map((code, idx) => (
                <div key={idx} className="bg-white p-1.5 rounded-lg border border-slate-200 font-semibold text-slate-800">
                  {code}
                </div>
              ))}
            </div>
          </div>

          {/* Verification Code Input */}
          <div className="pt-3 border-t border-slate-200/80 space-y-2">
            <label className="block text-xs font-bold text-slate-800">Step 2: Enter 6-Digit Authenticator Code to Confirm</label>
            <div className="flex items-center gap-3">
              <input
                type="text"
                maxLength={6}
                value={totpInput}
                onChange={(e) => setTotpInput(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="bg-white border border-slate-300 rounded-xl px-4 py-2 text-sm font-mono tracking-widest text-center w-36 focus:border-blue-600 focus:outline-none"
              />
              <button
                onClick={confirmEnable}
                disabled={loading || totpInput.length !== 6}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 py-2.5 rounded-full shadow-md transition-all disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Activate 2FA'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS step */}
      {step === 'SUCCESS' && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-200 text-xs space-y-2">
          <div className="font-bold flex items-center gap-2 text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>2FA Protection Activated Successfully!</span>
          </div>
          <p>Your account is now protected with 2FA. Next time you log in, you will be prompted for your 6-digit Authenticator code.</p>
        </div>
      )}
    </div>
  );
}
