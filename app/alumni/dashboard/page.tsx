'use client';

import DashboardLayout from '@/components/layout/DashboardLayout';
import AlumniContributions from '@/components/dashboard/alumni/AlumniContributions';
import React, { Suspense, useEffect, useState } from 'react';
import { Heart, Briefcase, Handshake, GraduationCap, Calendar, Sparkles, Megaphone, ArrowUpRight, Award, Target, Flame, Users, Trophy, UserSearch, Building2, CheckCircle2, Clock, FileText, X } from 'lucide-react';
import AlumniCareerHub from '@/components/dashboard/alumni/AlumniCareerHub';
import AlumniMentorshipHub from '@/components/dashboard/alumni/AlumniMentorshipHub';
import AlumniProfile from '@/components/dashboard/alumni/AlumniProfile';
import AlumniDirectory from '@/components/dashboard/alumni/AlumniDirectory';
import AlumniAchievementHub from '@/components/dashboard/alumni/AlumniAchievementHub';
import AlumniBlogHub from '@/components/dashboard/alumni/AlumniBlogHub';
import AlumniDonationHistory from '@/components/dashboard/alumni/AlumniDonationHistory';
import AlumniCommunityFeed from '@/components/dashboard/alumni/AlumniCommunityFeed';
import AlumniMyPostsHub from '@/components/dashboard/alumni/AlumniMyPostsHub';
import AlumniCSRHub from '@/components/dashboard/alumni/AlumniCSRHub';

import { useRouter, useSearchParams } from 'next/navigation';

interface NewsUpdate {
  id: string;
  title: string;
  description: string;
  category: string;
  publishDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  schoolName: string;
}

const TAB_MAP: Record<string, string> = {
  'dashboard': 'Dashboard',
  'feed': 'Community Feed',
  'my-posts': 'My Posts',
  'find-alumni': 'Find Alumni',
  'give-back': 'Give Back',
  'csr': 'CSR Referrals',
  'impact': 'My Impact',
  'profile': 'Profile',
};

const REVERSE_TAB_MAP: Record<string, string> = {
  'Dashboard': 'dashboard',
  'Community Feed': 'feed',
  'My Posts': 'my-posts',
  'Find Alumni': 'find-alumni',
  'Give Back': 'give-back',
  'CSR Referrals': 'csr',
  'My Impact': 'impact',
  'Profile': 'profile',
};

function AlumniDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [data, setData] = useState<any>(null);
  const [updates, setUpdates] = useState<NewsUpdate[]>([]);
  const [updatesLoading, setUpdatesLoading] = useState(true);
  const [selectedSpotlight, setSelectedSpotlight] = useState<any>(null);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && TAB_MAP[tabParam]) {
      setActiveTab(TAB_MAP[tabParam]);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchData();
    fetchUpdates();
  }, []);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const slug = REVERSE_TAB_MAP[newTab] || 'dashboard';
    router.push(`/alumni/dashboard?tab=${slug}`, { scroll: false });
  };

  const fetchData = async () => {
    try {
      const res = await fetch('/api/alumni/stats');
      const d = await res.json();
      if (res.ok) setData(d);
    } catch { }
  };

  const fetchUpdates = async () => {
    try {
      const res = await fetch('/api/alumni/news-updates');
      const d = await res.json();
      if (res.ok) setUpdates(Array.isArray(d.updates) ? d.updates : []);
    } catch {
      setUpdates([]);
    } finally {
      setUpdatesLoading(false);
    }
  };

  const formatUpdateDate = (update: NewsUpdate) => {
    const date = update.publishDate || update.createdAt;
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': {
        const pendingItems = [
          { label: 'Blogs', value: data?.pending?.blogs || 0 },
          { label: 'Achievements', value: data?.pending?.achievements || 0 },
          { label: 'Careers', value: data?.pending?.career || 0 },
          { label: 'Mentorship', value: data?.pending?.mentorship || 0 },
          { label: 'CSR', value: data?.pending?.csr || 0 },
        ].filter((item) => item.value > 0);
        const summaryCards = [
          { label: 'Total Posts', value: data?.stats?.totalPosts || 0, icon: <FileText size={18} />, wrap: 'bg-blue-50 text-blue-600' },
          { label: 'Achievements', value: data?.summary?.achievements || 0, icon: <Award size={18} />, wrap: 'bg-amber-50 text-amber-600' },
          { label: 'Career Posts', value: data?.summary?.careerPosts || 0, icon: <Briefcase size={18} />, wrap: 'bg-emerald-50 text-emerald-600' },
          { label: 'Mentorship', value: data?.summary?.mentorshipOffers || 0, icon: <Handshake size={18} />, wrap: 'bg-purple-50 text-purple-600' },
          { label: 'CSR Referrals', value: data?.summary?.csrReferrals || 0, icon: <Building2 size={18} />, wrap: 'bg-cyan-50 text-cyan-600' },
          { label: 'Donated', value: `Rs. ${(data?.summary?.donations || 0).toLocaleString()}`, icon: <Heart size={18} />, wrap: 'bg-rose-50 text-rose-600' },
        ];
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* Left & Middle Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Hero Banner (Compact & Sleek) */}
	              <div className="bg-white/40 backdrop-blur-md p-4 sm:p-6 rounded-3xl shadow-xl shadow-slate-900/5 border border-white/60 relative overflow-hidden group">
	                <div className="absolute top-[10%] right-[5%] w-48 h-48 bg-blue-500/10 blur-[80px] rounded-full group-hover:scale-110 transition-transform duration-1000"></div>
	                <div className="relative z-10">
	                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 mb-3">
	                    <span className="inline-flex w-fit max-w-full items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] sm:text-[11px] font-bold border border-blue-500/10 leading-tight">
	                      <Sparkles size={11} className="animate-pulse" />
	                      <span>Madni Alumni Hub</span>
		                    </span>
		                    <div className="flex flex-wrap gap-1.5 sm:gap-2 items-center">
	                      <span className="text-[10px] sm:text-[11px] font-bold text-blue-700 bg-blue-50/80 border border-blue-100/80 px-2.5 py-1 rounded-full inline-flex items-center gap-1 leading-tight">
	                        <GraduationCap size={12} className="shrink-0" />
	                        <span>Batch of {data?.alumni?.batchYear || 'N/A'}</span>
	                      </span>
	                      <span className="text-[10px] sm:text-[11px] font-bold text-slate-600 bg-white/80 border border-white px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-sm leading-tight">
	                        <Award size={12} className="text-amber-500 shrink-0" />
	                        <span>{data?.stats?.totalPosts || 0} Contributions Made</span>
	                      </span>
	                    </div>
	                  </div>

	                  <h2 className="text-lg sm:text-2xl font-extrabold text-slate-800 tracking-tight mb-1 leading-snug">Shape the Future of Madni.</h2>
		                  <p className="text-slate-600 text-[11px] sm:text-xs font-medium max-w-xl leading-relaxed">Your continued support drives our community forward. Explore career networking, mentorship, and giving back.</p>
		                </div>
		              </div>

	              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	                <div className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-sm">
	                  <div className="flex items-start justify-between gap-4 mb-3">
	                    <div>
	                      <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
	                        <CheckCircle2 size={17} className="text-blue-600" />
	                        Profile Completion
	                      </h3>
	                      <p className="text-[11px] font-medium text-slate-500 mt-1">Complete your profile to improve alumni discovery.</p>
	                    </div>
	                    <span className="text-lg font-black text-blue-700">{data?.profileCompletion || 0}%</span>
	                  </div>
	                  <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
	                    <div className="h-full rounded-full bg-blue-600 transition-all" style={{ width: `${Math.min(100, data?.profileCompletion || 0)}%` }} />
	                  </div>
	                  <button onClick={() => setActiveTab('Profile')} className="mt-4 w-full rounded-xl bg-blue-50 text-blue-700 py-2.5 text-xs font-black hover:bg-blue-100">
	                    Complete Profile
	                  </button>
	                </div>

	                <div className="bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-white/80 shadow-sm">
	                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
	                    <Clock size={17} className="text-amber-500" />
	                    Pending Approvals
	                  </h3>
	                  {pendingItems.length === 0 ? (
	                    <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-3">
	                      <p className="text-xs font-black text-emerald-700">Everything is clear</p>
	                      <p className="text-[11px] font-medium text-emerald-600 mt-1">No posts are waiting for approval.</p>
	                    </div>
	                  ) : (
	                    <div className="mt-4 flex flex-wrap gap-2">
	                      {pendingItems.map((item) => (
	                        <span key={item.label} className="rounded-full bg-amber-50 border border-amber-100 px-3 py-1.5 text-[11px] font-black text-amber-700">
	                          {item.label}: {item.value}
	                        </span>
	                      ))}
	                    </div>
	                  )}
	                </div>
	              </div>

	              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
	                {summaryCards.map((card) => (
	                  <div key={card.label} className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3 min-w-0">
	                    <div className={`w-10 h-10 rounded-xl ${card.wrap} flex items-center justify-center shrink-0`}>
	                      {card.icon}
	                    </div>
	                    <div className="min-w-0">
	                      <span className="text-lg font-extrabold text-slate-800 leading-none block truncate">{card.value}</span>
	                      <span className="text-[11px] text-slate-500 font-medium">{card.label}</span>
	                    </div>
	                  </div>
	                ))}
	              </div>

              {/* 📊 Network Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
	                    <span className="text-lg font-extrabold text-slate-800 leading-none block">{data?.stats?.totalAlumni || 0}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Alumni Network</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Briefcase size={20} />
                  </div>
                  <div>
	                    <span className="text-lg font-extrabold text-slate-800 leading-none block">{data?.stats?.activeJobs || 0}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Active Jobs</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <Handshake size={20} />
                  </div>
                  <div>
	                    <span className="text-lg font-extrabold text-slate-800 leading-none block">{data?.stats?.totalMentors || 0}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Student Mentors</span>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl border border-white/80 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                    <Heart size={20} />
                  </div>
                  <div>
                    <span className="text-lg font-extrabold text-slate-800 leading-none block">₹{data?.stats?.totalDonated?.toLocaleString() || 0}</span>
                    <span className="text-[11px] text-slate-500 font-medium">My Donated</span>
                  </div>
                </div>
              </div>

              {/* Main Quick Action Modules */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <button
                  onClick={() => setActiveTab('Careers')}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/80 hover:border-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Briefcase className="group-hover:scale-110 transition-transform" size={22} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1">
                    Careers
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Post jobs and referrals to support current students and alumni.</p>
                </button>

                <button
                  onClick={() => setActiveTab('Mentorship')}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/80 hover:border-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Handshake className="group-hover:scale-110 transition-transform" size={22} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1">
                    Mentorship
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Guide and offer mentorship pathways to ambitious students.</p>
                </button>

                <button
                  onClick={() => setActiveTab('Give Back')}
                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/80 hover:border-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                    <Heart className="group-hover:scale-110 transition-transform" size={22} />
                  </div>
                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1">
                    Give Back
                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
                  </h4>
	                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Sponsor infrastructure and help develop institutional facilities.</p>
	                </button>

	                <button
	                  onClick={() => setActiveTab('CSR Referrals')}
	                  className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl border border-white/80 hover:border-blue-500 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 text-left group"
	                >
	                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
	                    <Building2 className="group-hover:scale-110 transition-transform" size={22} />
	                  </div>
	                  <h4 className="font-bold text-slate-900 text-base flex items-center gap-1">
	                    CSR Referrals
	                    <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-4px] group-hover:translate-x-0" />
	                  </h4>
	                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">Refer companies that may support Madni schools through CSR.</p>
	                </button>
	              </div>

              {/* Action Cards (Moved from Right Column for Balance) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Impact Snapshot Widget */}
                <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border border-white/80 shadow-md relative group flex flex-col">
                  <div className="absolute top-6 right-6 w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                    <Target size={20} className="text-blue-600" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-500 tracking-wider mb-2">
                    Donated till now
                  </h3>
                  <div className="flex flex-col flex-grow justify-center mt-2 mb-5">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight">₹{data?.stats?.totalDonated?.toLocaleString() || 0}</span>
                    <p className="text-xs text-slate-500 mt-2 font-medium">Thank you for making a difference.</p>
                  </div>

                  <button onClick={() => setActiveTab('My Impact')} className="mt-auto w-full bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 hover:text-blue-700 text-slate-700 transition-all rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 group-hover:shadow-sm">
                    View details
                    <ArrowUpRight size={14} />
                  </button>
                </div>

                {/* Urgent Cause Spotlight Widget */}
                {data?.urgentCause && (
                  <div className="bg-white/85 backdrop-blur-md p-6 rounded-2xl border-2 border-rose-100 shadow-md relative">
                    <div className="absolute -top-3 left-6 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-sm shadow-rose-500/20">
                      <Flame size={12} className="animate-pulse" />
                      Urgent Need
                    </div>
                    <h3 className="text-base font-bold text-slate-800 mt-2 mb-2 leading-tight">
                      {data.urgentCause.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed mb-4">
                      {data.urgentCause.description || 'Support this urgent campus initiative to help our students succeed.'}
                    </p>

                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-slate-500">Funded</span>
                        <span className="text-rose-600">{Math.round((Number(data.urgentCause.paidAmount || 0) / Number(data.urgentCause.estimatedCost || 1)) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-rose-500 h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (Number(data.urgentCause.paidAmount || 0) / Number(data.urgentCause.estimatedCost || 1)) * 100)}%` }}></div>
                      </div>
                    </div>

                    <button onClick={() => setActiveTab('Give Back')} className="w-full bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                      <Heart size={14} />
                      Fund this Project
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-8">

              {/* Alumni Spotlight Card */}
              <div className="relative overflow-hidden rounded-[2rem] border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-white p-4 shadow-md backdrop-blur-md sm:p-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                    <Trophy size={12} />
                    Alumni Spotlight
                  </span>
                  <span className="text-xs font-bold text-amber-700">Top 3</span>
                </div>

                <div className="space-y-3">
                  {(data?.spotlights?.length ? data.spotlights : [data?.spotlight].filter(Boolean)).slice(0, 3).map((spotlight: any, index: number) => (
                    <button
                      key={spotlight.id || `${spotlight.name}-${index}`}
                      type="button"
                      onClick={() => setSelectedSpotlight(spotlight)}
                      className="group/spotlight w-full rounded-2xl border border-amber-100/80 bg-white/75 p-3 text-left shadow-sm transition-all hover:border-amber-200 hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        {spotlight?.profilePic ? (
                          <img src={spotlight.profilePic} alt={spotlight.name} className="h-12 w-12 shrink-0 rounded-2xl border-2 border-amber-300 object-cover shadow-md" />
                        ) : (
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-tr from-amber-500 to-amber-600 text-lg font-black text-white shadow-md">
                            {spotlight?.name ? spotlight.name.charAt(0) : 'M'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h4 className="break-words text-sm font-extrabold text-slate-900 group-hover/spotlight:text-amber-700">{spotlight?.name || 'Madni Alumni'}</h4>
                          <p className="line-clamp-1 text-xs font-medium text-slate-600">{spotlight?.headline || spotlight?.currentTitle || 'Community contributor'}</p>
                          <span className="mt-1 inline-block rounded-md bg-amber-100/80 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            Batch of {spotlight?.batchYear || 'Alumni'}
                          </span>
                        </div>
                        <ArrowUpRight size={15} className="shrink-0 text-amber-600" />
                      </div>
                    </button>
                  ))}
                </div>

                <button onClick={() => handleTabChange('Find Alumni')} className="mt-4 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-amber-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600">
                  <UserSearch size={14} />
                  Connect in Directory
                </button>
              </div>

	              {data?.upcomingMeet && (
	                <div className="bg-white/85 backdrop-blur-md p-6 rounded-[2rem] border border-blue-100 shadow-md">
	                  <div className="flex items-center justify-between gap-3 mb-3">
	                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
	                      <Calendar size={18} className="text-blue-600" />
	                      <span>Latest Meet Invite</span>
	                    </h3>
	                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-blue-700">Email Sent</span>
	                  </div>
	                  <p className="text-sm font-black text-slate-900 leading-snug">{data.upcomingMeet.subject}</p>
	                  <p className="text-[11px] font-medium text-slate-500 mt-2">Check your email inbox for the Google Meet link and timing.</p>
	                </div>
		              )}
		              {/* Announcements Feed */}
              <div className="bg-white/85 backdrop-blur-md p-6 rounded-[2rem] border border-white/80 shadow-md">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                    <Megaphone size={18} className="text-blue-600" />
                    <span>Campus News</span>
                  </h3>
                  <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></span>
                </div>

                <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1 scrollbar-none [ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {updatesLoading ? (
                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Loading updates...</p>
                    </div>
                  ) : updates.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                      <p className="text-xs font-bold text-slate-700">No campus updates yet</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed">Updates from your school will appear here once published.</p>
                    </div>
                  ) : (
                    updates.map((update, index) => (
                      <div key={update.id} className={`p-4 rounded-xl border transition-colors group ${index === 0 ? 'bg-blue-50/30 border-blue-100/50 hover:bg-blue-50/50' : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50/80'}`}>
                          <div className="mb-3 relative aspect-video rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-slate-100 border border-white/70">
                            {update.imageUrl ? (
                              <img src={update.imageUrl} alt={update.title} className="absolute inset-0 w-full h-full object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Megaphone size={22} className="text-blue-300" />
                              </div>
                            )}
                          </div>

                        <div className="flex items-center gap-2 mb-1.5">
                          <Calendar size={13} className={index === 0 ? 'text-blue-600' : 'text-slate-500'} />
                          <span className={`text-[10px] font-bold uppercase tracking-wide ${index === 0 ? 'text-blue-600' : 'text-slate-500'}`}>{formatUpdateDate(update)}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-500 uppercase tracking-wider border border-slate-100">{update.category}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-white/80 text-slate-500 uppercase tracking-wider border border-slate-100">{update.schoolName}</span>
                        </div>
                        <h4 className={`text-xs font-bold text-slate-800 transition-colors ${index === 0 ? 'group-hover:text-blue-700' : 'group-hover:text-blue-600'}`}>{update.title}</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-1 leading-relaxed line-clamp-3">{update.description}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      }
      case 'Community Feed':
        return <AlumniCommunityFeed />;
      case 'My Posts':
        return <AlumniMyPostsHub />;
      case 'Give Back':
        return <AlumniContributions />;
      case 'CSR Referrals':
        return <AlumniCSRHub />;
      case 'My Impact':
        return <AlumniDonationHistory />;
      case 'Careers':
        return <AlumniCareerHub />;
      case 'Mentorship':
        return <AlumniMentorshipHub />;
      case 'Achievements':
        return <AlumniAchievementHub />;
      case 'Blogs':
        return <AlumniBlogHub />;
      case 'Find Alumni':
        return <AlumniDirectory />;
      case 'Profile':
        return <AlumniProfile />;
      default:
        return <div>Section Under Development</div>;
    }
  };

  return (
    <DashboardLayout
      title="Alumni portal"
      role="ALUMNI"
      activeItem={activeTab}
      onNavigate={handleTabChange}
    >
      {renderContent()}
      {selectedSpotlight && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[2rem] border border-white/70 bg-white/95 p-5 shadow-2xl sm:p-6">
            <button
              type="button"
              onClick={() => setSelectedSpotlight(null)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:text-slate-900"
              aria-label="Close alumni spotlight"
            >
              <X size={16} />
            </button>

            <div className="pr-10">
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                <Trophy size={12} />
                Alumni Spotlight
              </span>
              <h3 className="mt-4 text-xl font-black tracking-tight text-slate-950">{selectedSpotlight.name}</h3>
              <p className="mt-1 text-sm font-bold text-amber-700">{selectedSpotlight.headline || selectedSpotlight.currentTitle || 'Madni alumni contributor'}</p>
            </div>

            <div className="mt-5 flex items-center gap-4 rounded-3xl border border-amber-100 bg-amber-50/60 p-4">
              {selectedSpotlight.profilePic ? (
                <img src={selectedSpotlight.profilePic} alt={selectedSpotlight.name} className="h-16 w-16 shrink-0 rounded-2xl border-2 border-amber-300 object-cover shadow-md" />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-300 bg-gradient-to-tr from-amber-500 to-amber-600 text-2xl font-black text-white shadow-md">
                  {selectedSpotlight.name?.charAt(0) || 'M'}
                </div>
              )}
              <div className="min-w-0">
                <p className="break-words text-sm font-black text-slate-900">{selectedSpotlight.currentTitle || 'Alumni'}</p>
                <p className="mt-1 text-xs font-semibold text-slate-600">{selectedSpotlight.schoolName || 'Madni Education Trust'}</p>
                <p className="mt-1 text-[11px] font-bold text-amber-700">Batch of {selectedSpotlight.batchYear || 'Alumni'}</p>
              </div>
            </div>

            <div className="mt-5">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Why they are spotlighted</h4>
              <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-relaxed text-slate-700">
                {selectedSpotlight.reason || 'Recognized for meaningful contribution, mentorship, and continued connection with the Madni alumni community.'}
              </p>
            </div>

            {Array.isArray(selectedSpotlight.highlights) && selectedSpotlight.highlights.length > 0 && (
              <div className="mt-5 space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">Highlights</h4>
                {selectedSpotlight.highlights.slice(0, 3).map((highlight: string, index: number) => (
                  <div key={`${highlight}-${index}`} className="flex gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs font-bold text-slate-700">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-600" />
                    <span className="break-words">{highlight}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function AlumniDashboard() {
  return (
    <Suspense fallback={null}>
      <AlumniDashboardContent />
    </Suspense>
  );
}
