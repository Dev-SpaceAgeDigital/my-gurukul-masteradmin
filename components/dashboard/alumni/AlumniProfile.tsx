'use client';

import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Globe,
  Camera,
  Save,
  Loader2,
  FileText,
  ExternalLink,
  ShieldAlert,
  GraduationCap,
  School,
  Building2
} from 'lucide-react';
import Image from 'next/image';
import { usePortalDialog } from '@/components/ui/PortalDialog';

export default function AlumniProfile() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { dialog, showAlert } = usePortalDialog();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    batchYear: '',
    schoolName: '',
    currentTitle: '',
    currentBio: '',
    workLink: '',
    linkedIn: '',
    profilePic: ''
  });

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/alumni/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        if (data.profilePic) setPreviewImage(data.profilePic);
      }
    } catch (err) {
      console.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('name', profile.name);
    formData.append('currentTitle', profile.currentTitle || '');
    formData.append('currentBio', profile.currentBio || '');
    formData.append('workLink', profile.workLink || '');
    formData.append('linkedIn', profile.linkedIn || '');
    formData.append('existingProfilePic', profile.profilePic || '');
    if (file) formData.append('profilePic', file);

    try {
      const res = await fetch('/api/alumni/profile', {
        method: 'PATCH',
        body: formData
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        showAlert({
          title: 'Profile synchronized',
          message: 'Professional profile synchronized successfully.',
          variant: 'success',
        });
      } else {
        const err = await res.json();
        showAlert({ title: 'Synchronization failed', message: err.error || 'Professional profile could not be updated.', variant: 'danger' });
      }
    } catch (err) {
      showAlert({ title: 'Network transition error', message: 'Please check your connection and try again.', variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 flex flex-col items-center justify-center space-y-4 animate-in fade-in duration-500">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Querying Identity Records...</p>
      </div>
    );
  }

  return (
    <>
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-2 border-b border-slate-100/50">
        <div className="space-y-1">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Professional Identity</h2>
          <p className="text-xs text-slate-500 font-medium">Manage and share your global institutional profile</p>
        </div>

      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: ID Card Preview */}
        <div className="space-y-6 mt-4 md:mt-0">
          <div className="bg-white/60 backdrop-blur-xl p-7 rounded-[2.5rem] border border-white/80 shadow-xl shadow-blue-900/5 flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-400/5 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:bg-blue-400/15"></div>

            <div className="space-y-5 relative z-10">

              {/* Logo section */}
              <div className="flex justify-center mb-4 border-b border-slate-100/80 pb-4">
                <Image src="/madni-logo.png" alt="Madni Logo" width={60} height={60} className="object-contain" />
              </div>

              {/* Profile Pic & Basic info row */}
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white border border-slate-100 rounded-full overflow-hidden relative shadow-md ring-4 ring-white flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-500">
                  {previewImage ? (
                    <Image src={previewImage} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User size={26} className="text-slate-300" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors tracking-tight truncate">{profile.name || 'Alumni Name'}</h3>
                  <p className="text-[10px] font-bold text-blue-700 bg-blue-50/80 border border-blue-100/80 px-3 py-1 rounded-full inline-flex items-center gap-1.5 mt-1.5 shadow-sm">
                    <GraduationCap size={12} />
                    <span>Batch of {profile.batchYear || 'N/A'}</span>
                  </p>
                </div>
              </div>

              {/* Academic School & Designation details */}
              <div className="bg-slate-50/60 p-3.5 rounded-2xl border border-slate-100/60 space-y-2.5">
                <div className="flex items-center text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                  <Building2 size={13} className="mr-2 text-slate-400 shrink-0" />
                  <span className="truncate">{profile.schoolName || 'Madni High School'}</span>
                </div>
                <div className="flex items-center text-xs text-slate-700 font-bold">
                  <Briefcase size={13} className="mr-2 text-blue-400 shrink-0" />
                  <span className="truncate">{profile.currentTitle || 'Graduate'}</span>
                </div>
              </div>

              {/* Professional Biography */}
              {profile.currentBio ? (
                <p className="text-[13px] text-slate-600 leading-relaxed font-medium line-clamp-3 italic px-1">
                  "{profile.currentBio}"
                </p>
              ) : (
                <p className="text-[13px] text-slate-400 leading-relaxed font-medium italic px-1">
                  No bio description provided.
                </p>
              )}
            </div>
          </div>

          {/* Institutional Banner */}
          <div className="bg-blue-50/50 border border-blue-100/50 p-6 rounded-[2rem] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full"></div>
            <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <ShieldAlert size={14} />
              <span>Verified Account Details</span>
            </h5>
            <p className="text-xs text-blue-900/60 font-medium leading-relaxed">
              Core information (Email, Year of Graduation) is verified and locked to protect the integrity of the alumni community. If details require updating, please connect with the school administrators.
            </p>
          </div>
        </div>

        {/* Right: Editable Profile Workspace */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/40 backdrop-blur-md p-8 md:p-10 rounded-[2rem] border border-white/60 shadow-xl shadow-slate-900/5 space-y-8">

            {/* Profile Image Upload Section */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100/80">
              <div className="relative group cursor-pointer w-24 h-24 shrink-0">
                <div className="absolute inset-0 bg-slate-900/40 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-10">
                  <Camera className="text-white transform scale-90 group-hover:scale-100 transition-transform duration-300" size={20} />
                </div>
                <div className="w-24 h-24 bg-slate-100/60 border-2 border-slate-200/80 rounded-[1.5rem] overflow-hidden relative shadow-inner flex items-center justify-center">
                  {previewImage ? (
                    <Image src={previewImage} alt="Profile" fill className="object-cover" />
                  ) : (
                    <User size={32} className="text-slate-300" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                />
              </div>
              <div className="space-y-2 text-center sm:text-left mt-2">
                <h3 className="text-sm font-bold text-slate-800">Profile Picture</h3>
                <p className="text-xs font-medium text-slate-500 max-w-sm leading-relaxed">Upload a professional headshot to be displayed on your Alumni ID Card and the community directory. Max size 2MB.</p>
              </div>
            </div>

            {/* Authorized Email (Disabled) */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                <Mail size={13} className="mr-2 text-slate-400" /> Authorized Academic Email
              </label>
              <div className="w-full px-5 py-4 bg-slate-100/50 border border-slate-200/50 rounded-2xl text-xs font-semibold text-slate-500 cursor-not-allowed select-none">
                {profile.email}
              </div>
            </div>

            {/* Designation & LinkedIn Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                  <Briefcase size={13} className="mr-2 text-slate-400" /> Current Professional Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Senior Product Designer at Apple"
                  value={profile.currentTitle || ''}
                  onChange={(e) => setProfile({ ...profile, currentTitle: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 hover:bg-white focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-slate-800 placeholder:text-slate-400 animate-transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                  <ExternalLink size={13} className="mr-2 text-slate-400" /> LinkedIn Profile URL
                </label>
                <input
                  type="url"
                  placeholder="linkedin.com/in/username"
                  value={profile.linkedIn || ''}
                  onChange={(e) => setProfile({ ...profile, linkedIn: e.target.value })}
                  className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 hover:bg-white focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-slate-800 placeholder:text-slate-400 animate-transition"
                />
              </div>
            </div>

            {/* Personal Portfolio URL */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                <Globe size={13} className="mr-2 text-slate-400" /> Workspace / Personal Portfolio Link
              </label>
              <input
                type="url"
                placeholder="https://yourportfolio.com"
                value={profile.workLink || ''}
                onChange={(e) => setProfile({ ...profile, workLink: e.target.value })}
                className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 hover:bg-white focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-slate-800 placeholder:text-slate-400 animate-transition"
              />
            </div>

            {/* Professional Bio */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1 flex items-center">
                <FileText size={13} className="mr-2 text-slate-400" /> Professional Bio & Biography
              </label>
              <textarea
                rows={5}
                placeholder="Introduce yourself to the community. Share your technical skillset, career path achievements, or mentorship goals..."
                value={profile.currentBio || ''}
                onChange={(e) => setProfile({ ...profile, currentBio: e.target.value })}
                className="w-full px-5 py-3.5 bg-white/50 border border-slate-200/80 hover:bg-white focus:bg-white focus:border-blue-500 rounded-2xl outline-none transition-all duration-300 focus:ring-4 focus:ring-blue-500/10 text-xs font-semibold text-slate-800 placeholder:text-slate-400 resize-none animate-transition"
              />
            </div>

            {/* Action Submit */}
            <div className="pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={saving}
                className="w-full md:w-auto px-8 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl transition-all shadow-md shadow-blue-500/10 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                <span>{saving ? 'Synchronizing Identity...' : 'Save Professional Identity'}</span>
              </button>
            </div>

          </div>
        </div>
      </form>

    </div>
    {dialog}
    </>
  );
}
