"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Share2,
  Copy,
  Check,
  Eye,
  ExternalLink,
  MessageCircle,
} from "lucide-react";

// Custom SVG Icons for popular social media
function WhatsAppIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function TwitterXIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function LinkedInIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.78a1.6 1.6 0 0 0-1.6 1.6 1.6 1.6 0 0 0 1.6 1.6 1.6 1.6 0 0 0 1.6-1.6 1.6 1.6 0 0 0-1.6-1.6z" />
    </svg>
  );
}

function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export interface BlogShareProps {
  title: string;
  excerpt: string;
  image?: string;
  articleId?: string;
  url?: string;
  compact?: boolean;
  showPreviewByDefault?: boolean;
}

export function BlogShareButtons({
  title,
  excerpt,
  image,
  articleId,
  url,
  compact = false,
  showPreviewByDefault = false,
}: BlogShareProps) {
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(showPreviewByDefault);
  const [canNativeShare, setCanNativeShare] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      let finalUrl = url || window.location.href;
      if (articleId && !finalUrl.includes(`id=${articleId}`)) {
        const origin = window.location.origin;
        finalUrl = `${origin}/blog/article?id=${articleId}`;
      }
      setCurrentUrl(finalUrl);
      setCanNativeShare(typeof navigator !== "undefined" && Boolean(navigator.share));
    }
  }, [url, articleId]);

  // Clean formatted share strings
  const shareTitle = title || "Artikel Blog";
  const shareExcerpt = excerpt || "Baca artikel selengkapnya di website portofolio.";
  const shareUrl = currentUrl || (typeof window !== "undefined" ? window.location.href : "");

  // Formatted combined text for instant messaging
  const fullShareMessage = `${shareTitle}\n\n${shareExcerpt}\n\n🔗 ${shareUrl}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error("Gagal menyalin link:", err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareExcerpt,
          url: shareUrl,
        });
      } catch (err) {
        // User aborted share or share failed
      }
    }
  };

  const shareLinks = [
    {
      name: "WhatsApp",
      icon: WhatsAppIcon,
      color: "hover:bg-emerald-600 hover:text-white bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      href: `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareMessage)}`,
    },
    {
      name: "X (Twitter)",
      icon: TwitterXIcon,
      color: "hover:bg-zinc-800 hover:text-white bg-zinc-800/40 text-zinc-300 border-zinc-700",
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareTitle + "\n" + shareExcerpt)}&url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: "Telegram",
      icon: TelegramIcon,
      color: "hover:bg-sky-500 hover:text-white bg-sky-500/10 text-sky-400 border-sky-500/30",
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle + "\n\n" + shareExcerpt)}`,
    },
    {
      name: "Facebook",
      icon: FacebookIcon,
      color: "hover:bg-blue-600 hover:text-white bg-blue-600/10 text-blue-500 border-blue-500/30",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareTitle + " - " + shareExcerpt)}`,
    },
    {
      name: "LinkedIn",
      icon: LinkedInIcon,
      color: "hover:bg-blue-700 hover:text-white bg-blue-700/10 text-blue-400 border-blue-700/30",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-accent hover:bg-accent/10 border border-zinc-200 dark:border-zinc-700 transition-colors"
            title="Bagikan artikel"
          >
            <Share2 className="w-3.5 h-3.5" />
          </button>
        )}
        <a
          href={shareLinks[0].href}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 transition-colors"
          title="Share ke WhatsApp"
        >
          <WhatsAppIcon className="w-3.5 h-3.5" />
        </a>
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-accent hover:bg-accent/10 border border-zinc-200 dark:border-zinc-700 transition-colors relative"
          title="Salin Link"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
        {copied && (
          <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-md animate-fadeIn">
            Disalin!
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 sm:p-6 my-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-200/60 dark:border-zinc-800/60">
        <div>
          <h3 className="font-display font-bold text-base sm:text-lg text-zinc-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-4 h-4 text-accent" />
            Bagikan Artikel Ini
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Share ke media sosial dengan tampilan gambar, judul, dan ringkasan lengkap.
          </p>
        </div>

        {/* Toggle Social Preview Button */}
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors self-start sm:self-auto ${
            showPreview
              ? "bg-accent/10 border-accent/30 text-accent"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          {showPreview ? "Sembunyikan Pratinjau" : "Lihat Pratinjau Share"}
        </button>
      </div>

      {/* Social Media Share Buttons Grid */}
      <div className="flex flex-wrap items-center gap-2.5">
        {canNativeShare && (
          <button
            type="button"
            onClick={handleNativeShare}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            Share (Bawaan HP/Browser)
          </button>
        )}

        {shareLinks.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${item.color}`}
              title={`Share ke ${item.name}`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </a>
          );
        })}

        {/* Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-xl border transition-all ${
            copied
              ? "bg-emerald-500 text-white border-emerald-500"
              : "bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-accent hover:text-accent"
          }`}
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              <span>Link Berhasil Disalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Salin Tautan</span>
            </>
          )}
        </button>
      </div>

      {/* Social Share Preview Card (Simulasi tampilan preview di WhatsApp / Sosmed) */}
      {showPreview && (
        <div className="pt-2 animate-fadeIn">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-2">
            <MessageCircle className="w-3.5 h-3.5 text-accent" />
            <span>Pratinjau Kartu Tampilan Media Sosial:</span>
          </div>

          <div className="max-w-md mx-auto sm:mx-0 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-md">
            {/* Image Preview */}
            <div className="relative w-full h-44 bg-zinc-800/40">
              {image ? (
                <Image
                  src={image}
                  alt={title}
                  fill
                  sizes="(max-width: 768px) 100vw, 400px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                  Gambar Thumbnail Blog
                </div>
              )}
            </div>

            {/* Content Preview */}
            <div className="p-4 space-y-1.5">
              <p className="text-[11px] font-medium text-accent uppercase tracking-wider">
                {typeof window !== "undefined" ? window.location.hostname : "portfolio.dev"}
              </p>
              <h4 className="font-display font-bold text-sm text-zinc-900 dark:text-white line-clamp-2 leading-snug">
                {title}
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {excerpt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
