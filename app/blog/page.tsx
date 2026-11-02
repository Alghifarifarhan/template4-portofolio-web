"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useSite, sortBlogByNewest } from "@/context/SiteContext";
import { BlogShareButtons } from "@/components/BlogShareButtons";

export default function BlogPage() {
  const { siteData } = useSite();
  const [currentPage, setCurrentPage] = useState<number>(1);

  const blogSec = siteData.blogSection || {};
  const articles = sortBlogByNewest(siteData.blog || []);
  const itemsPerPage = 3;

  const totalPages = Math.max(1, Math.ceil(articles.length / itemsPerPage));
  const paginatedArticles = articles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const featuredArticle = articles[0] || {};

  return (
    <main className="pt-36 pb-24">
      {/* HERO BLOG */}
      <section className="relative overflow-hidden mb-16">
        <div
          className="absolute top-0 right-0 w-80 h-80 bg-accent/10 rounded-full blur-3xl pointer-events-none"
          aria-hidden="true"
        ></div>
        <div className="max-w-6xl mx-auto px-6 relative z-10">
          <p className="reveal text-xs font-medium text-accent tracking-widest uppercase mb-3">
            {blogSec.pageBadgeText || "Writing"}
          </p>
          <h1 className="reveal reveal-delay-1 font-display font-bold text-5xl md:text-6xl text-zinc-900 dark:text-white leading-tight mb-4">
            {blogSec.pageTitle || "The Blog"}
          </h1>
          {blogSec.pageSubtitle && (
            <p className="reveal reveal-delay-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl leading-relaxed">
              {blogSec.pageSubtitle}
            </p>
          )}
        </div>
      </section>

      {/* FEATURED ARTICLE */}
      {featuredArticle.id && (
        <section className="pb-16">
          <div className="max-w-6xl mx-auto px-6">
            <Link
              href={`/blog/article?id=${featuredArticle.id}`}
              className="reveal group block rounded-3xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 hover:border-accent transition-colors"
            >
              <div className="grid md:grid-cols-2">
                <div className="pf h-64 md:h-auto relative">
                  {featuredArticle.image && (
                    <Image
                      src={featuredArticle.image}
                      alt={featuredArticle.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="p-8 md:p-12 flex flex-col justify-center">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-xs text-zinc-400">{featuredArticle.date}</span>
                    <BlogShareButtons
                      title={featuredArticle.title}
                      excerpt={featuredArticle.excerpt}
                      image={featuredArticle.image}
                      articleId={featuredArticle.id}
                      compact={true}
                    />
                  </div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-zinc-900 dark:text-white mb-4 group-hover:text-accent transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6">
                    {featuredArticle.excerpt}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-accent nav-link">
                    Read article &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ARTICLES GRID */}
      <section>
        <div className="max-w-6xl mx-auto px-6">
          {articles.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center text-zinc-400 max-w-2xl mx-auto">
              <p className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                Belum ada artikel blog yang dipublikasikan
              </p>
              <p className="text-xs text-zinc-500">
                Silakan tulis dan publikasikan artikel Anda melalui Admin Dashboard.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {paginatedArticles.map((article, index) => (
                <article
                  key={article.id || index}
                  className="card group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-100 dark:border-zinc-800 hover:border-accent flex flex-col justify-between"
                >
                  <div>
                    <div className="pf w-full h-44 relative bg-zinc-800/40">
                      {article.image ? (
                        <Image
                          src={article.image}
                          alt={article.title}
                          fill
                          priority={index < 3}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                          No Article Image
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
                    </div>
                  </div>
                  <div className="p-6 pt-0 flex items-center justify-between gap-2">
                    <Link
                      href={`/blog/article?id=${article.id}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 dark:text-white nl"
                    >
                      Read more &rarr;
                    </Link>
                    <BlogShareButtons
                      title={article.title}
                      excerpt={article.excerpt}
                      image={article.image}
                      articleId={article.id}
                      compact={true}
                    />
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Interactive Pagination */}
          {totalPages > 1 && (
            <nav className="reveal flex items-center justify-center gap-2 mt-14" aria-label="Pagination">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-accent hover:text-accent transition-colors text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? "bg-accent text-white"
                      : "border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-accent hover:text-accent"
                  }`}
                >
                  {pageNum}
                </button>
              ))}

              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-accent hover:text-accent transition-colors text-sm"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </nav>
          )}
        </div>
      </section>
    </main>
  );
}
