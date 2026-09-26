'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Briefcase, ExternalLink, Loader2, Mail, Phone, UserRound } from 'lucide-react';
import { usePortalDialog } from '@/components/ui/PortalDialog';

interface Registration {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  linkedInUrl: string | null;
  createdAt: string;
}

interface PostSummary {
  id: string;
  title: string;
  subtitle: string | null;
  type: string;
}

export default function OpportunityRegistrations({
  postType,
  postId,
}: {
  postType: string;
  postId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState<PostSummary | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const { dialog, showAlert } = usePortalDialog();

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const params = new URLSearchParams({ postType, postId });
        const res = await fetch(`/api/alumni/registrations?${params.toString()}`);
        const data = await res.json();
        if (!res.ok) {
          showAlert({ title: 'Load failed', message: data.error || 'Unable to load registrations.', variant: 'danger' });
          return;
        }
        setPost(data.post);
        setRegistrations(Array.isArray(data.registrations) ? data.registrations : []);
      } catch {
        showAlert({ title: 'Load failed', message: 'Unable to load registrations.', variant: 'danger' });
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, [postId, postType]);

  return (
    <>
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <Link
        href="/alumni/dashboard"
        className="inline-flex items-center text-[11px] font-bold text-blue-600 uppercase tracking-wider hover:text-blue-700 transition-colors"
      >
        <ArrowLeft size={14} className="mr-2" />
        Back to Alumni Dashboard
      </Link>

      <div className="bg-white/50 backdrop-blur-md border border-white/70 rounded-[2rem] p-8 shadow-xl shadow-slate-900/5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrations</p>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {post?.title || 'Opportunity'}
              </h2>
              {post?.subtitle && <p className="text-sm font-semibold text-slate-500 mt-1">{post.subtitle}</p>}
            </div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
            {registrations.length} registered
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center bg-white/40 rounded-[2rem] border border-white/60">
          <Loader2 className="animate-spin text-blue-600 mb-4" size={36} />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.25em]">Loading registrations</p>
        </div>
      ) : registrations.length === 0 ? (
        <div className="py-24 text-center bg-white/40 rounded-[2rem] border border-white/60">
          <UserRound size={40} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-900">No registrations yet</h3>
          <p className="text-sm text-slate-500 font-medium mt-2">New applicants will appear here after they submit the public form.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.map((registration) => (
            <div key={registration.id} className="bg-white/60 border border-white/70 rounded-2xl p-6 shadow-md shadow-slate-900/5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{registration.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                    Registered {new Date(registration.createdAt).toLocaleDateString()}
                  </p>
                </div>
                {registration.linkedInUrl && (
                  <a
                    href={registration.linkedInUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors"
                    aria-label="Open LinkedIn profile"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
              <div className="mt-5 space-y-3">
                <a href={`mailto:${registration.email}`} className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600">
                  <Mail size={15} className="mr-3 text-slate-400" />
                  {registration.email}
                </a>
                <a href={`tel:${registration.phoneNo}`} className="flex items-center text-sm font-semibold text-slate-600 hover:text-blue-600">
                  <Phone size={15} className="mr-3 text-slate-400" />
                  {registration.phoneNo}
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    {dialog}
    </>
  );
}
