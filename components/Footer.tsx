"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSite } from "@/context/SiteContext";

export function Footer() {
  const { siteData } = useSite();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const rawPrefix = siteData.header?.brandPrefix;
  const rawSuffix = siteData.header?.brandSuffix;
  const hasCustomBrand = (rawPrefix !== undefined && rawPrefix !== "") || (rawSuffix !== undefined && rawSuffix !== "");
  
  const brandPrefix = hasCustomBrand ? (rawPrefix || "") : (siteData.hero?.name || "");
  const brandSuffix = hasCustomBrand ? (rawSuffix || "") : "";
  const hasBrand = Boolean(brandPrefix.trim() || brandSuffix.trim());
  const brandTitle = `${brandPrefix}${brandSuffix}`.trim() || siteData.hero?.name || "";

  const footerData = siteData.footer || {};
  const currentYear = new Date().getFullYear();

  // Active social links only (ignore empty string or dummy root urls if user cleared them)
  const hasTwitter = Boolean(footerData.twitterUrl && footerData.twitterUrl.trim() !== "" && footerData.twitterUrl !== "https://twitter.com");
  const hasGithub = Boolean(footerData.githubUrl && footerData.githubUrl.trim() !== "" && footerData.githubUrl !== "https://github.com");
  const hasLinkedin = Boolean(footerData.linkedinUrl && footerData.linkedinUrl.trim() !== "" && footerData.linkedinUrl !== "https://linkedin.com");
  const hasInstagram = Boolean(footerData.instagramUrl && footerData.instagramUrl.trim() !== "" && footerData.instagramUrl !== "https://instagram.com");

  return (
    <footer className="border-t border-zinc-100 dark:border-zinc-900 bg-white dark:bg-zinc-950">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        {hasBrand ? (
          <Link href="/" className="font-display font-bold text-lg tracking-tight" aria-label={brandTitle}>
            <span className="text-zinc-900 dark:text-white">{brandPrefix}</span>
            <span className="text-accent">{brandSuffix}</span>
          </Link>
        ) : (
          <div />
        )}

        <p className="text-xs text-zinc-400 text-center sm:text-left">
          &copy; {currentYear} {brandTitle ? `${brandTitle}. ` : ""}All rights reserved. Developed by{" "}
          <a
            href="https://lbegey78.gumroad.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors underline underline-offset-2"
          >
            Laurent Begey
          </a>{" "}
          &bull; Distributed by{" "}
          <a
            href="https://themewagon.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-accent transition-colors underline underline-offset-2"
          >
            ThemeWagon
          </a>
        </p>

        <div className="flex items-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          {hasTwitter && (
            <a
              href={footerData.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Twitter
            </a>
          )}
          {hasGithub && (
            <a
              href={footerData.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              GitHub
            </a>
          )}
          {hasLinkedin && (
            <a
              href={footerData.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              LinkedIn
            </a>
          )}
          {hasInstagram && (
            <a
              href={footerData.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent transition-colors"
            >
              Instagram
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
