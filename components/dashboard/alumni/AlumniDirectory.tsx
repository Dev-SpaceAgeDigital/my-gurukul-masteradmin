'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Briefcase, Building2, GraduationCap, Search, Sparkles, Users } from 'lucide-react';

interface AlumniMember {
  id: string;
  name: string;
  email: string;
  batchYear: string | null;
  linkedIn: string | null;
  profilePic: string | null;
  currentTitle: string | null;
  currentBio: string | null;
  schoolName: string | null;
}

const itemsPerPage = 9;

function normalizeLinkedInUrl(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function LinkedInIcon() {
  return (
    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.58c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.68H9.34V8.98h3.42v1.57h.05c.48-.9 1.64-1.85 3.37-1.85 3.61 0 4.27 2.38 4.27 5.47v6.28ZM5.32 7.41a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12Zm1.78 13.04H3.54V8.98H7.1v11.47ZM22.23 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.21 0 22.23 0Z" />
    </svg>
  );
}

function AlumniAvatar({ name, profilePic, size = 52 }: { name: string; profilePic?: string | null; size?: number }) {
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');

  if (profilePic) {
    return (
      <div style={{ width: size, height: size }} className="relative shrink-0 overflow-hidden rounded-lg border border-white shadow-sm">
        <Image src={profilePic} alt={name} fill className="object-cover" />
      </div>
    );
  }

  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.32 }}
      className="flex shrink-0 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 font-black text-blue-700 shadow-sm"
    >
      {initials || 'A'}
    </div>
  );
}

function AlumniCardSkeleton() {
  return (
    <article className="flex min-h-[230px] animate-pulse flex-col gap-4 rounded-3xl border border-white/80 bg-white/70 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 rounded-2xl bg-slate-200/70" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-4 w-2/3 rounded-full bg-slate-200/80" />
          <div className="h-6 w-28 rounded-full bg-blue-100/80" />
        </div>
      </div>
      <div className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3">
        <div className="h-3 w-4/5 rounded-full bg-slate-200/80" />
        <div className="h-3 w-3/5 rounded-full bg-slate-200/80" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded-full bg-slate-200/70" />
        <div className="h-3 w-3/4 rounded-full bg-slate-200/70" />
      </div>
      <div className="mt-auto flex justify-end border-t border-slate-100 pt-3">
        <div className="h-10 w-10 rounded-2xl bg-[#0a66c2]/20" />
      </div>
    </article>
  );
}

export default function AlumniDirectory() {
  const [alumniList, setAlumniList] = useState<AlumniMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('All');
  const [selectedSchool, setSelectedSchool] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAlumni = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/alumni/directory');
      if (res.ok) {
        const data = await res.json();
        setAlumniList(Array.isArray(data) ? data : []);
      }
    } catch {
      setAlumniList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlumni();
  }, [fetchAlumni]);

  const batchYears = useMemo(
    () => ['All', ...Array.from(new Set(alumniList.map(alumni => alumni.batchYear).filter(Boolean) as string[]))].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return b.localeCompare(a);
    }),
    [alumniList]
  );

  const schools = useMemo(
    () => ['All', ...Array.from(new Set(alumniList.map(alumni => alumni.schoolName).filter(Boolean) as string[]))].sort(),
    [alumniList]
  );

  const filteredAlumni = alumniList.filter((alumni) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      alumni.name.toLowerCase().includes(query) ||
      (alumni.currentTitle || '').toLowerCase().includes(query) ||
      (alumni.schoolName || '').toLowerCase().includes(query) ||
      (alumni.batchYear || '').toLowerCase().includes(query);
    const matchesBatch = selectedBatch === 'All' || alumni.batchYear === selectedBatch;
    const matchesSchool = selectedSchool === 'All' || alumni.schoolName === selectedSchool;

    return matchesSearch && matchesBatch && matchesSchool;
  });

  const totalPages = Math.max(1, Math.ceil(filteredAlumni.length / itemsPerPage));
  const paginated = filteredAlumni.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedBatch, selectedSchool]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 pb-28 animate-in fade-in duration-300 sm:gap-5 sm:pb-16">
      <section className="relative overflow-hidden rounded-3xl border border-white/60 bg-white/40 p-4 shadow-xl shadow-slate-900/5 backdrop-blur-md sm:p-6">
        <div className="relative z-10">
          <div className="mb-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-blue-500/10 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-bold text-blue-600">
              <Sparkles size={11} className="animate-pulse" />
              Alumni Directory
            </span>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white bg-white/80 px-2.5 py-1 text-[11px] font-bold text-slate-600 shadow-sm">
              <Users size={13} className="text-blue-600" />
              {filteredAlumni.length} alumni found
            </span>
          </div>

          <h2 className="text-lg font-extrabold tracking-tight text-slate-800 sm:text-2xl">Find Alumni</h2>
          <p className="mt-1 max-w-xl text-[11px] font-medium leading-relaxed text-slate-600 sm:text-xs">
            Search classmates and seniors by name, batch, school, or current role, then connect through LinkedIn.
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border border-white/70 bg-white/50 p-3 shadow-xl shadow-slate-900/5 backdrop-blur-md sm:p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
          <input
            type="text"
            placeholder="Search alumni..."
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 pl-10 text-sm font-semibold text-slate-800 shadow-sm outline-none transition-all focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10"
          />
        </div>
        <select
          value={selectedBatch}
          onChange={event => setSelectedBatch(event.target.value)}
          className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 lg:w-auto"
        >
          {batchYears.map(batch => (
            <option key={batch} value={batch}>
              {batch === 'All' ? 'All Batches' : `Batch of ${batch}`}
            </option>
          ))}
        </select>
        <select
          value={selectedSchool}
          onChange={event => setSelectedSchool(event.target.value)}
          className="w-full rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm outline-none transition-all focus:border-blue-400 lg:w-auto"
        >
          {schools.map(school => (
            <option key={school} value={school}>
              {school === 'All' ? 'All Schools' : school}
            </option>
          ))}
        </select>
      </section>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <AlumniCardSkeleton key={index} />
          ))}
        </div>
      ) : filteredAlumni.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-white/70 bg-white/60 p-8 text-center shadow-xl shadow-slate-900/5 backdrop-blur-md">
          <Users size={40} className="text-slate-300" />
          <h3 className="mt-4 text-base font-black text-slate-900">No alumni found</h3>
          <p className="mt-1 text-sm font-medium text-slate-500">Try changing the search or filters.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map(member => {
              const linkedInUrl = member.linkedIn ? normalizeLinkedInUrl(member.linkedIn) : '';

              return (
                <article
                  key={member.id}
                  className="group flex min-h-[220px] flex-col gap-3 rounded-3xl border border-white/80 bg-white/70 p-4 shadow-lg shadow-slate-900/5 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:bg-white/85 hover:shadow-xl sm:gap-4 sm:p-5"
                >
                  <div className="flex items-start gap-4">
                    <AlumniAvatar name={member.name} profilePic={member.profilePic} size={56} />
                    <div className="min-w-0 flex-1">
                      <h3 className="break-words text-[15px] font-black text-slate-900 transition-colors group-hover:text-blue-600 sm:text-base">{member.name}</h3>
                      <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-blue-50/90 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                        <GraduationCap size={12} />
                        Batch of {member.batchYear || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={13} className="shrink-0 text-slate-400" />
                      <span className="truncate">{member.schoolName || 'Madni Education Trust'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={13} className="shrink-0 text-blue-500" />
                      <span className="truncate">{member.currentTitle || 'Alumnus'}</span>
                    </div>
                  </div>

                  {member.currentBio && (
                    <p className="line-clamp-2 text-sm font-medium leading-relaxed text-slate-600">{member.currentBio}</p>
                  )}

                  <div className="mt-auto flex items-center justify-end border-t border-slate-100 pt-3">
                    {linkedInUrl ? (
                      <a
                        href={linkedInUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${member.name}'s LinkedIn profile`}
                        title="Open LinkedIn profile"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-[#0a66c2] text-white shadow-sm transition-all hover:bg-[#004182] hover:shadow-md"
                      >
                        <LinkedInIcon />
                      </a>
                    ) : (
                      <span className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-400">
                        No LinkedIn
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="rounded-2xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition-all hover:border-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
