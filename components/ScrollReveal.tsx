"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "@/context/SiteContext";

export function ScrollReveal() {
  const pathname = usePathname();
  const { siteData, loading } = useSite();

  useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const observeElements = () => {
      const elements = document.querySelectorAll(".reveal:not(.visible)");

      if (elements.length === 0) return;

      if (!("IntersectionObserver" in window)) {
        elements.forEach((el) => {
          el.classList.add("visible", "in");
        });
        return;
      }

      if (!observer) {
        const observerCallback: IntersectionObserverCallback = (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible", "in");
              observer?.unobserve(entry.target);
            }
          });
        };

        observer = new IntersectionObserver(observerCallback, {
          threshold: 0.02,
          rootMargin: "80px 0px 80px 0px",
        });
      }

      elements.forEach((el) => {
        // If element is already visible or in view, reveal it immediately
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("visible", "in");
        } else {
          observer?.observe(el);
        }
      });
    };

    // Run observation immediately and with debounced intervals for hydration/render safety
    observeElements();
    const t1 = setTimeout(observeElements, 50);
    const t2 = setTimeout(observeElements, 250);
    const t3 = setTimeout(observeElements, 700);

    // Watch for DOM mutations (e.g. when Firestore data populates new elements)
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(() => {
        observeElements();
      });
      mutationObserver.observe(document.body, {
        childList: true,
        subtree: true,
      });
    }

    // Scroll and resize listeners as secondary trigger
    const handleScrollOrResize = () => {
      observeElements();
    };
    window.addEventListener("scroll", handleScrollOrResize, { passive: true });
    window.addEventListener("resize", handleScrollOrResize, { passive: true });

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      if (observer) observer.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      window.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [pathname, loading, siteData]);

  return null;
}

