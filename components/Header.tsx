"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { useSite } from "@/context/SiteContext";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const pathname = usePathname();
  const { siteData } = useSite();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const rawPrefix = siteData.header?.brandPrefix;
  const rawSuffix = siteData.header?.brandSuffix;
  const hasCustomBrand = (rawPrefix !== undefined && rawPrefix !== "") || (rawSuffix !== undefined && rawSuffix !== "");
  
  const brandPrefix = hasCustomBrand ? (rawPrefix || "") : (siteData.hero?.name || "");
  const brandSuffix = hasCustomBrand ? (rawSuffix || "") : "";
  const hasBrand = Boolean(brandPrefix.trim() || brandSuffix.trim());
  
  const navServices = siteData.header?.navServices || "";
  const navWork = siteData.header?.navWork || "";
  const navAbout = siteData.header?.navAbout || "";
  const navBlog = siteData.header?.navBlog || "";
  const navContact = siteData.header?.navContact || "";
  const hireMeButton = siteData.header?.hireMeButton || "";

  const hasAnyNavLinks = Boolean(
    navServices.trim() ||
    navWork.trim() ||
    navAbout.trim() ||
    navBlog.trim() ||
    navContact.trim() ||
    hireMeButton.trim()
  );

  const brandTitle = `${brandPrefix}${brandSuffix}`.trim() || siteData.hero?.name || "";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md shadow-sm shadow-black/5"
          : "bg-transparent"
      }`}
    >
      <nav
        className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between"
        aria-label="Main navigation"
      >
        {hasBrand ? (
          <Link
            href="/"
            className="font-display font-bold text-xl tracking-tight z-10"
            aria-label={brandTitle}
          >
            <span className="text-zinc-900 dark:text-white">{brandPrefix}</span>
            <span className="text-accent">{brandSuffix}</span>
          </Link>
        ) : (
          <div className="z-10" />
        )}

        {hasAnyNavLinks && (
          <ul className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navServices.trim() !== "" && (
              <li>
                <Link
                  href="/#services"
                  className={`nl transition-colors ${
                    isActive("/#services")
                      ? "on text-zinc-900 dark:text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {navServices}
                </Link>
              </li>
            )}
            {navWork.trim() !== "" && (
              <li>
                <Link
                  href="/projects"
                  className={`nl transition-colors ${
                    isActive("/projects") || isActive("/case-study")
                      ? "on text-accent font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {navWork}
                </Link>
              </li>
            )}
            {navAbout.trim() !== "" && (
              <li>
                <Link
                  href="/#about"
                  className={`nl transition-colors ${
                    isActive("/#about")
                      ? "on text-zinc-900 dark:text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {navAbout}
                </Link>
              </li>
            )}
            {navBlog.trim() !== "" && (
              <li>
                <Link
                  href="/blog"
                  className={`nl transition-colors ${
                    isActive("/blog")
                      ? "on text-accent font-semibold"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {navBlog}
                </Link>
              </li>
            )}
            {navContact.trim() !== "" && (
              <li>
                <Link
                  href="/#contact"
                  className={`nl transition-colors ${
                    isActive("/#contact")
                      ? "on text-zinc-900 dark:text-white"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                  }`}
                >
                  {navContact}
                </Link>
              </li>
            )}
          </ul>
        )}

        <div className="flex items-center gap-3">
          {hireMeButton.trim() !== "" && (
            <Link
              href="/#contact"
              className="hidden md:inline-flex items-center gap-2 btn-primary bg-accent text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-accent-light transition-colors"
            >
              {hireMeButton} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}

          {hasAnyNavLinks && (
            <button
              onClick={() => setMobileMenu(!mobileMenu)}
              className="md:hidden relative w-9 h-9 flex items-center justify-center rounded-full border border-zinc-200/80 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 active:scale-90 active:rotate-12 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent/40"
              aria-label="Toggle menu"
              aria-expanded={mobileMenu}
            >
              <div
                className={`relative w-4 h-4 flex items-center justify-center transition-transform duration-300 ease-out ${
                  mobileMenu ? "rotate-90" : "rotate-0"
                }`}
              >
                <Menu
                  className={`absolute w-4 h-4 transition-all duration-300 ease-out ${
                    mobileMenu
                      ? "opacity-0 scale-50 rotate-45"
                      : "opacity-100 scale-100 rotate-0"
                  }`}
                />
                <X
                  className={`absolute w-4 h-4 transition-all duration-300 ease-out ${
                    mobileMenu
                      ? "opacity-100 scale-100 rotate-0"
                      : "opacity-0 scale-50 -rotate-45"
                  }`}
                />
              </div>
            </button>
          )}
        </div>
      </nav>

      {hasAnyNavLinks && (
        <div
          className={`mobile-menu-container md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-b border-zinc-200/60 dark:border-zinc-800/60 shadow-lg ${
            mobileMenu ? "open" : ""
          }`}
        >
          <div className="mobile-menu-inner">
            <ul className="flex flex-col px-6 py-4 gap-2 text-sm font-medium">
              {navServices.trim() !== "" && (
                <li className="mobile-nav-item">
                  <Link
                    href="/#services"
                    onClick={() => setMobileMenu(false)}
                    className={`block py-2.5 px-3 rounded-lg transition-colors ${
                      isActive("/#services")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {navServices}
                  </Link>
                </li>
              )}
              {navWork.trim() !== "" && (
                <li className="mobile-nav-item">
                  <Link
                    href="/projects"
                    onClick={() => setMobileMenu(false)}
                    className={`block py-2.5 px-3 rounded-lg transition-colors ${
                      isActive("/projects") || isActive("/case-study")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {navWork}
                  </Link>
                </li>
              )}
              {navAbout.trim() !== "" && (
                <li className="mobile-nav-item">
                  <Link
                    href="/#about"
                    onClick={() => setMobileMenu(false)}
                    className={`block py-2.5 px-3 rounded-lg transition-colors ${
                      isActive("/#about")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {navAbout}
                  </Link>
                </li>
              )}
              {navBlog.trim() !== "" && (
                <li className="mobile-nav-item">
                  <Link
                    href="/blog"
                    onClick={() => setMobileMenu(false)}
                    className={`block py-2.5 px-3 rounded-lg transition-colors ${
                      isActive("/blog")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {navBlog}
                  </Link>
                </li>
              )}
              {navContact.trim() !== "" && (
                <li className="mobile-nav-item">
                  <Link
                    href="/#contact"
                    onClick={() => setMobileMenu(false)}
                    className={`block py-2.5 px-3 rounded-lg transition-colors ${
                      isActive("/#contact")
                        ? "bg-accent/10 text-accent font-semibold"
                        : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {navContact}
                  </Link>
                </li>
              )}
              {hireMeButton.trim() !== "" && (
                <li className="mobile-nav-item pt-2 border-t border-zinc-100 dark:border-zinc-900/80">
                  <Link
                    href="/#contact"
                    onClick={() => setMobileMenu(false)}
                    className="flex items-center justify-center gap-2 btn-primary bg-accent text-white text-sm font-medium py-2.5 px-5 rounded-full hover:bg-accent-light transition-colors w-full shadow-xs"
                  >
                    {hireMeButton} <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
