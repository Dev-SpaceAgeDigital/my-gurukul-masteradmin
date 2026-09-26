'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  Plus, 
  ExternalLink, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Building2, 
  Link as LinkIcon,
  Info,
  Loader2,
  ChevronRight,
  Tags,
  MapPin,
  DollarSign,
  Calendar,
  UserCheck,
  Handshake,
  ThumbsUp,
  Globe,
  Award,
  Send
} from 'lucide-react';

const PROFESSIONAL_CATEGORIES = [
  "Engineering & Tech",
  "Business & Finance",
  "Healthcare & Medicine",
  "Arts & Design",
  "Law & Public Policy",
  "Education & Academics",
  "Sales & Marketing",
  "General / Other"
];

interface CareerPost {
  id: string;
  type: 'JOB' | 'INTERNSHIP';
  companyName: string;
  companyLink: string | null;
  role: string;
  category: string | null;
  relation: string | null;
  description: string | null;
  location?: string | null;
  workMode?: 'ON_SITE' | 'REMOTE' | 'HYBRID' | null;
  salary?: string | null;
  duration?: string | null;
  experienceLevel?: string | null;
  applyLink?: string | null;
  deadline?: string | null;
  interestedCount?: number;
  referralCount?: number;
  userInterested?: boolean;
  userReferral?: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface AlumniCareerHubProps {
  autoOpenForm?: boolean;
  initialType?: 'JOB' | 'INTERNSHIP';
}

export default function AlumniCareerHub({ autoOpenForm, initialType = 'JOB' }: AlumniCareerHubProps) {
  const [posts, setPosts] = useState<CareerPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(Boolean(autoOpenForm));

  useEffect(() => {
    if (autoOpenForm) setShowForm(true);
    if (initialType) {
      setFormData((prev) => ({ ...prev, type: initialType }));
    }
  }, [autoOpenForm, initialType]);

  const [formData, setFormData] = useState({
    type: 'JOB',
    companyName: '',
    companyLink: '',
    role: '',
    category: 'Engineering & Tech',
    relation: '',
    description: '',
    location: '',
    workMode: 'ON_SITE',
    salary: '',
    duration: '',
    experienceLevel: 'Fresher / Student',
    applyLink: '',
    deadline: ''
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/alumni/career');
      const data = await res.json();
      if (res.ok) setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch career posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/alumni/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setShowForm(false);
        setFormData({
          type: 'JOB',
          companyName: '',
          companyLink: '',
          role: '',
          category: 'Engineering & Tech',
          relation: '',
          description: '',
          location: '',
          workMode: 'ON_SITE',
          salary: '',
          duration: '',
          experienceLevel: 'Fresher / Student',
          applyLink: '',
          deadline: ''
        });
        fetchPosts();
      }
    } catch (err) {
      console.error('Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleInterest = async (careerId: string, interestType: 'INTERESTED' | 'REFERRAL_CONTACT') => {
    try {
      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === careerId) {
          if (interestType === 'INTERESTED') {
            const isCurr = p.userInterested;
            return {
              ...p,
              userInterested: !isCurr,
              interestedCount: Math.max(0, (p.interestedCount || 0) + (isCurr ? -1 : 1))
            };
          } else {
            const isCurr = p.userReferral;
            return {
              ...p,
              userReferral: !isCurr,
              referralCount: Math.max(0, (p.referralCount || 0) + (isCurr ? -1 : 1))
            };
          }
        }
        return p;
      }));

      const res = await fetch('/api/alumni/career/interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ careerId, interestType })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPosts(prev => prev.map(p => {
          if (p.id === careerId) {
            if (interestType === 'INTERESTED') {
              return { ...p, userInterested: data.active, interestedCount: data.count };
            } else {
              return { ...p, userReferral: data.active, referralCount: data.count };
            }
          }
          return p;
        }));
      }
    } catch (error) {
      console.error('Error toggling interest:', error);
      fetchPosts(); // sync on failure
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100/60 uppercase tracking-wider shadow-sm"><CheckCircle2 size={12} className="mr-1.5" /> Approved</span>;
      case 'REJECTED':
        return <span className="flex items-center text-[10px] font-bold text-rose-600 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-100/60 uppercase tracking-wider shadow-sm"><XCircle size={12} className="mr-1.5" /> Rejected</span>;
      default:
        return <span className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100/60 uppercase tracking-wider shadow-sm"><Clock size={12} className="mr-1.5" /> Pending</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Action Row when list is non-empty */}
      {!showForm && posts.length > 0 && (
        <div className="flex items-center justify-between bg-white/40 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-white/60 shadow-sm">
          <div>
            <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Your Job & Internship Postings</h3>
            <p className="text-xs text-slate-500 font-medium">Manage and share hiring opportunities</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-slate-900 text-white font-extrabold text-xs px-4 py-2.5 rounded-2xl shadow-md flex items-center gap-1.5 hover:bg-slate-800 transition-all cursor-pointer shrink-0"
          >
            <Plus size={15} />
            <span>Add New Job / Internship</span>
          </button>
        </div>
      )}

      {/* Filter Chips */}
      {!showForm && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            onClick={() => setSelectedCategory('All')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${selectedCategory === 'All' ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent' : 'bg-white/60 text-slate-600 border-white hover:bg-white'}`}
          >
            All Opportunities
          </button>
          {PROFESSIONAL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm border ${selectedCategory === cat ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-transparent' : 'bg-white/60 text-slate-600 border-white hover:bg-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Creation Form */}
      {showForm && (
        <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-900/5 overflow-hidden animate-in zoom-in-95 duration-300 relative">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/5 blur-[60px] rounded-full pointer-events-none"></div>
          
          <div className="p-8 md:p-10 border-b border-white/40 bg-white/30">
             <h3 className="text-xl font-bold text-slate-900">Post Job / Internship</h3>
             <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Fill in position, compensation, location & eligibility details</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8 relative z-10">
             
             {/* 1. Core Position Info */}
             <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider border-b border-slate-200/60 pb-2">1. Position & Company</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Opportunity Type *</label>
                      <select 
                        value={formData.type}
                        onChange={e => setFormData({...formData, type: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                      >
                         <option value="JOB">Full-Time Job</option>
                         <option value="INTERNSHIP">Internship</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Designation / Role Title *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Senior Software Engineer"
                        value={formData.role}
                        onChange={e => setFormData({...formData, role: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Company Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Company name..."
                        value={formData.companyName}
                        onChange={e => setFormData({...formData, companyName: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>
                </div>
             </div>

             {/* 2. Workplace & Compensation */}
             <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider border-b border-slate-200/60 pb-2">2. Location, Compensation & Schedule</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Workplace Mode</label>
                      <select 
                        value={formData.workMode}
                        onChange={e => setFormData({...formData, workMode: e.target.value as any})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                      >
                         <option value="ON_SITE">🏢 On-Site (Office)</option>
                         <option value="REMOTE">🏠 Remote (Work from Home)</option>
                         <option value="HYBRID">🌐 Hybrid</option>
                      </select>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Job Location / City</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mumbai, Surat, Remote"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Salary / Stipend Range</label>
                      <input 
                        type="text" 
                        placeholder={formData.type === 'INTERNSHIP' ? 'e.g. ₹15,000 / month' : 'e.g. ₹4.5 LPA - ₹6.5 LPA'}
                        value={formData.salary}
                        onChange={e => setFormData({...formData, salary: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                   {formData.type === 'INTERNSHIP' && (
                     <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Internship Duration</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 3 Months, 6 Months"
                          value={formData.duration}
                          onChange={e => setFormData({...formData, duration: e.target.value})}
                          className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                        />
                     </div>
                   )}

                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Experience Level Required</label>
                      <select 
                        value={formData.experienceLevel}
                        onChange={e => setFormData({...formData, experienceLevel: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 transition-all appearance-none cursor-pointer"
                      >
                         <option value="Fresher / Student">Fresher / Student (0 Years)</option>
                         <option value="Junior (1-3 Years)">Junior (1-3 Years)</option>
                         <option value="Mid-Senior (3-5 Years)">Mid-Senior (3-5 Years)</option>
                         <option value="Senior (5+ Years)">Senior (5+ Years)</option>
                      </select>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Application Deadline</label>
                      <input 
                        type="date" 
                        value={formData.deadline}
                        onChange={e => setFormData({...formData, deadline: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 transition-all"
                      />
                   </div>
                </div>
             </div>

             {/* 3. Links & Application Route */}
             <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-blue-600 uppercase tracking-wider border-b border-slate-200/60 pb-2">3. Direct Apply Links & Referral Info</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Direct Apply Link or HR Email</label>
                      <input 
                        type="text" 
                        placeholder="e.g. https://company.com/careers OR hr@company.com"
                        value={formData.applyLink}
                        onChange={e => setFormData({...formData, applyLink: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Company Website Link</label>
                      <input 
                        type="url" 
                        placeholder="https://company.com"
                        value={formData.companyLink}
                        onChange={e => setFormData({...formData, companyLink: e.target.value})}
                        className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Your Relation / Referral Assistance</label>
                   <input 
                     type="text" 
                     placeholder="e.g. Employee at company, can refer candidates directly to hiring manager"
                     value={formData.relation}
                     onChange={e => setFormData({...formData, relation: e.target.value})}
                     className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all"
                   />
                </div>
             </div>
             
             {/* 4. Description */}
             <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider ml-1">Role Description & Key Requirements</label>
                <textarea 
                  rows={4}
                  placeholder="Mention responsibilities, required skills, eligibility..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:bg-white text-xs font-bold text-slate-800 placeholder:text-slate-400 transition-all resize-none"
                />
             </div>

             <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-slate-100/50">
                <button 
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-white/60 text-slate-600 border border-slate-200/60 rounded-2xl font-bold text-xs hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex items-center justify-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-blue-500/10 active:scale-95 transition-all disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="animate-spin mr-2" size={16} /> : <Briefcase size={16} className="mr-2" />}
                  Submit Career Posting
                </button>
             </div>
          </form>
        </div>
      )}

      {/* Posts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loading ? (
          <div className="lg:col-span-2 py-32 flex flex-col items-center justify-center bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm">
             <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Accessing Career Hub...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="lg:col-span-2 py-24 flex flex-col items-center justify-center text-center bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-sm p-8">
             <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
                <Briefcase size={32} />
             </div>
             <h3 className="text-lg font-bold text-slate-800">No Jobs / Internships Added Yet</h3>
             <p className="text-slate-500 text-xs font-medium mt-1.5 max-w-sm mx-auto">Share hiring opportunities or referrals to help Madni students and alumni.</p>
             <button
               onClick={() => setShowForm(true)}
               className="bg-slate-900 text-white hover:bg-slate-800 text-xs font-extrabold px-5 py-2.5 rounded-2xl shadow-md inline-flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] mt-5"
             >
               <Plus size={16} />
               <span>Add Now</span>
             </button>
          </div>
        ) : posts.filter(post => selectedCategory === 'All' || post.category === selectedCategory).length === 0 ? (
          <div className="lg:col-span-2 py-32 text-center bg-white/40 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm">
             <div className="w-24 h-24 bg-white border border-slate-100 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <Tags size={40} />
             </div>
             <h3 className="text-xl font-bold text-slate-900">No postings in this category</h3>
             <p className="text-slate-500 text-sm font-medium mt-2">Try selecting a different category filter.</p>
          </div>
        ) : posts.filter(post => selectedCategory === 'All' || post.category === selectedCategory).map(post => (
          <div key={post.id} className="bg-white/40 backdrop-blur-md rounded-[2.5rem] border border-white/60 shadow-xl shadow-slate-900/5 hover:scale-[1.01] transition-all duration-300 overflow-hidden group flex flex-col justify-between">
             <div className="p-7 md:p-8 space-y-5">
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                   <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform shrink-0">
                         <Briefcase size={22} />
                      </div>
                      <div>
                         <h4 className="text-base font-extrabold text-slate-900 leading-tight group-hover:text-blue-600 transition-colors line-clamp-1">{post.role}</h4>
                         <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Building2 size={13} className="text-slate-400" />
                            <span>{post.companyName}</span>
                         </p>
                      </div>
                   </div>
                   {getStatusBadge(post.status)}
                </div>

                {/* Badges Pill Row */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                   <span className="text-[10px] font-extrabold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 uppercase">
                      {post.type}
                   </span>
                   {post.workMode && (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg border border-slate-200/80">
                         {post.workMode === 'REMOTE' ? '🏠 Remote' : post.workMode === 'HYBRID' ? '🌐 Hybrid' : '🏢 On-Site'}
                      </span>
                   )}
                   {post.location && (
                      <span className="text-[10px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100 flex items-center gap-1">
                         <MapPin size={11} /> {post.location}
                      </span>
                   )}
                   {post.salary && (
                      <span className="text-[10px] font-extrabold px-2.5 py-1 bg-amber-50 text-amber-900 rounded-lg border border-amber-200/80 flex items-center gap-1">
                         <DollarSign size={11} /> {post.salary}
                      </span>
                   )}
                </div>

                {/* Description */}
                {post.description && (
                  <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-3 bg-white/50 p-3.5 rounded-2xl border border-slate-100/80">
                    {post.description}
                  </p>
                )}

                {/* Additional Details */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 font-medium pt-1">
                   {post.experienceLevel && (
                      <div className="flex items-center gap-1.5">
                         <Award size={13} className="text-slate-400 shrink-0" />
                         <span className="truncate">{post.experienceLevel}</span>
                      </div>
                   )}
                   {post.deadline && (
                      <div className="flex items-center gap-1.5">
                         <Calendar size={13} className="text-slate-400 shrink-0" />
                         <span>Apply by {new Date(post.deadline).toLocaleDateString()}</span>
                      </div>
                   )}
                   {post.relation && (
                      <div className="col-span-2 text-indigo-700 font-bold bg-indigo-50/80 px-3 py-1.5 rounded-xl border border-indigo-100 flex items-center gap-1.5">
                         <Handshake size={14} className="shrink-0" />
                         <span className="truncate">Referral Note: {post.relation}</span>
                      </div>
                   )}
                </div>
             </div>

             {/* Card Footer: Interactive Response Buttons */}
             <div className="px-7 pb-7 pt-3 border-t border-slate-100/80 space-y-3 bg-slate-50/50">
                {/* 2 Interactive Buttons: I'm Interested & Referral Contact */}
                <div className="grid grid-cols-2 gap-2.5">
                   <button
                     onClick={() => handleToggleInterest(post.id, 'INTERESTED')}
                     className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border cursor-pointer ${
                       post.userInterested 
                         ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20' 
                         : 'bg-white hover:bg-blue-50 text-blue-700 border-blue-200'
                     }`}
                   >
                     <ThumbsUp size={14} />
                     <span>I'm Interested</span>
                     <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                       post.userInterested ? 'bg-white text-blue-700' : 'bg-blue-100 text-blue-800'
                     }`}>
                       {post.interestedCount || 0}
                     </span>
                   </button>

                   <button
                     onClick={() => handleToggleInterest(post.id, 'REFERRAL_CONTACT')}
                     className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm border cursor-pointer ${
                       post.userReferral 
                         ? 'bg-purple-600 text-white border-purple-600 shadow-purple-500/20' 
                         : 'bg-white hover:bg-purple-50 text-purple-700 border-purple-200'
                     }`}
                   >
                     <Handshake size={14} />
                     <span>Have Referral</span>
                     <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                       post.userReferral ? 'bg-white text-purple-700' : 'bg-purple-100 text-purple-800'
                     }`}>
                       {post.referralCount || 0}
                     </span>
                   </button>
                </div>

                {/* Secondary Actions: Link / Registrations */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium pt-1">
                   <span>Posted {new Date(post.createdAt).toLocaleDateString()}</span>
                   <div className="flex items-center gap-2">
                      {post.applyLink && (
                        <a
                          href={post.applyLink.startsWith('http') ? post.applyLink : `mailto:${post.applyLink}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-extrabold border border-emerald-200 transition-colors"
                        >
                          <Send size={11} />
                          <span>Apply</span>
                        </a>
                      )}
                      <Link
                        href={`/alumni/registrations?postType=CAREER&postId=${post.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white text-blue-600 hover:bg-blue-600 hover:text-white border border-slate-200 transition-all text-[10px] font-extrabold shadow-sm"
                      >
                        <span>Registrations</span>
                        <ChevronRight size={12} />
                      </Link>
                   </div>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
