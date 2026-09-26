'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Crown, Lock, Mail, ArrowRight } from 'lucide-react';

export default function MasterLoginPage() {
  const [email, setEmail] = useState('admin@edutrust.org');
  const [password, setPassword] = useState('AQwIKwVowlls1Lrs');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/master/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Login failed');

      router.push('/master/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020637] via-[#01125a] to-[#022590] text-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl shadow-black/40">
        <div className="text-center mb-8">
          <img src="/my-gurukul.png" alt="My Gurukul Logo" className="h-20 w-auto mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-[#020637] tracking-tight">My Gurukul Master Admin</h1>
          <p className="text-xs text-[#757e93] mt-1.5 font-medium uppercase tracking-wider">Platform Governance Control Panel</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs text-center font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#757e93] uppercase tracking-wider mb-2">Master Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#757e93] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#020637] focus:outline-none focus:bg-white focus:border-[#0964e5] focus:ring-2 focus:ring-[#0964e5]/20 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#757e93] uppercase tracking-wider mb-2">Master Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#757e93] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-[#020637] focus:outline-none focus:bg-white focus:border-[#0964e5] focus:ring-2 focus:ring-[#0964e5]/20 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#0964e5] via-[#033ac4] to-[#0029dc] hover:from-[#033ac4] hover:to-[#022590] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#0964e5]/30 active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Master Control'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
