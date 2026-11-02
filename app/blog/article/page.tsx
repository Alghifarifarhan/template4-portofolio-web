"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, User, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { useSite } from "@/context/SiteContext";
import { BlogShareButtons } from "@/components/BlogShareButtons";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, addDoc } from "firebase/firestore";

interface BlogComment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

function BlogArticleContent() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");
  const { siteData } = useSite();
  const [progress, setProgress] = useState(0);

  // Comments state
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [commentName, setCommentName] = useState("");
  const [commentBody, setCommentBody] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentSuccess, setCommentSuccess] = useState(false);
  const [commentError, setCommentError] = useState("");

  const blogItems = siteData.blog || [];
  const selectedBlog = articleId
    ? blogItems.find((b) => b.id === articleId)
    : blogItems[0];

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

  const effectiveArticleId = selectedBlog?.id || articleId || "";

  // Listen to comments for this article in real-time
  useEffect(() => {
    if (!effectiveArticleId) return;
    try {
      const q = query(
        collection(db, "blogComments"),
        where("articleId", "==", effectiveArticleId)
      );
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loaded: BlogComment[] = [];
          snapshot.forEach((doc) => {
            loaded.push({ id: doc.id, ...doc.data() } as BlogComment);
          });
          // Sort comments newest first in memory
          loaded.sort((a, b) => {
            const timeA = new Date(a.createdAt).getTime();
            const timeB = new Date(b.createdAt).getTime();
            return timeB - timeA;
          });
          setComments(loaded);
        },
        (err) => {
          console.error("Error loading blog comments:", err);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.error(e);
    }
  }, [effectiveArticleId]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentBody.trim()) {
      setCommentError("Mohon lengkapi nama dan komentar Anda.");
      return;
    }
    setSubmittingComment(true);
    setCommentError("");
    setCommentSuccess(false);

    try {
      await addDoc(collection(db, "blogComments"), {
        articleId: effectiveArticleId,
        authorName: commentName.trim(),
        content: commentBody.trim(),
        createdAt: new Date().toISOString(),
      });
      setCommentName("");
      setCommentBody("");
      setCommentSuccess(true);
      setTimeout(() => setCommentSuccess(false), 4000);
    } catch (err: any) {
      console.error(err);
      setCommentError("Gagal mengirim komentar. Silakan coba lagi.");
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!selectedBlog || !selectedBlog.id) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-20 text-center">
        <h1 className="font-display font-bold text-3xl text-zinc-900 dark:text-white mb-4">
          Artikel Tidak Ditemukan
        </h1>
        <p className="text-zinc-500 text-sm mb-8">
          Artikel blog yang Anda cari tidak tersedia atau belum dipublikasikan.
        </p>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 bg-accent text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-accent-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar Blog
        </Link>
      </div>
    );
  }

  const ad = selectedBlog.articleDetail || {};
  const title = ad.title || selectedBlog.title || "Blog Article";
  const subtitle = ad.subtitle || selectedBlog.excerpt || "";
  const date = ad.date || selectedBlog.date || "";
  const readTime = ad.readTime || "3 min read";
  const heroPhoto = ad.heroImage || selectedBlog.image;
  const authorName = ad.authorName || siteData.hero?.name || "Penulis";
  const authorRole = ad.authorRole || siteData.hero?.description?.slice(0, 50) || "Author";

  // Dynamic Open Graph & Twitter Card meta injection for social media sharing crawlers
  useEffect(() => {
    if (!selectedBlog) return;
    const metaTitle = title;
    const metaDesc = subtitle || selectedBlog.excerpt || "";
    const metaImage = heroPhoto || "";
    const metaUrl = typeof window !== "undefined" ? window.location.href : "";

    document.title = `${metaTitle} — ${siteData.hero?.name || "Blog"}`;

    const updateOrCreateMeta = (property: string, content: string, isName = false) => {
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        if (isName) {
          el.setAttribute("name", property);
        } else {
          el.setAttribute("property", property);
        }
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    if (metaTitle) {
      updateOrCreateMeta("og:title", metaTitle);
      updateOrCreateMeta("twitter:title", metaTitle, true);
    }
    if (metaDesc) {
      updateOrCreateMeta("og:description", metaDesc);
      updateOrCreateMeta("twitter:description", metaDesc, true);
      updateOrCreateMeta("description", metaDesc, true);
    }
    if (metaImage) {
      updateOrCreateMeta("og:image", metaImage);
      updateOrCreateMeta("twitter:image", metaImage, true);
    }
    if (metaUrl) {
      updateOrCreateMeta("og:url", metaUrl);
    }
    updateOrCreateMeta("og:type", "article");
    updateOrCreateMeta("twitter:card", "summary_large_image", true);
  }, [selectedBlog, title, subtitle, heroPhoto, siteData.hero?.name]);

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

      {/* ARTICLE HEADER */}
      <header className="max-w-3xl mx-auto px-6 pt-4 pb-12">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 hover:text-accent transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to blog
          </Link>
          <BlogShareButtons
            title={title}
            excerpt={subtitle}
            image={heroPhoto}
            articleId={selectedBlog.id}
            compact={true}
          />
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-xs text-zinc-400">
            {date} &middot; {readTime}
          </span>
        </div>

        <h1 className="font-display font-bold text-4xl md:text-5xl text-zinc-900 dark:text-white leading-tight mb-6">
          {title}
        </h1>

        <p className="text-xl text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
          {subtitle}
        </p>

        {/* Author info with Anonymous Avatar & Quick Share */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6 border-t border-b border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full shrink-0 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 shadow-sm">
              <User className="w-6 h-6" />
            </div>
            <div>
              <p className="font-medium text-zinc-900 dark:text-white text-sm">
                {authorName}
              </p>
              <p className="text-xs text-zinc-500">{authorRole}</p>
            </div>
          </div>
          <BlogShareButtons
            title={title}
            excerpt={subtitle}
            image={heroPhoto}
            articleId={selectedBlog.id}
            compact={true}
          />
        </div>
      </header>

      {/* HERO IMAGE */}
      <div className="max-w-4xl mx-auto px-6 mb-12">
        <div className="pf w-full h-72 md:h-96 rounded-2xl relative overflow-hidden">
          {heroPhoto && (
            <Image
              src={heroPhoto}
              alt={title}
              fill
              sizes="(max-width: 1200px) 100vw, 1200px"
              priority
              className="object-cover"
            />
          )}
        </div>
      </div>

      {/* ARTICLE CONTENT WITH CLEAR PARAGRAPH SPACING */}
      <div className="max-w-3xl mx-auto px-6 pb-16 prose-article">
        {ad.paragraphs && ad.paragraphs.length > 0 ? (
          ad.paragraphs.map((p, index) => (
            <React.Fragment key={index}>
              <p className="mb-6 text-zinc-700 dark:text-zinc-300 text-base md:text-lg leading-relaxed">{p}</p>
              {index === 0 && ad.quoteText && (
                <blockquote className="my-8 pl-4 border-l-2 border-accent italic text-zinc-600 dark:text-zinc-300 text-lg">
                  <p className="mb-0">{ad.quoteText}</p>
                </blockquote>
              )}
            </React.Fragment>
          ))
        ) : (
          <p className="mb-6 text-zinc-700 dark:text-zinc-300 text-base md:text-lg leading-relaxed">{subtitle}</p>
        )}

        <hr className="my-8 border-zinc-200 dark:border-zinc-800" />
        
        {/* SOCIAL MEDIA SHARE SECTION WITH PREVIEW */}
        <BlogShareButtons
          title={title}
          excerpt={subtitle}
          image={heroPhoto}
          articleId={selectedBlog.id}
          compact={false}
          showPreviewByDefault={true}
        />
      </div>

      {/* PUBLIC COMMENTS SECTION */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-12">
          <div className="flex items-center gap-2.5 mb-8">
            <MessageSquare className="w-5 h-5 text-accent" />
            <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white">
              Komentar ({comments.length})
            </h2>
          </div>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-6 mb-10 space-y-4">
            <h3 className="font-semibold text-sm text-zinc-900 dark:text-white">Tinggalkan Komentar</h3>

            {commentSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Komentar Anda berhasil dipublikasikan!</span>
              </div>
            )}

            {commentError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{commentError}</span>
              </div>
            )}

            <div>
              <label htmlFor="commentName" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Nama Anda <span className="text-accent">*</span>
              </label>
              <input
                id="commentName"
                type="text"
                required
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Masukkan nama Anda"
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              />
            </div>

            <div>
              <label htmlFor="commentBody" className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Pesan Komentar <span className="text-accent">*</span>
              </label>
              <textarea
                id="commentBody"
                rows={3}
                required
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Tuliskan komentar atau tanggapan Anda..."
                className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent"
              ></textarea>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingComment}
                className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submittingComment ? "Mengirim..." : "Kirim Komentar"}
              </button>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-6">
                Belum ada komentar pada artikel ini. Jadilah yang pertama berkomentar!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className="bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-zinc-800/80 rounded-2xl p-4 sm:p-5 space-y-2 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                      {c.authorName ? c.authorName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-zinc-900 dark:text-white">
                        {c.authorName}
                      </h4>
                      <p className="text-[11px] text-zinc-400">
                        {c.createdAt ? new Date(c.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        }) : ""}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 pl-11 leading-relaxed whitespace-pre-wrap">
                    {c.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* RELATED ARTICLES */}
      <section className="bg-zinc-50 dark:bg-zinc-900/50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display font-bold text-2xl text-zinc-900 dark:text-white mb-8">
            More from the blog
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {blogItems
              .filter((item) => item.id !== selectedBlog.id)
              .slice(0, 3)
              .map((item, idx) => (
                <article
                  key={item.id || idx}
                  className="card group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-colors"
                >
                  <div className="pf w-full h-40 relative">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-xs text-zinc-400 mb-2 block">
                      {item.date}
                    </span>
                    <Link href={`/blog/article?id=${item.id}`}>
                      <h3 className="font-display font-bold text-base text-zinc-900 dark:text-white mb-2 group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <Link href={`/blog/article?id=${item.id}`} className="text-sm font-medium text-accent nav-link">
                      Read &rarr;
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        </div>
      </section>
    </article>
  );
}

export default function BlogArticlePage() {
  return (
    <main className="pt-28 pb-24">
      <Suspense fallback={<div className="max-w-3xl mx-auto px-6 text-zinc-400">Loading article...</div>}>
        <BlogArticleContent />
      </Suspense>
    </main>
  );
}
