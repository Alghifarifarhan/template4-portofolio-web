"use client";

import React, { useState } from "react";
import {
  Layout,
  Code,
  Sparkles,
  Smartphone,
  Palette,
  Globe,
  Server,
  Database,
  Rocket,
  Shield,
  Layers,
  Cpu,
  Search,
  BarChart3,
  TrendingUp,
  Zap,
  Briefcase,
  FolderKanban,
  Compass,
  Target,
  Feather,
  Monitor,
  Laptop,
  Terminal,
  Box,
  Package,
  PenTool,
  Settings,
  Flame,
  Cloud,
  Award,
  BookOpen,
  Camera,
  Heart,
  Lightbulb,
  Music,
  Video,
  Wrench,
  FileCode,
  Fingerprint,
  Workflow,
  Atom,
  Bot,
  Component,
  Paintbrush,
  LineChart,
  Megaphone,
  X,
  Check,
} from "lucide-react";

export interface IconDefinition {
  id: string;
  name: string;
  category: "Design" | "Development" | "Tech & Data" | "Business" | "General";
  icon: React.ComponentType<{ className?: string }>;
}

export const AVAILABLE_SERVICE_ICONS: IconDefinition[] = [
  // Design & Creative
  { id: "Layout", name: "UI/UX & Layout", category: "Design", icon: Layout },
  { id: "Palette", name: "Color & Visual", category: "Design", icon: Palette },
  { id: "PenTool", name: "Vector & Illustration", category: "Design", icon: PenTool },
  { id: "Paintbrush", name: "Art & Design", category: "Design", icon: Paintbrush },
  { id: "Layers", name: "Design System", category: "Design", icon: Layers },
  { id: "Component", name: "Components", category: "Design", icon: Component },
  { id: "Feather", name: "Creative Writing", category: "Design", icon: Feather },
  { id: "Camera", name: "Photography", category: "Design", icon: Camera },

  // Development & Code
  { id: "Code", name: "Web Coding", category: "Development", icon: Code },
  { id: "Smartphone", name: "Mobile App", category: "Development", icon: Smartphone },
  { id: "Globe", name: "Web Application", category: "Development", icon: Globe },
  { id: "Terminal", name: "CLI & DevOps", category: "Development", icon: Terminal },
  { id: "FileCode", name: "Scripts & APIs", category: "Development", icon: FileCode },
  { id: "Workflow", name: "Automation & CI/CD", category: "Development", icon: Workflow },
  { id: "Atom", name: "Frontend Frameworks", category: "Development", icon: Atom },
  { id: "Monitor", name: "Desktop App", category: "Development", icon: Monitor },
  { id: "Laptop", name: "Fullstack Dev", category: "Development", icon: Laptop },

  // Tech, Cloud & Data
  { id: "Server", name: "Backend Server", category: "Tech & Data", icon: Server },
  { id: "Database", name: "Database & SQL", category: "Tech & Data", icon: Database },
  { id: "Cloud", name: "Cloud Infrastructure", category: "Tech & Data", icon: Cloud },
  { id: "Cpu", name: "Hardware & AI Core", category: "Tech & Data", icon: Cpu },
  { id: "Bot", name: "AI & Machine Learning", category: "Tech & Data", icon: Bot },
  { id: "Shield", name: "Security & Protection", category: "Tech & Data", icon: Shield },
  { id: "Fingerprint", name: "Auth & Identity", category: "Tech & Data", icon: Fingerprint },

  // Business & Strategy
  { id: "Rocket", name: "Product Launch", category: "Business", icon: Rocket },
  { id: "Zap", name: "Performance Boost", category: "Business", icon: Zap },
  { id: "Sparkles", name: "Product Refresh", category: "Business", icon: Sparkles },
  { id: "Briefcase", name: "Consulting", category: "Business", icon: Briefcase },
  { id: "FolderKanban", name: "Project Management", category: "Business", icon: FolderKanban },
  { id: "Target", name: "Strategy & Goals", category: "Business", icon: Target },
  { id: "Compass", name: "Discovery & Direction", category: "Business", icon: Compass },
  { id: "TrendingUp", name: "Growth & Scaling", category: "Business", icon: TrendingUp },
  { id: "BarChart3", name: "Analytics & KPI", category: "Business", icon: BarChart3 },
  { id: "LineChart", name: "Data Insights", category: "Business", icon: LineChart },
  { id: "Megaphone", name: "Marketing & SEO", category: "Business", icon: Megaphone },
  { id: "Search", name: "User Research", category: "Business", icon: Search },

  // General & Media
  { id: "Box", name: "Product Modeling", category: "General", icon: Box },
  { id: "Package", name: "Packaging / Delivery", category: "General", icon: Package },
  { id: "Settings", name: "Maintenance & Config", category: "General", icon: Settings },
  { id: "Wrench", name: "Technical Support", category: "General", icon: Wrench },
  { id: "Flame", name: "Hot Features", category: "General", icon: Flame },
  { id: "Award", name: "Quality Assurance", category: "General", icon: Award },
  { id: "BookOpen", name: "Documentation", category: "General", icon: BookOpen },
  { id: "Heart", name: "Community Care", category: "General", icon: Heart },
  { id: "Lightbulb", name: "Ideation & Innovation", category: "General", icon: Lightbulb },
  { id: "Music", name: "Audio Production", category: "General", icon: Music },
  { id: "Video", name: "Video Production", category: "General", icon: Video },
];

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ...AVAILABLE_SERVICE_ICONS.reduce((acc, item) => {
    acc[item.id] = item.icon;
    return acc;
  }, {} as Record<string, React.ComponentType<{ className?: string }>>),
  Layout,
  Code,
  Sparkles,
};

/**
 * Returns the matching Lucide icon component for a given iconName, with fallback.
 */
export function getServiceIconComponent(
  iconName?: string,
  fallbackIdx: number = 0
): React.ComponentType<{ className?: string }> {
  if (iconName && ICON_MAP[iconName]) {
    return ICON_MAP[iconName];
  }
  const defaultList = [Layout, Code, Sparkles, Rocket, Palette, Globe];
  return defaultList[fallbackIdx % defaultList.length];
}

/**
 * Interactive visual icon picker modal for the Admin Dashboard.
 */
export function ServiceIconPicker({
  selectedIcon,
  onSelect,
}: {
  selectedIcon?: string;
  onSelect: (iconId: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Design", "Development", "Tech & Data", "Business", "General"];

  const filteredIcons = AVAILABLE_SERVICE_ICONS.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === "All" || item.category === activeCategory;
    return matchesSearch && matchesCat;
  });

  const CurrentIcon = getServiceIconComponent(selectedIcon);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700 hover:border-accent text-zinc-200 hover:text-white rounded-xl text-xs transition-all shadow-xs"
        title="Klik untuk memilih ikon"
      >
        <div className="w-6 h-6 rounded-lg bg-accent/15 border border-accent/30 flex items-center justify-center text-accent shrink-0">
          <CurrentIcon className="w-3.5 h-3.5" />
        </div>
        <span className="font-medium truncate max-w-[120px]">
          {selectedIcon || "Pilih Ikon"}
        </span>
        <span className="text-[10px] text-accent ml-auto underline font-semibold">
          Ganti
        </span>
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  Pilih Ikon What I Do
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Setiap box What I Do dapat memilih ikon yang berbeda ataupun sama.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter & Search */}
            <div className="p-4 border-b border-zinc-800/80 space-y-3 bg-zinc-950/40">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari ikon... (contoh: Code, Layout, Mobile, Rocket)"
                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
              />

              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg transition-colors ${
                      activeCategory === cat
                        ? "bg-accent text-white font-medium shadow-xs"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/60"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Icons Grid */}
            <div className="p-4 overflow-y-auto max-h-[50vh] grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {filteredIcons.length === 0 ? (
                <div className="col-span-full py-10 text-center text-zinc-500 text-xs">
                  Tidak ada ikon yang cocok dengan pencarian &quot;{search}&quot;.
                </div>
              ) : (
                filteredIcons.map((item) => {
                  const ItemIcon = item.icon;
                  const isSelected = selectedIcon === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        onSelect(item.id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "bg-accent/15 border-accent text-white shadow-xs"
                          : "bg-zinc-800/60 border-zinc-700/60 hover:border-zinc-500 text-zinc-300 hover:text-white hover:bg-zinc-800"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-accent text-white"
                            : "bg-zinc-900 border border-zinc-700/80 text-zinc-300 group-hover:text-white"
                        }`}
                      >
                        <ItemIcon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{item.id}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{item.name}</p>
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="p-3.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 bg-zinc-950/60">
              <span>{filteredIcons.length} ikon tersedia</span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
