"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ChevronDown,
  Layout,
  Code,
  Sparkles,
  Mail,
  Linkedin,
  Github,
  FileText,
  AlertCircle,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { useSite, sortBlogByNewest } from "@/context/SiteContext";
import { convertGoogleDriveUrl } from "@/lib/drive-helper";
import { getServiceIconComponent } from "@/lib/icons";

export default function Home() {
  const { siteData, trackPageView } = useSite();
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  React.useEffect(() => {
    trackPageView();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    const endpoint = siteData.footer?.formspreeUrl?.trim();

    if (endpoint) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formName,
            email: formEmail,
            message: formMessage,
          }),
        });

        if (response.ok) {
          setFormSubmitted(true);
        } else {
          const data = await response.json();
          setFormError(data.error || "Gagal mengirim pesan via Formspree.");
        }
      } catch (err: any) {
        console.error("Formspree error:", err);
        setFormError("Terjadi kesalahan jaringan saat mengirim pesan.");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setTimeout(() => {
        setIsSubmitting(false);
        setFormSubmitted(true);
      }, 600);
    }
  };

  const hero = siteData.hero || {};
  const servicesSec = siteData.servicesSection || {};
  const services = siteData.services || [];
  const projectsSec = siteData.projectsSection || {};
  const projects = siteData.projects || [];
  const about = siteData.about || {};
  const blogSec = siteData.blogSection || {};
  const blog = sortBlogByNewest(siteData.blog || []);
  const contactSec = siteData.contactSection || {};

  const resumeLink = convertGoogleDriveUrl(hero.resumeUrl || "");
  const hasStats = hero.projectsDone || hero.happyClients || hero.experienceYears;

  return (
    <main>
      {/* ═══ HERO ═══ */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div
          className="absolute top-1/4 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>
        <div
          className="absolute bottom-1/4 left-0 w-64 h-64 bg-zinc-200/50 dark:bg-zinc-800/30 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {hero.badgeText && (
                <p className="reveal text-sm font-medium text-accent tracking-widest uppercase mb-4">
                  {hero.badgeText}
                </p>
              )}
              <h1 className="reveal d1 font-display font-bold text-5xl md:text-6xl lg:text-7xl leading-[1.05] tracking-tight text-zinc-900 dark:text-white mb-6">
                {hero.titlePrefix ? `${hero.titlePrefix} ` : ""}
                <span className="text-accent">{hero.name || ""}</span>
              </h1>
              {hero.description && (
                <p className="reveal d2 text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-light leading-relaxed max-w-md mb-10">
                  {hero.description}
                </p>
              )}
              <div className="reveal d3 flex flex-wrap gap-4">
                <a
                  href="#work"
                  className="shimmer inline-flex items-center gap-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-medium px-7 py-3.5 rounded-full hover:bg-zinc-700 dark:hover:bg-zinc-200 transition-colors text-sm"
                >
                  {hero.workButtonText || "View Work"}
                  <ChevronDown className="w-4 h-4" />
                </a>

                {resumeLink && resumeLink !== "#" && (
                  <a
                    href={resumeLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium px-7 py-3.5 rounded-full hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors text-sm"
                  >
                    <FileText className="w-4 h-4 text-accent" />
                    Resume
                  </a>
                )}
              </div>

              {hasStats && (
                <div className="reveal d4 flex gap-8 mt-14 pt-8 border-t border-zinc-100 dark:border-zinc-900">
                  {hero.projectsDone && (
                    <div>
                      <p className="font-display font-bold text-3xl text-zinc-900 dark:text-white">
                        {hero.projectsDone}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Projects done</p>
                    </div>
                  )}
                  {hero.happyClients && (
                    <div>
                      <p className="font-display font-bold text-3xl text-zinc-900 dark:text-white">
                        {hero.happyClients}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Happy clients</p>
                    </div>
                  )}
                  {hero.experienceYears && (
                    <div>
                      <p className="font-display font-bold text-3xl text-zinc-900 dark:text-white">
                        {hero.experienceYears}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Experience</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="reveal d2 flex justify-center md:justify-end">
              <div className="relative w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="pf w-full h-full rounded-3xl overflow-hidden relative bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-lg">
                  {hero.profilePhoto ? (
                    <Image
                      src={hero.profilePhoto}
                      alt={hero.name || "Profile"}
                      fill
                      sizes="(max-width: 768px) 288px, 384px"
                      priority
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                      <div className="w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center text-accent text-3xl font-bold mb-3 shadow-inner">
                        {(hero.name ? hero.name.charAt(0).toUpperCase() : "P")}
                      </div>
                      <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        {hero.name || "Portfolio"}
                      </p>
                    </div>
                  )}
                </div>
                {hero.badgeText && (
                  <div className="absolute -bottom-4 -left-4 bg-accent text-white font-display font-bold text-sm px-4 py-2.5 rounded-2xl shadow-lg">
                    {hero.badgeText}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ WHAT I DO (SERVICES) ═══ */}
      <section id="services" className="py-24 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-14">
            <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
              {servicesSec.badgeText || "What I do"}
            </p>
            <h2 className="reveal d1 font-display font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white">
              {servicesSec.title || "What I Do"}
            </h2>
          </div>

          {services.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              <p className="text-sm">Belum ada item What I Do yang ditambahkan. Silakan tambahkan di Admin Dashboard.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service, idx) => {
                const IconComp = getServiceIconComponent(service.iconName, idx);
                return (
                  <article
                    key={service.id || idx}
                    className={`reveal d${(idx % 3) + 1} card-h group rounded-2xl p-8 border hover:border-accent ${
                      idx === 1
                        ? "bg-zinc-900 dark:bg-zinc-800 border-zinc-800 text-white"
                        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800"
                    }`}
                  >
                    <div className="w-12 h-12 flex items-center justify-center bg-accent-subtle rounded-xl mb-6 group-hover:bg-accent/20 transition-colors">
                      <IconComp className="w-6 h-6 text-accent" />
                    </div>
                    <h3
                      className={`font-display font-bold text-xl mb-3 ${
                        idx === 1 ? "text-white" : "text-zinc-900 dark:text-white"
                      }`}
                    >
                      {service.title}
                    </h3>
                    <p
                      className={`text-sm leading-relaxed ${
                        idx === 1 ? "text-zinc-400" : "text-zinc-500 dark:text-zinc-400"
                      }`}
                    >
                      {service.description}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══ WORK ═══ */}
      <section id="work" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
                {projectsSec.badgeText || "Portfolio"}
              </p>
              <h2 className="reveal d1 font-display font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white">
                {projectsSec.title || "Selected work"}
              </h2>
            </div>
            {projects.length > 0 && (
              <Link
                href="/projects"
                className="reveal d1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-accent transition-colors self-start sm:self-auto nl"
              >
                {projectsSec.viewAllText || "All projects →"}
              </Link>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-10 text-center text-zinc-400">
              <p className="text-sm">Belum ada portofolio proyek yang dipublikasikan. Tambahkan proyek karya Anda di Admin Dashboard.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {projects.slice(0, 3).map((project, idx) => (
                <article
                  key={project.id || idx}
                  className={`card-h reveal d${idx + 1} group rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-accent ${
                    idx === 0 ? "md:row-span-2" : ""
                  }`}
                >
                  <div className={`pf w-full relative bg-zinc-800/40 ${idx === 0 ? "h-64 md:h-80" : "h-48"}`}>
                    {project.image ? (
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority={idx === 0}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        No Project Image
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags?.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-accent-subtle text-accent border border-accent-subtle px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link href={`/case-study?id=${project.id}`}>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-zinc-900 dark:text-white mb-2">
                        {project.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-5">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
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
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ ABOUT ═══ */}
      <section id="about" className="py-24 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="reveal order-2 md:order-1">
              <div className="pf w-full aspect-square max-w-sm mx-auto rounded-3xl overflow-hidden relative bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shadow-md">
                {about.photo ? (
                  <Image
                    src={about.photo}
                    alt="About photo"
                    fill
                    sizes="384px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-400">
                    <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent text-2xl font-bold mb-2">
                      {hero.name ? hero.name.charAt(0).toUpperCase() : "A"}
                    </div>
                    <p className="text-xs text-zinc-500">{about.title || "About Me"}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
                {about.badgeText || "About"}
              </p>
              <h2 className="reveal d1 font-display font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white leading-tight mb-6">
                {about.title || "About Me"}
              </h2>
              {about.bioParagraph1 && (
                <p className="reveal d2 text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                  {about.bioParagraph1}
                </p>
              )}
              {about.bioParagraph2 && (
                <p className="reveal d3 text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
                  {about.bioParagraph2}
                </p>
              )}
              {about.stack && about.stack.length > 0 && (
                <div className="reveal d4">
                  <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-widest mb-3">
                    {about.stackTitle || "Stack & Tools"}
                  </p>
                  <div className="flex flex-wrap gap-2" role="list" aria-label="Skills">
                    {about.stack.map((skill) => (
                      <span
                        key={skill}
                        role="listitem"
                        className="stag text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-3.5 py-1.5 rounded-full hover:border-accent"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ BLOG PREVIEW ═══ */}
      <section id="blog" className="py-24 bg-zinc-50 dark:bg-zinc-900/40">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-14">
            <div>
              <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
                {blogSec.badgeText || "Blog"}
              </p>
              <h2 className="reveal d1 font-display font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white">
                {blogSec.title || "Latest Articles"}
              </h2>
            </div>
            {blog.length > 0 && (
              <Link
                href="/blog"
                className="reveal d1 text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-accent transition-colors self-start sm:self-auto nl"
              >
                {blogSec.viewAllText || "All articles →"}
              </Link>
            )}
          </div>

          {blog.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
              <p className="text-sm">Belum ada artikel blog yang dipublikasikan. Tulis artikel baru di Admin Dashboard.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {blog.slice(0, 3).map((article, idx) => (
                <article
                  key={article.id || idx}
                  className={`reveal d${idx + 1} card-h group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-accent`}
                >
                  <div className="pf w-full h-44 relative bg-zinc-800/40">
                    {article.image ? (
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs text-zinc-400">{article.date}</span>
                    </div>
                    <Link href={`/blog/article?id=${article.id}`}>
                      <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white mb-2 group-hover:text-accent transition-colors">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
                      {article.excerpt}
                    </p>
                    <Link
                      href={`/blog/article?id=${article.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white nl"
                    >
                      Read more &rarr;
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══ CONTACT ═══ */}
      <section id="contact" className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-zinc-900 dark:bg-zinc-800 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div
              className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-3xl pointer-events-none"
              aria-hidden="true"
            ></div>
            <div
              className="absolute bottom-0 left-0 w-40 h-40 bg-accent/10 rounded-full blur-2xl pointer-events-none"
              aria-hidden="true"
            ></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-start">
              <div>
                <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
                  {contactSec.badgeText || "Contact"}
                </p>
                <h2 className="reveal d1 font-display font-bold text-4xl md:text-5xl text-white leading-tight mb-5 whitespace-pre-line">
                  {contactSec.title || "Get in touch"}
                </h2>
                {contactSec.description && (
                  <p className="reveal d2 text-zinc-400 leading-relaxed mb-8">
                    {contactSec.description}
                  </p>
                )}

                <div className="reveal d3 flex flex-col gap-4">
                  {contactSec.email && (
                    <a
                      href={`mailto:${contactSec.email}`}
                      className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
                    >
                      <span className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-lg group-hover:bg-accent/20 transition-colors shrink-0">
                        <Mail className="w-4 h-4 text-accent" />
                      </span>
                      <span className="text-sm">{contactSec.email}</span>
                    </a>
                  )}
                  {siteData.footer?.linkedinUrl && (
                    <a
                      href={siteData.footer.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
                    >
                      <span className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-lg group-hover:bg-accent/20 transition-colors shrink-0">
                        <Linkedin className="w-4 h-4 text-accent" />
                      </span>
                      <span className="text-sm">LinkedIn Profile</span>
                    </a>
                  )}
                  {siteData.footer?.githubUrl && (
                    <a
                      href={siteData.footer.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-3 text-zinc-400 hover:text-white transition-colors"
                    >
                      <span className="w-9 h-9 flex items-center justify-center bg-zinc-800 rounded-lg group-hover:bg-accent/20 transition-colors shrink-0">
                        <Github className="w-4 h-4 text-accent" />
                      </span>
                      <span className="text-sm">GitHub Profile</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="reveal d2">
                {formSubmitted ? (
                  <div className="bg-zinc-800/90 p-8 rounded-2xl border border-zinc-700 text-center">
                    <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                    <h3 className="font-display text-2xl font-bold text-white mb-2">
                      Pesan Terkirim!
                    </h3>
                    <p className="text-zinc-400 text-sm">
                      Terima kasih telah menghubungi. Pesan Anda akan dibalas secepatnya.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {formError && (
                      <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}
                    <div>
                      <label htmlFor="name" className="block text-xs text-zinc-400 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs text-zinc-400 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-xs text-zinc-400 mb-1">
                        Message
                      </label>
                      <textarea
                        id="message"
                        rows={4}
                        required
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent transition-colors"
                        placeholder="Tell me about your message..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="shimmer bg-accent text-white font-medium text-sm py-3.5 px-6 rounded-xl hover:bg-accent-light transition-colors mt-2 disabled:opacity-50"
                    >
                      {isSubmitting
                        ? "Sending..."
                        : contactSec.buttonText || "Send Message \u2192"}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
