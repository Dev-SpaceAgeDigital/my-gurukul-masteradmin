'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, Loader2, GraduationCap, Users, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { usePortalDialog } from '@/components/ui/PortalDialog';

interface LoginFormProps {
  roleName: string;
  loginEndpoint: string;
  accentColor: string;
  roleIcon: React.ReactNode;
}

export default function LoginForm({ roleName, loginEndpoint, accentColor, roleIcon }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState('');
  const [verifiedEmail, setVerifiedEmail] = useState('');
  const [verifiedRole, setVerifiedRole] = useState('');
  const router = useRouter();
  const { dialog, showAlert } = usePortalDialog();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(loginEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.requiresOtp) {
        setOtpStep(true);
        setVerifiedEmail(data.email || email);
        setVerifiedRole(data.role);
        showAlert({
          title: 'OTP sent',
          message: data.message || 'Enter the OTP sent to your registered email.',
          variant: 'success',
        });
      } else if (data.success) {
        router.push(data.redirectTo);
      } else {
        showAlert({
          title: 'Login failed',
          message: data.error || 'The credentials you entered are incorrect.',
          variant: 'danger',
        });
      }
    } catch (err) {
      showAlert({
        title: 'Connection error',
        message: 'System encountered a connection error. Please try again.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-login-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verifiedEmail, role: verifiedRole, otp }),
      });

      const data = await res.json();
      if (data.success) {
        router.push(data.redirectTo);
      } else {
        showAlert({
          title: 'OTP verification failed',
          message: data.error || 'Please enter the correct OTP.',
          variant: 'danger',
        });
      }
    } catch {
      showAlert({
        title: 'Connection error',
        message: 'System encountered a connection error. Please try again.',
        variant: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccentColors = () => {
    switch (accentColor) {
      case 'indigo': return {
        bg: 'bg-indigo-600',
        hover: 'hover:bg-indigo-700',
        light: 'bg-indigo-50',
        text: 'text-indigo-700',
        darkText: 'text-white',
        ring: 'focus:ring-indigo-500/20',
        border: 'focus:border-indigo-500',
        gradient: 'from-indigo-700 via-blue-800 to-slate-900',
        pattern: 'text-white/10'
      };
      case 'emerald': return {
        bg: 'bg-[#1b4a50]',
        hover: 'hover:bg-[#143d43]',
        light: 'bg-[#1b4a50]/10',
        text: 'text-[#1b4a50]',
        darkText: 'text-white',
        ring: 'focus:ring-[#1b4a50]/20',
        border: 'focus:border-[#1b4a50]',
        gradient: 'from-[#1b4a50] via-[#143d43] to-[#0d2a4a]',
        pattern: 'text-white/5'
      };
      case 'amber': return {
        bg: 'bg-amber-600',
        hover: 'hover:bg-amber-700',
        light: 'bg-amber-50',
        text: 'text-amber-600',
        darkText: 'text-white',
        ring: 'focus:ring-amber-500/20',
        border: 'focus:border-amber-500',
        gradient: 'from-amber-600 via-orange-700 to-slate-900',
        pattern: 'text-white/10'
      };
      default: return {
        bg: 'bg-slate-800',
        hover: 'hover:bg-slate-900',
        light: 'bg-slate-50',
        text: 'text-slate-800',
        darkText: 'text-white',
        ring: 'focus:ring-slate-500/20',
        border: 'focus:border-slate-500',
        gradient: 'from-slate-700 via-slate-800 to-slate-950',
        pattern: 'text-white/10'
      };
    }
  };

  const colors = getAccentColors();

  return (
    <>
      <div className={`flex min-h-screen bg-white transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

        {/* Visual Workspace Side */}
        <div className={`hidden lg:flex w-1/2 relative flex-col justify-center items-center overflow-hidden bg-gradient-to-br ${colors.gradient}`}>

          {/* Dynamic SVG Pattern */}
          <div className={`absolute inset-0 z-0 ${colors.pattern}`}>
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="gridLarge" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
                <pattern id="gridSmall" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.25" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridLarge)" />
              <rect width="100%" height="100%" fill="url(#gridSmall)" />
            </svg>
          </div>

          {/* Floating Decorative Elements */}
          <div className="absolute top-[10%] right-[10%] w-64 h-64 bg-white/10 blur-[100px] rounded-full animate-pulse"></div>
          <div className="absolute bottom-[10%] left-[10%] w-64 h-64 bg-white/10 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="mb-10 relative group">
              <div className="absolute -inset-10 bg-white/10 blur-3xl rounded-full opacity-50 group-hover:opacity-80 transition-opacity duration-700"></div>
              <div className="relative">
                <Image src="/madni-logo.png" alt="Madni Logo" width={220} height={220} className="object-contain" priority />
              </div>
            </div>

            <div className="text-center max-w-sm px-6">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-semibold tracking-wide mb-6 border border-white/10 shadow-sm`}>
                {roleIcon}
                <span>Portal Access</span>
              </div>
              <h1 className="text-4xl font-outfit font-semibold text-white mb-4 tracking-tight">
                Excellence in <span className="text-white/80">Education</span>
              </h1>
              <p className="text-white/60 leading-relaxed font-medium">
                Welcome to the official Madni CMS. Empowering institutions with next-generation management tools.
              </p>
            </div>
          </div>

          {/* Minimal Footer */}
          <div className={`absolute bottom-10 flex space-x-6 text-[10px] font-semibold text-white/30 tracking-wide`}>
            <span>&copy; {new Date().getFullYear()} MADNI CMS</span>
            <span className="text-white/10">|</span>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>

        {/* Form Side */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white relative">
          <div className="w-full max-w-[420px] space-y-10">

            <div className="text-center lg:text-left space-y-2">
              <h2 className="text-3xl font-outfit font-semibold text-slate-900 tracking-tight">Login to Workspace</h2>
              <p className="text-slate-500 font-medium">Please enter your {roleName.toLowerCase()} details below.</p>
            </div>

            <form onSubmit={otpStep ? handleOtpSubmit : handleSubmit} className="space-y-6">
              {otpStep ? (
                <div className="space-y-5">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colors.light} ${colors.text}`}>
                    <ShieldCheck size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">Verify your email</h3>
                    <p className="mt-1 text-sm font-medium text-slate-500">Enter the 6-digit OTP sent to {verifiedEmail}.</p>
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className={`w-full px-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all duration-200 ${colors.ring} ${colors.border} text-center text-2xl font-black tracking-[0.35em] text-slate-900`}
                    placeholder="000000"
                  />
                  <button type="button" onClick={() => { setOtpStep(false); setOtp(''); }} className={`text-xs font-bold ${colors.text} hover:opacity-80`}>
                    Use another email
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-400 tracking-wide ml-1">Work Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                        <Mail size={18} />
                      </div>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all duration-200 ${colors.ring} ${colors.border} placeholder:text-slate-700 font-medium`}
                        placeholder="name@organization.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[11px] font-semibold text-slate-400 tracking-wide">Secret Key / Password</label>
                      <button type="button" className={`text-xs font-semibold ${colors.text} hover:opacity-80 transition-opacity`}>Forgot?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-300">
                        <Lock size={18} />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-11 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none transition-all duration-200 ${colors.ring} ${colors.border} placeholder:text-slate-700 font-medium`}
                        placeholder="••••••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-300 hover:text-slate-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-2xl text-white font-semibold text-lg shadow-lg ${colors.bg} ${colors.hover} transition-all active:scale-[0.99] flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>{otpStep ? 'Checking OTP...' : 'Verifying...'}</span>
                  </>
                ) : (
                  <>
                    <span>{otpStep ? 'Verify OTP' : 'Sign In'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="pt-8 flex items-center justify-center space-x-4">
              <div className="h-px w-full bg-slate-100"></div>
              <span className="text-[10px] font-semibold text-slate-300 tracking-wide whitespace-nowrap">Secure Access Only</span>
              <div className="h-px w-full bg-slate-100"></div>
            </div>

            <p className="text-center text-slate-400 text-sm font-medium">
              Authorized personnel only. <br />
              <a href="#" className={`font-semibold ${colors.text} hover:underline`}>Help Center</a>
            </p>

          </div>
        </div>
      </div>
      {dialog}
    </>
  );
}
