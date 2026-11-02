"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useSite } from "@/context/SiteContext";

export default function ProjectsPage() {
  const { siteData } = useSite();
  const [filter, setFilter] = useState<string>("all");

  const filterOptions = [
    { value: "all", label: "All Projects" },
    { value: "research-publication", label: "Research & Publication" },
    { value: "copyright", label: "Copyright" },
    { value: "graphic-design", label: "Graphic Design" },
    { value: "video-editing", label: "Video Editing" },
    { value: "community-service", label: "Community Service" },
    { value: "research-innovation", label: "Research Innovation" },
    { value: "book-writing", label: "Book Writing" },
    { value: "competition", label: "Competition" },
    { value: "volunteer", label: "Volunteer" },
  ];

  const projectsSec = siteData.projectsSection || {};
  const projects = siteData.projects || [];

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => {
          const cat = (p.category || "").toLowerCase().trim();
          const label = (p.categoryLabel || "").toLowerCase().trim();
          const target = filter.toLowerCase().trim();
          const targetOpt = filterOptions.find((f) => f.value === filter);
          const targetLabel = targetOpt ? targetOpt.label.toLowerCase().trim() : "";
          return (
            cat === target ||
            label === target ||
            (targetLabel && label === targetLabel) ||
            (targetLabel && cat === targetLabel)
          );
        });

  return (
    <main className="pt-36 pb-24">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden mb-12">
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
            {projectsSec.pageBadgeText || "Portfolio"}
          </p>
          <h1 className="reveal font-display font-bold text-5xl md:text-6xl text-zinc-900 dark:text-white leading-tight mb-4">
            {projectsSec.pageTitle || "All Projects"}
          </h1>
          {projectsSec.pageSubtitle && (
            <p className="reveal text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed mb-8">
              {projectsSec.pageSubtitle}
            </p>
          )}

          <div className="reveal flex flex-wrap gap-2">
            {filterOptions.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
                  filter === f.value
                    ? "bg-accent text-white border-accent"
                    : "bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-accent"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS GRID */}
      <section>
        <div className="max-w-6xl mx-auto px-6">
          {projects.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 max-w-2xl mx-auto">
              <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Belum ada portofolio proyek yang dipublikasikan
              </p>
              <p className="text-xs text-zinc-500">
                Silakan tambahkan data proyek Anda melalui halaman Admin Dashboard.
              </p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 max-w-2xl mx-auto">
              <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Tidak ada proyek untuk kategori ini
              </p>
              <button
                onClick={() => setFilter("all")}
                className="mt-3 text-xs bg-accent text-white px-4 py-2 rounded-full font-medium"
              >
                Tampilkan Semua Proyek
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <article
                  key={project.id || index}
                  className="project-card card group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-accent flex flex-col justify-between"
                >
                  <div>
                    <div className="pf w-full h-48 relative bg-zinc-800/40">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          priority={index < 3}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                          No Project Image
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-3">
                        {project.tags?.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-accent-subtle text-accent border border-accent-subtle px-2.5 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link href={`/case-study?id=${project.id}`}>
                        <h2 className="font-display font-bold text-xl text-zinc-900 dark:text-white mb-2 group-hover:text-accent transition-colors">
                          {project.title}
                        </h2>
                      </Link>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                        {project.description}
                      </p>
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex items-center justify-between gap-4 flex-wrap">
                    <Link
                      href={`/case-study?id=${project.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white nl"
                    >
                      View case study <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    {(project.projectUrl || project.caseStudy?.projectUrl) && (
                      <a
                        href={project.projectUrl || project.caseStudy?.projectUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                      >
                        Visit site <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
