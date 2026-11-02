"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { useSite } from "@/context/SiteContext";

function CaseStudyContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const { siteData } = useSite();
  const [progress, setProgress] = useState(0);

  const projects = siteData.projects || [];
  const selectedProject = projectId
    ? projects.find((p) => p.id === projectId)
    : projects[0];

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const currentProgress = Math.min(
          100,
          Math.round((window.scrollY / totalHeight) * 100)
        );
        setProgress(currentProgress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!selectedProject || !selectedProject.id) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white mb-4">
          Proyek Tidak Ditemukan
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Proyek yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Proyek
        </Link>
      </div>
    );
  }

  const cs = selectedProject.caseStudy || {};
  const heroPhoto = cs.heroImage || selectedProject.image;
  const projectTitle = cs.title?.trim() || selectedProject.title || "Case Study";
  const projectSubtitle = cs.subtitle?.trim() || selectedProject.description || "";
  const liveUrl = selectedProject.projectUrl || cs.projectUrl;

  const hasMetadata = Boolean(
    cs.client?.trim() || cs.role?.trim() || cs.timeline?.trim() || cs.deliverables?.trim() || liveUrl
  );

  return (
    <article>
      {/* Reading progress bar */}
      <div
        className="progress-bar"
        style={{ width: `${progress}%` }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Reading progress"
      ></div>

      {/* CASE STUDY HEADER */}
      <header className="max-w-4xl mx-auto px-6 mb-10">
        <div className="flex items-center justify-between gap-4 mb-8 flex-wrap">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to projects
          </Link>

          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-white px-5 py-2 rounded-full text-xs font-semibold hover:bg-accent-light transition-all shadow-sm"
            >
              Kunjungi Situs Proyek <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="text-xs bg-accent-subtle text-accent border border-accent-subtle px-2.5 py-1 rounded-full">
            {cs.categoryTag || selectedProject.categoryLabel || "Case Study"}
          </span>
          {cs.timeline?.trim() && (
            <span className="text-xs text-zinc-400 ml-1">{cs.timeline.trim()}</span>
          )}
        </div>

        <h1 className="reveal font-display font-bold text-4xl md:text-5xl lg:text-6xl text-zinc-900 dark:text-white leading-tight mb-6">
          {projectTitle}
        </h1>

        {projectSubtitle && (
          <p className="reveal d1 text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-10 max-w-2xl">
            {projectSubtitle}
          </p>
        )}

        {hasMetadata && (
          <div className="reveal d2 flex flex-wrap gap-6 sm:gap-12 py-8 border-t border-b border-zinc-100 dark:border-zinc-900">
            {cs.client?.trim() && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Client</p>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">{cs.client.trim()}</p>
              </div>
            )}
            {cs.role?.trim() && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Role</p>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">{cs.role.trim()}</p>
              </div>
            )}
            {cs.timeline?.trim() && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Timeline</p>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">{cs.timeline.trim()}</p>
              </div>
            )}
            {cs.deliverables?.trim() && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Deliverables</p>
                <p className="font-medium text-zinc-900 dark:text-white text-sm">{cs.deliverables.trim()}</p>
              </div>
            )}
            {liveUrl && (
              <div>
                <p className="text-xs text-zinc-400 uppercase tracking-widest mb-1">Live Site</p>
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:underline text-sm inline-flex items-center gap-1"
                >
                  Visit Project <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}
      </header>

      {/* HERO IMAGE */}
      <div className="max-w-6xl mx-auto px-6 mb-16">
        <div className="reveal pf w-full h-72 md:h-[480px] rounded-3xl relative overflow-hidden">
          {heroPhoto && (
            <Image
              src={heroPhoto}
              alt={projectTitle}
              fill
              priority
              className="object-cover"
            />
          )}
        </div>
      </div>

      {/* RESULTS BANNER */}
      {cs.stats && cs.stats.length > 0 && (
        <div className="max-w-4xl mx-auto px-6 mb-16">
          <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
            {cs.stats.map((stat, i) => (
              <div key={i} className="stat-card bg-zinc-50 dark:bg-zinc-900 rounded-2xl p-5 pl-6">
                <p className="font-display font-bold text-3xl text-zinc-900 dark:text-white">
                  {stat.value}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-snug">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ARTICLE BODY */}
      <div className="max-w-3xl mx-auto px-6 pb-4 prose-cs">
        <h2>{cs.briefTitle || "The brief"}</h2>
        {cs.briefContent1 && <p>{cs.briefContent1}</p>}
        {cs.briefContent2 && <p>{cs.briefContent2}</p>}

        {cs.briefQuote && (
          <blockquote className="my-6">
            <p>{cs.briefQuote}</p>
          </blockquote>
        )}

        {cs.discoveryTitle && <h2>{cs.discoveryTitle}</h2>}
        {cs.interviewsText && <p>{cs.interviewsText}</p>}
        {cs.userInterviewPoints && cs.userInterviewPoints.length > 0 && (
          <ul className="list-disc pl-5 my-4 space-y-2">
            {cs.userInterviewPoints.map((pt, i) => (
              <li key={i}>{pt}</li>
            ))}
          </ul>
        )}

        {cs.heuristicAuditText && <p>{cs.heuristicAuditText}</p>}
      </div>

      {/* Full-width audit image */}
      {cs.auditImage && (
        <div className="max-w-5xl mx-auto px-6 mb-12">
          <div className="reveal pf w-full h-56 md:h-80 rounded-2xl relative overflow-hidden">
            <Image
              src={cs.auditImage}
              alt="Audit"
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          </div>
          {cs.auditCaption && <p className="img-caption">{cs.auditCaption}</p>}
        </div>
      )}

      {/* Solution section */}
      {(cs.solutionTitle || cs.solutionContent) && (
        <div className="max-w-3xl mx-auto px-6 pb-12 prose-cs">
          <h2>{cs.solutionTitle || "The Solution"}</h2>
          <p>{cs.solutionContent}</p>
        </div>
      )}

      {/* Bottom Case Study Navigation */}
      <div className="max-w-4xl mx-auto px-6 pt-12 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> All Projects
        </Link>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-light transition-colors"
        >
          Next Project <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </article>
  );
}

export default function CaseStudyPage() {
  return (
    <main className="pt-28 pb-24">
      <Suspense fallback={<div className="max-w-4xl mx-auto px-6 text-zinc-400">Loading case study...</div>}>
        <CaseStudyContent />
      </Suspense>
    </main>
  );
}
