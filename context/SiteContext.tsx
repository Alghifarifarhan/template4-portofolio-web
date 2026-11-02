"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { convertGoogleDriveUrl } from "@/lib/drive-helper";

export interface CaseStudyData {
  title?: string;
  subtitle?: string;
  categoryTag?: string;
  timeline?: string;
  client?: string;
  role?: string;
  deliverables?: string;
  heroImage?: string;
  projectUrl?: string;
  stats?: { value: string; label: string }[];
  briefTitle?: string;
  briefContent1?: string;
  briefContent2?: string;
  briefQuote?: string;
  discoveryTitle?: string;
  interviewsText?: string;
  userInterviewPoints?: string[];
  heuristicAuditText?: string;
  auditImage?: string;
  auditCaption?: string;
  solutionTitle?: string;
  solutionContent?: string;
}

export interface ArticleDetailData {
  title?: string;
  subtitle?: string;
  category?: string;
  date?: string;
  readTime?: string;
  authorName?: string;
  authorRole?: string;
  authorAvatar?: string;
  heroImage?: string;
  quoteText?: string;
  paragraphs?: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  tags: string[];
  description: string;
  image: string;
  projectUrl?: string;
  createdAt?: string;
  caseStudy?: CaseStudyData;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName?: string;
  createdAt?: string;
}

export interface BlogItem {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  date: string;
  createdAt?: string;
  excerpt: string;
  image: string;
  articleDetail?: ArticleDetailData;
}

export function sortBlogByNewest(articles: BlogItem[]): BlogItem[] {
  if (!articles || !Array.isArray(articles)) return [];
  return [...articles].sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : NaN;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : NaN;
    if (!isNaN(timeA) && !isNaN(timeB)) return timeB - timeA;

    const parsedA = Date.parse(a.date);
    const parsedB = Date.parse(b.date);
    if (!isNaN(parsedA) && !isNaN(parsedB)) return parsedB - parsedA;

    if (a.id?.startsWith("b_") && b.id?.startsWith("b_")) {
      const idA = Number(a.id.replace("b_", ""));
      const idB = Number(b.id.replace("b_", ""));
      if (!isNaN(idA) && !isNaN(idB)) return idB - idA;
    }
    return 0;
  });
}

export interface SiteData {
  accentColor: string;
  themeMode: "dark" | "light";
  header: {
    brandPrefix: string;
    brandSuffix: string;
    navServices: string;
    navWork: string;
    navAbout: string;
    navBlog: string;
    navContact: string;
    hireMeButton: string;
  };
  hero: {
    badgeText: string;
    titlePrefix: string;
    name: string;
    description: string;
    workButtonText?: string;
    projectsDone?: string;
    happyClients?: string;
    experienceYears?: string;
    profilePhoto: string;
    resumeUrl: string;
  };
  servicesSection: {
    badgeText: string;
    title: string;
  };
  services: ServiceItem[];
  projectsSection: {
    badgeText: string;
    title: string;
    viewAllText: string;
    pageBadgeText?: string;
    pageTitle?: string;
    pageSubtitle?: string;
  };
  projects: ProjectItem[];
  about: {
    badgeText: string;
    title: string;
    bioParagraph1: string;
    bioParagraph2: string;
    stackTitle?: string;
    stack: string[];
    photo: string;
  };
  blogSection: {
    badgeText: string;
    title: string;
    viewAllText: string;
    pageBadgeText?: string;
    pageTitle?: string;
    pageSubtitle?: string;
  };
  blog: BlogItem[];
  contactSection: {
    badgeText: string;
    title: string;
    description: string;
    email: string;
    buttonText: string;
  };
  footer: {
    copyrightText: string;
    formspreeUrl: string;
    twitterUrl: string;
    githubUrl: string;
    linkedinUrl: string;
    instagramUrl: string;
  };
}

export interface SiteStats {
  totalVisits: number;
  todayVisits: number;
  lastVisitedAt?: string;
}

export const sampleTemplateData: SiteData = {
  accentColor: "#FFFFFF",
  themeMode: "dark",
  header: {
    brandPrefix: "eli",
    brandSuffix: "ott",
    navServices: "What I Do",
    navWork: "Work",
    navAbout: "About",
    navBlog: "Blog",
    navContact: "Contact",
    hireMeButton: "Hire me",
  },
  hero: {
    badgeText: "Available for work",
    titlePrefix: "Hi, I'm",
    name: "Eliott",
    description:
      "Freelance UI/UX Designer & Frontend Developer. I design and build digital products that people love to use — fast, clean, and accessible.",
    workButtonText: "View my work",
    projectsDone: "34+",
    happyClients: "21+",
    experienceYears: "5y",
    profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80",
    resumeUrl: "https://drive.google.com",
  },
  servicesSection: {
    badgeText: "What I do",
    title: "What I Do",
  },
  services: [
    {
      id: "s1",
      title: "UI/UX Design",
      description: "User research, wireframing, interactive prototyping, and design systems.",
      iconName: "Layout",
    },
    {
      id: "s2",
      title: "Frontend Development",
      description: "Building fast, responsive web apps with React, Next.js, and TypeScript.",
      iconName: "Code",
    },
    {
      id: "s3",
      title: "Product Refresh",
      description: "Audit and redesign existing products to boost conversion and usability.",
      iconName: "Sparkles",
    },
  ],
  projectsSection: {
    badgeText: "Portfolio",
    title: "Selected work",
    viewAllText: "All projects →",
    pageTitle: "All Projects",
    pageSubtitle: "A complete look at my work across UI/UX design, frontend development, and product design.",
  },
  projects: [
    {
      id: "finlo",
      title: "Finlo — Personal Finance Dashboard",
      category: "webapp",
      categoryLabel: "Web App",
      tags: ["SaaS", "Figma", "Tailwind"],
      description:
        "A comprehensive financial management platform designed for freelancers to track income, expenses, and tax estimates.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80",
      caseStudy: {
        title: "Finlo — Personal Finance Dashboard",
        subtitle: "Designing an intuitive financial control center for independent creators",
        categoryTag: "UI/UX & Frontend",
        timeline: "6 weeks",
        client: "Finlo Inc.",
        role: "Lead Product Designer & Frontend Developer",
        deliverables: "Design System, Web App, Interactive Prototype",
        heroImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
        stats: [
          { value: "+140%", label: "User Engagement" },
          { value: "4.9/5", label: "App Store Rating" },
          { value: "50k+", label: "Active Freelancers" },
        ],
        briefTitle: "Project Overview & Brief",
        briefContent1:
          "Finlo came to us with a clear challenge: freelancers spend up to 10 hours a week managing manual spreadsheets for tax estimations, invoice tracking, and cash flow forecasts. Existing tools were either overly complex enterprise ERPs or overly simplistic budget trackers.",
        briefContent2:
          "Our objective was to design and engineer an end-to-end web application that automates transaction categorization, generates real-time tax readiness reports, and presents financial health metrics in a calm, digestible visual interface.",
        briefQuote:
          "We wanted Finlo to feel less like doing taxes and more like viewing a beautifully organized dashboard of personal progress.",
        discoveryTitle: "Discovery & User Research",
        interviewsText:
          "We conducted 18 in-depth interviews with full-time freelancers, agency contractors, and remote solo founders. Key insights revealed:",
        userInterviewPoints: [
          "82% of freelancers experience anxiety around quarterly estimated tax payments.",
          "Users check cash balances daily, but only review detailed analytics once a month.",
          "Visual clarity and dark mode support were top requested features for evening work sessions.",
        ],
        heuristicAuditText:
          "Our heuristic evaluation identified significant friction in competitor invoice creation workflows, requiring an average of 11 clicks to generate a basic PDF invoice.",
        auditImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1000&q=80",
        auditCaption: "Information Architecture & Friction Points Analysis",
        solutionTitle: "The Solution & Design System",
        solutionContent:
          "We crafted a modular component library built with Tailwind CSS and React. The core dashboard features custom widget layouts, instant keyboard shortcuts, and automated invoice PDF generation in under 3 clicks.",
      },
    },
    {
      id: "orea",
      title: "Orea — E-commerce Design System",
      category: "uiux",
      categoryLabel: "UI/UX",
      tags: ["Design System", "Figma", "React"],
      description: "A complete design system for a luxury home decor brand, scaling across mobile and desktop.",
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      caseStudy: {
        title: "Orea — E-commerce Design System",
        subtitle: "Scaling visual consistency and component architecture for luxury e-commerce",
        categoryTag: "Design System",
        timeline: "4 weeks",
        client: "Orea Home",
        role: "Senior UI/UX Specialist",
        deliverables: "Figma UI Kit, Storybook Tokens, Component Specs",
        heroImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",
        stats: [
          { value: "120+", label: "Reusable Components" },
          { value: "3x", label: "Faster Design Velocity" },
          { value: "100%", label: "AA Accessibility Score" },
        ],
        briefTitle: "Design System Scope",
        briefContent1:
          "Orea Home needed a unified visual language to bridge 4 distinct sub-brands under one digital storefront architecture.",
        briefContent2:
          "We engineered tokens for typography, color palettes, spacing grids, and high-level ecommerce patterns like sticky cart draws and multi-step checkout.",
      },
    },
    {
      id: "pulse",
      title: "Pulse — Developer Analytics Platform",
      category: "webapp",
      categoryLabel: "Web App",
      tags: ["Next.js", "TypeScript", "Tailwind"],
      description: "Real-time error tracking and performance monitoring dashboard for engineering teams.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      caseStudy: {
        title: "Pulse — Developer Analytics Platform",
        subtitle: "High-density data visualization for modern software engineering teams",
        categoryTag: "Frontend & Data Vis",
        timeline: "8 weeks",
        client: "Pulse DevTools",
        role: "Frontend Architect",
        deliverables: "Next.js Dashboard, WebGL Charts, WebSocket Sync",
        heroImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80",
        stats: [
          { value: "60 FPS", label: "Chart Render Speed" },
          { value: "10k+", label: "Events / Sec Handled" },
          { value: "99.9%", label: "Uptime Reliability" },
        ],
        briefTitle: "Engineering Challenge",
        briefContent1:
          "Pulse needed to display thousands of real-time server telemetry events per second without freezing the UI main thread.",
        briefContent2:
          "We implemented virtualized data tables, WebGL canvas rendering, and optimized WebSocket state updates for peak responsiveness.",
      },
    },
  ],
  about: {
    badgeText: "About me",
    title: "Crafting digital experiences with precision & care",
    bioParagraph1:
      "I'm a UI/UX designer and frontend developer with over 5 years of experience building products that people love. I specialize in design systems, web applications, and intuitive user interfaces.",
    bioParagraph2:
      "My approach combines thoughtful research, clean aesthetics, and performant code. When I'm not designing or coding, you can find me writing about design process, exploring photography, or trying new coffee brews.",
    stackTitle: "Stack & tools",
    stack: [
      "Figma",
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Node.js",
      "Git",
      "UI/UX Design",
    ],
    photo: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80",
  },
  blogSection: {
    badgeText: "Thoughts",
    title: "From the blog",
    viewAllText: "All articles →",
    pageTitle: "The Blog",
    pageSubtitle: "Thoughts on UI/UX design, frontend development, design systems, and digital product creation.",
  },
  blog: [
    {
      id: "design-systems-2025",
      title: "Building Design Systems That Engineers Actually Enjoy Using",
      category: "design",
      categoryLabel: "Design System",
      date: "March 2025",
      excerpt: "How to bridge the gap between Figma components and React code to ensure seamless adoption across teams.",
      image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=700&q=80",
      articleDetail: {
        title: "Building Design Systems That Engineers Actually Enjoy Using",
        subtitle: "A practical guide to component API design, design token naming, and automated sync between Figma and React.",
        category: "Design System",
        date: "March 12, 2025",
        readTime: "6 min read",
        authorName: "Eliott",
        authorRole: "UI/UX Designer & Frontend Dev",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        quoteText: "A design system is not a set of components in Figma. It is a shared mental model between designers and engineers.",
        paragraphs: [
          "Design systems often fail not because the Figma components are ugly, but because the developer experience of importing and customizing components in code is painful.",
          "When naming design tokens, avoid visual names like `blue-500` or `font-16`. Instead, use semantic role names like `color-accent-primary` or `text-heading-lg`. This allows theme modes and dark mode overrides to work automatically without refactoring component code.",
          "Always export TypeScript interfaces alongside your UI components. Strict prop validation prevents invalid layout combinations before they hit production builds.",
        ],
      },
    },
    {
      id: "nextjs-15-performance",
      title: "Next.js 15 & React 19: Performance Patterns for 2025",
      category: "dev",
      categoryLabel: "Development",
      date: "February 2025",
      excerpt: "A deep dive into Server Components, streaming SSR, and micro-optimizations for sub-second page loads.",
      image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=700&q=80",
      articleDetail: {
        title: "Next.js 15 & React 19: Performance Patterns for 2025",
        subtitle: "Leveraging Server Actions, streaming hydration, and static edge generation for instant web experiences.",
        category: "Development",
        date: "February 28, 2025",
        readTime: "8 min read",
        authorName: "Eliott",
        authorRole: "Frontend Architect",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        quoteText: "The fastest code is the code that never runs on the user's browser.",
        paragraphs: [
          "React 19 Actions simplify form state management by handling pending states and optimistic updates automatically.",
          "By shifting heavy data transformation logic to Server Components, we keep client-side JS bundle sizes under 100KB, resulting in flawless Core Web Vitals scores.",
        ],
      },
    },
    {
      id: "ui-micro-interactions",
      title: "The Art of Micro-Interactions: Small Details, Big Impact",
      category: "uiux",
      categoryLabel: "UI/UX",
      date: "January 2025",
      excerpt: "Why subtle hover states, smooth transitions, and tactile feedback transform a good UI into a memorable product.",
      image: "https://images.unsplash.com/photo-1510519138161-5844623e371c?w=700&q=80",
      articleDetail: {
        title: "The Art of Micro-Interactions: Small Details, Big Impact",
        subtitle: "How micro-animations guide user intent and elevate brand perception.",
        category: "UI/UX",
        date: "January 14, 2025",
        readTime: "5 min read",
        authorName: "Eliott",
        authorRole: "UI/UX Specialist",
        authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
        quoteText: "Details aren't just details; they make the product.",
        paragraphs: [
          "Micro-interactions provide immediate feedback, reassure users that their action was registered, and prevent double-clicks.",
          "Use spring physics rather than linear ease curves to make UI elements feel natural and responsive to human touch.",
        ],
      },
    },
  ],
  contactSection: {
    badgeText: "Get in touch",
    title: "Let's work together",
    description: "I'm open to UI/UX and frontend missions, short or long-term. Landing page, full product redesign, or just a second pair of eyes — let's talk.",
    email: "hello@eliott.dev",
    buttonText: "Send Message →",
  },
  footer: {
    copyrightText: "Eliott. All rights reserved. Developed by Laurent Begey • Distributed by ThemeWagon",
    formspreeUrl: "",
    twitterUrl: "https://twitter.com",
    githubUrl: "https://github.com",
    linkedinUrl: "https://linkedin.com",
    instagramUrl: "https://instagram.com",
  },
};

export const emptySiteData: SiteData = {
  accentColor: "#FFFFFF",
  themeMode: "dark",
  header: {
    brandPrefix: "",
    brandSuffix: "",
    navServices: "",
    navWork: "",
    navAbout: "",
    navBlog: "",
    navContact: "",
    hireMeButton: "",
  },
  hero: {
    badgeText: "",
    titlePrefix: "",
    name: "",
    description: "",
    workButtonText: "",
    projectsDone: "",
    happyClients: "",
    experienceYears: "",
    profilePhoto: "",
    resumeUrl: "",
  },
  servicesSection: {
    badgeText: "",
    title: "",
  },
  services: [],
  projectsSection: {
    badgeText: "",
    title: "",
    viewAllText: "",
    pageBadgeText: "",
    pageTitle: "",
    pageSubtitle: "",
  },
  projects: [],
  about: {
    badgeText: "",
    title: "",
    bioParagraph1: "",
    bioParagraph2: "",
    stackTitle: "",
    stack: [],
    photo: "",
  },
  blogSection: {
    badgeText: "",
    title: "",
    viewAllText: "",
    pageBadgeText: "",
    pageTitle: "",
    pageSubtitle: "",
  },
  blog: [],
  contactSection: {
    badgeText: "",
    title: "",
    description: "",
    email: "",
    buttonText: "",
  },
  footer: {
    copyrightText: "",
    formspreeUrl: "",
    twitterUrl: "",
    githubUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
  },
};

export const defaultSiteData: SiteData = emptySiteData;

export function isSampleDataActive(data: SiteData): boolean {
  if (!data) return false;
  const hasSampleProjects = (data.projects || []).some(
    (p) => p.id === "finlo" || p.id === "orea" || p.id === "pulse"
  );
  const hasSampleBlog = (data.blog || []).some(
    (b) =>
      b.id === "design-systems-2025" ||
      b.id === "nextjs-15-performance" ||
      b.id === "ui-micro-interactions"
  );
  const hasSampleServices = (data.services || []).some(
    (s) => s.id === "s1" || s.id === "s2" || s.id === "s3"
  );
  const hasSampleHero =
    data.hero?.name === "Eliott" ||
    (data.hero?.profilePhoto || "").includes("photo-1507003211169-0a1dd7228f2d");
  const hasSampleHeader =
    data.header?.brandPrefix === "eli" && data.header?.brandSuffix === "ott";

  return Boolean(
    hasSampleProjects ||
      hasSampleBlog ||
      hasSampleServices ||
      hasSampleHero ||
      hasSampleHeader
  );
}

export function purgeSampleData(data: SiteData): SiteData {
  if (!data) return emptySiteData;

  const isHeroSample =
    data.hero?.name === "Eliott" ||
    (data.hero?.profilePhoto || "").includes("photo-1507003211169-0a1dd7228f2d");

  const isHeaderSample =
    data.header?.brandPrefix === "eli" && data.header?.brandSuffix === "ott";

  const isAboutSample =
    data.about?.title === "Crafting digital experiences with precision & care" ||
    (data.about?.photo || "").includes("photo-1534528741775-53994a69daeb");

  return {
    ...data,
    header: {
      ...data.header,
      brandPrefix: isHeaderSample ? "" : data.header?.brandPrefix || "",
      brandSuffix: isHeaderSample ? "" : data.header?.brandSuffix || "",
    },
    hero: {
      ...data.hero,
      name: isHeroSample ? "" : data.hero?.name || "",
      badgeText:
        data.hero?.badgeText === "Available for work" && isHeroSample
          ? ""
          : data.hero?.badgeText || "",
      titlePrefix:
        data.hero?.titlePrefix === "Hi, I'm" && isHeroSample
          ? ""
          : data.hero?.titlePrefix || "",
      description:
        data.hero?.description?.startsWith(
          "Freelance UI/UX Designer & Frontend Developer"
        ) && isHeroSample
          ? ""
          : data.hero?.description || "",
      profilePhoto: (data.hero?.profilePhoto || "").includes(
        "images.unsplash.com"
      )
        ? ""
        : data.hero?.profilePhoto || "",
      resumeUrl:
        data.hero?.resumeUrl === "https://drive.google.com" && isHeroSample
          ? ""
          : data.hero?.resumeUrl || "",
      projectsDone:
        data.hero?.projectsDone === "34+" && isHeroSample
          ? ""
          : data.hero?.projectsDone || "",
      happyClients:
        data.hero?.happyClients === "21+" && isHeroSample
          ? ""
          : data.hero?.happyClients || "",
      experienceYears:
        data.hero?.experienceYears === "5y" && isHeroSample
          ? ""
          : data.hero?.experienceYears || "",
    },
    services: (data.services || []).filter(
      (s) => s.id !== "s1" && s.id !== "s2" && s.id !== "s3"
    ),
    projects: (data.projects || []).filter(
      (p) => p.id !== "finlo" && p.id !== "orea" && p.id !== "pulse"
    ),
    about: {
      ...data.about,
      title: isAboutSample ? "" : data.about?.title || "",
      badgeText:
        data.about?.badgeText === "About me" && isAboutSample
          ? ""
          : data.about?.badgeText || "",
      bioParagraph1:
        (data.about?.bioParagraph1 || "").includes(
          "I'm a UI/UX designer and frontend developer"
        ) && isAboutSample
          ? ""
          : data.about?.bioParagraph1 || "",
      bioParagraph2:
        (data.about?.bioParagraph2 || "").includes(
          "When I'm not designing or coding"
        ) && isAboutSample
          ? ""
          : data.about?.bioParagraph2 || "",
      photo: (data.about?.photo || "").includes("images.unsplash.com")
        ? ""
        : data.about?.photo || "",
      stack: isAboutSample
        ? []
        : (data.about?.stack || []).filter(
            (st) =>
              ![
                "Figma",
                "React",
                "Next.js",
                "TypeScript",
                "Tailwind CSS",
                "Node.js",
                "Git",
                "UI/UX Design",
              ].includes(st)
          ),
    },
    blog: (data.blog || []).filter(
      (b) =>
        b.id !== "design-systems-2025" &&
        b.id !== "nextjs-15-performance" &&
        b.id !== "ui-micro-interactions"
    ),
    contactSection: {
      ...data.contactSection,
      email:
        data.contactSection?.email === "hello@eliott.dev"
          ? ""
          : data.contactSection?.email || "",
    },
    footer: {
      ...data.footer,
      copyrightText: (data.footer?.copyrightText || "").includes(
        "Laurent Begey"
      )
        ? ""
        : data.footer?.copyrightText || "",
      twitterUrl:
        data.footer?.twitterUrl === "https://twitter.com"
          ? ""
          : data.footer?.twitterUrl || "",
      githubUrl:
        data.footer?.githubUrl === "https://github.com"
          ? ""
          : data.footer?.githubUrl || "",
      linkedinUrl:
        data.footer?.linkedinUrl === "https://linkedin.com"
          ? ""
          : data.footer?.linkedinUrl || "",
      instagramUrl:
        data.footer?.instagramUrl === "https://instagram.com"
          ? ""
          : data.footer?.instagramUrl || "",
    },
  };
}

interface SiteContextType {
  siteData: SiteData;
  updateSiteData: (newData: Partial<SiteData>) => Promise<void>;
  resetToCleanSlate: () => Promise<void>;
  loadDefaultSampleData: () => Promise<void>;
  loading: boolean;
  stats: SiteStats;
  trackPageView: () => Promise<void>;
  resetStats: () => Promise<void>;
}

export const STORAGE_KEY = "portfolio_site_data";
export const SYNC_CHANNEL_NAME = "portfolio_site_realtime_sync";

function broadcastSiteUpdate(data: SiteData) {
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
      channel.postMessage({ type: "SITE_DATA_UPDATED", data });
      channel.close();
    } catch (e) {
      // Ignore BroadcastChannel errors
    }
  }
}

export function getInitialSiteData(): SiteData {
  if (typeof window !== "undefined") {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached) as SiteData;
        if (parsed && typeof parsed === "object") {
          return { ...emptySiteData, ...parsed };
        }
      }
    } catch (e) {
      console.warn("Could not read local cache:", e);
    }
  }
  return emptySiteData;
}

const SiteContext = createContext<SiteContextType>({
  siteData: emptySiteData,
  updateSiteData: async () => {},
  resetToCleanSlate: async () => {},
  loadDefaultSampleData: async () => {},
  loading: false,
  stats: { totalVisits: 0, todayVisits: 0 },
  trackPageView: async () => {},
  resetStats: async () => {},
});

function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map(sanitizeForFirestore);
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleanObj[key] = sanitizeForFirestore(val);
    }
  }
  return cleanObj;
}

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteData, setSiteData] = useState<SiteData>(getInitialSiteData);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<SiteStats>({
    totalVisits: 0,
    todayVisits: 0,
  });

  // Real-time synchronization with Firestore, BroadcastChannel, and LocalStorage
  useEffect(() => {
    // Ensure document is hydrated
    document.documentElement.classList.add("hydrated");

    // 1. Instant cross-tab BroadcastChannel listener
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        channel = new BroadcastChannel(SYNC_CHANNEL_NAME);
        channel.onmessage = (event) => {
          if (event.data && event.data.type === "SITE_DATA_UPDATED" && event.data.data) {
            setSiteData(event.data.data);
          }
        };
      } catch (e) {}
    }

    // 2. Storage event listener (across browser tabs on same origin)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === "object") {
            setSiteData((prev) => ({ ...prev, ...parsed }));
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);

    // 3. Listen to real-time updates for site content from Firestore
    const docRef = doc(db, "siteData", "content");
    const unsubscribe = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as SiteData;
          if (data.hero) {
            data.hero.profilePhoto = convertGoogleDriveUrl(data.hero.profilePhoto);
            data.hero.resumeUrl = convertGoogleDriveUrl(data.hero.resumeUrl);
          }
          if (data.about) data.about.photo = convertGoogleDriveUrl(data.about.photo);
          if (data.projects) {
            data.projects = data.projects.map((p) => {
              const image = convertGoogleDriveUrl(p.image);
              const cs = p.caseStudy
                ? {
                    ...p.caseStudy,
                    heroImage: p.caseStudy.heroImage ? convertGoogleDriveUrl(p.caseStudy.heroImage) : undefined,
                    auditImage: p.caseStudy.auditImage ? convertGoogleDriveUrl(p.caseStudy.auditImage) : undefined,
                  }
                : undefined;
              return { ...p, image, caseStudy: cs };
            });
          }
          if (data.blog) {
            data.blog = sortBlogByNewest(
              data.blog.map((b) => {
                const image = convertGoogleDriveUrl(b.image);
                const ad = b.articleDetail
                  ? {
                      ...b.articleDetail,
                      heroImage: b.articleDetail.heroImage ? convertGoogleDriveUrl(b.articleDetail.heroImage) : undefined,
                      authorAvatar: b.articleDetail.authorAvatar ? convertGoogleDriveUrl(b.articleDetail.authorAvatar) : undefined,
                    }
                  : undefined;
                return { ...b, image, articleDetail: ad };
              })
            );
          }
          setSiteData(data);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
          } catch (e) {
            // Ignore quota errors
          }
        } else {
          setSiteData(emptySiteData);
        }
      },
      (err) => {
        console.warn("Firestore onSnapshot error:", err);
      }
    );

    // Listen to real-time updates for site visitor stats from Firestore
    const statsDocRef = doc(db, "siteData", "stats");
    const unsubStats = onSnapshot(statsDocRef, (snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setStats({
          totalVisits: d.totalVisits || 0,
          todayVisits: d.todayVisits || 0,
          lastVisitedAt: d.lastVisitedAt || undefined,
        });
      }
    });

    return () => {
      if (channel) {
        channel.close();
      }
      window.removeEventListener("storage", handleStorage);
      unsubscribe();
      unsubStats();
    };
  }, []);

  // Update dynamic accent color and theme mode (dark/light) on root element in real-time
  useEffect(() => {
    if (siteData.accentColor) {
      document.documentElement.style.setProperty("--color-accent", siteData.accentColor);
    }
    if (siteData.themeMode) {
      if (siteData.themeMode === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
    if (siteData.hero?.name || siteData.header?.brandPrefix) {
      const brand = `${siteData.header?.brandPrefix || ""}${siteData.header?.brandSuffix || ""}` || siteData.hero?.name || "";
      const heroName = siteData.hero?.name || brand;
      document.title = brand && heroName && brand !== heroName ? `${brand} — ${heroName}` : brand || heroName;
    }
  }, [siteData.accentColor, siteData.themeMode, siteData.hero?.name, siteData.header?.brandPrefix, siteData.header?.brandSuffix]);

  const updateSiteData = async (newData: Partial<SiteData>) => {
    const updated = { ...siteData, ...newData };
    setSiteData(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
    broadcastSiteUpdate(updated);
    const docRef = doc(db, "siteData", "content");
    const cleanData = sanitizeForFirestore(updated);
    await setDoc(docRef, cleanData, { merge: true });
  };

  const resetToCleanSlate = async () => {
    const clean = emptySiteData;
    setSiteData(clean);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(clean));
    } catch (e) {}
    broadcastSiteUpdate(clean);
    const docRef = doc(db, "siteData", "content");
    const cleanData = sanitizeForFirestore(clean);
    await setDoc(docRef, cleanData);
  };

  const loadDefaultSampleData = async () => {
    const sample = sampleTemplateData;
    setSiteData(sample);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sample));
    } catch (e) {}
    broadcastSiteUpdate(sample);
    const docRef = doc(db, "siteData", "content");
    const cleanData = sanitizeForFirestore(sample);
    await setDoc(docRef, cleanData);
  };

  const trackPageView = async () => {
    try {
      const statsDocRef = doc(db, "siteData", "stats");
      const currentTotal = stats.totalVisits || 0;
      const currentToday = stats.todayVisits || 0;
      await setDoc(
        statsDocRef,
        {
          totalVisits: currentTotal + 1,
          todayVisits: currentToday + 1,
          lastVisitedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.error("Error tracking pageview:", err);
    }
  };

  const resetStats = async () => {
    const statsDocRef = doc(db, "siteData", "stats");
    await setDoc(statsDocRef, { totalVisits: 0, todayVisits: 0, lastVisitedAt: new Date().toISOString() });
  };

  return (
    <SiteContext.Provider
      value={{
        siteData,
        updateSiteData,
        resetToCleanSlate,
        loadDefaultSampleData,
        loading,
        stats,
        trackPageView,
        resetStats,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
