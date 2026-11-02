"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import {
  useSite,
  SiteData,
  ProjectItem,
  ServiceItem,
  BlogItem,
  emptySiteData,
  isSampleDataActive,
  purgeSampleData,
} from "@/context/SiteContext";
import { convertGoogleDriveUrl } from "@/lib/drive-helper";
import { ServiceIconPicker } from "@/lib/icons";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, doc, deleteDoc, getDoc, getDocs, setDoc } from "firebase/firestore";
import {
  Palette,
  Layout,
  User,
  Briefcase,
  Layers,
  FileText,
  Save,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  ExternalLink,
  Info,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Key,
  BarChart3,
  RefreshCw,
  Activity,
  HardDrive,
  MessageSquare,
  Sparkles,
  Download,
  Upload,
  Database,
  FileJson,
} from "lucide-react";

interface AdminBlogComment {
  id: string;
  articleId: string;
  authorName: string;
  content: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading, logout, changePassword } = useAuth();
  const {
    siteData,
    updateSiteData,
    resetToCleanSlate,
    loadDefaultSampleData,
    loading: siteLoading,
    stats,
    resetStats,
  } = useSite();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "appearance" | "headerFooter" | "hero" | "services" | "projects" | "about" | "blog" | "comments" | "security" | "stats"
  >("appearance");

  const [formData, setFormData] = useState<SiteData>(siteData);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleanSuccess, setCleanSuccess] = useState(false);
  const [cleanNotice, setCleanNotice] = useState("");
  const [expandedProjectIndex, setExpandedProjectIndex] = useState<number | null>(null);
  const [expandedBlogIndex, setExpandedBlogIndex] = useState<number | null>(null);

  // Security Password Change States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passError, setPassError] = useState("");
  const [passSuccess, setPassSuccess] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isResettingStats, setIsResettingStats] = useState(false);

  // Database Backup (JSON Export & Import) States
  const [isExportingDb, setIsExportingDb] = useState(false);
  const [isImportingDb, setIsImportingDb] = useState(false);
  const [dbActionSuccess, setDbActionSuccess] = useState("");
  const [dbActionError, setDbActionError] = useState("");
  const dbFileInputRef = React.useRef<HTMLInputElement>(null);

  // Comments Management State
  const [allComments, setAllComments] = useState<AdminBlogComment[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  // Safe Comma & Text Inputs State (Prevents comma deletion on typing)
  const [tagInputs, setTagInputs] = useState<Record<number, string>>({});
  const [stackInput, setStackInput] = useState<string>("");
  const [paragraphInputs, setParagraphInputs] = useState<Record<number, string>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/admin/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (siteData) {
      setFormData(siteData);
      setStackInput((siteData.about?.stack || []).join(", "));
      const tagsMap: Record<number, string> = {};
      (siteData.projects || []).forEach((p, idx) => {
        tagsMap[idx] = (p.tags || []).join(", ");
      });
      setTagInputs(tagsMap);
      const parasMap: Record<number, string> = {};
      (siteData.blog || []).forEach((b, idx) => {
        parasMap[idx] = (b.articleDetail?.paragraphs || []).join("\n\n");
      });
      setParagraphInputs(parasMap);
    }
  }, [siteData]);

  // Real-time listener for blog comments
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, "blogComments"), (snapshot) => {
        const list: AdminBlogComment[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as AdminBlogComment);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllComments(list);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Comments error:", e);
    }
  }, []);

  const handleDeleteComment = async (id: string) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus komentar ini secara permanen?")) return;
    setDeletingCommentId(id);
    try {
      await deleteDoc(doc(db, "blogComments", id));
    } catch (e) {
      console.error("Error deleting comment:", e);
      alert("Gagal menghapus komentar.");
    } finally {
      setDeletingCommentId(null);
    }
  };

  const handleCleanAllSampleData = async () => {
    if (
      !window.confirm(
        "MEMBERSIHKAN SEMUA DATA CONTOH?\n\nSemua teks nama bawaan (Eliott), teks navbar contoh, gambar Unsplash, proyek bawaan (Finlo, Orea, Pulse), artikel blog contoh, dan item What I Do dummy akan dihapus bersih agar website Anda bersih dan siap diisi data asli."
      )
    ) {
      return;
    }

    setIsCleaning(true);
    try {
      await resetToCleanSlate();
      setFormData(emptySiteData);
      setStackInput("");
      setTagInputs({});
      setParagraphInputs({});
      setCleanNotice("Semua data contoh bawaan berhasil dibersihkan!");
      setCleanSuccess(true);
      setTimeout(() => setCleanSuccess(false), 4000);
    } catch (err) {
      console.error("Clean sample data error:", err);
      alert("Gagal membersihkan data contoh.");
    } finally {
      setIsCleaning(false);
    }
  };

  const handleRestoreSampleData = async () => {
    if (
      !window.confirm(
        "MUAT ULANG DATA CONTOH TEMPLATE?\n\nData template default (Eliott, Finlo, Orea, Pulse) akan dimuat kembali ke website."
      )
    ) {
      return;
    }
    setIsCleaning(true);
    try {
      await loadDefaultSampleData();
      setCleanNotice("Data contoh template berhasil dimuat ulang!");
      setCleanSuccess(true);
      setTimeout(() => setCleanSuccess(false), 4000);
    } catch (err) {
      console.error("Restore error:", err);
      alert("Gagal memuat ulang data contoh.");
    } finally {
      setIsCleaning(false);
    }
  };

  if (authLoading || siteLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <p className="text-xs sm:text-sm text-zinc-400">Memuat Dashboard Admin...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      // Sync tagInputs, stackInput, and paragraphInputs before saving
      let finalData = { ...formData };

      // Sync stack
      finalData.about = {
        ...finalData.about,
        stack: stackInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };

      // Sync tags for projects
      if (finalData.projects) {
        finalData.projects = finalData.projects.map((p, idx) => {
          if (tagInputs[idx] !== undefined) {
            return {
              ...p,
              tags: tagInputs[idx]
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
            };
          }
          return p;
        });
      }

      // Sync blog paragraphs
      if (finalData.blog) {
        finalData.blog = finalData.blog.map((b, idx) => {
          if (paragraphInputs[idx] !== undefined) {
            return {
              ...b,
              articleDetail: {
                ...b.articleDetail,
                paragraphs: paragraphInputs[idx]
                  .split("\n\n")
                  .map((p) => p.trim())
                  .filter(Boolean),
              },
            };
          }
          return b;
        });
      }

      await updateSiteData(finalData);
      setFormData(finalData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Save error:", err);
      alert("Gagal menyimpan perubahan ke Firestore.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrivePhotoChange = (rawUrl: string, updater: (convertedUrl: string) => void) => {
    const converted = convertGoogleDriveUrl(rawUrl);
    updater(converted);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError("");
    setPassSuccess(false);

    if (newPassword.length < 6) {
      setPassError("Password baru harus memiliki minimal 6 karakter.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("Konfirmasi password baru tidak cocok.");
      return;
    }

    setIsChangingPass(true);
    try {
      await changePassword(newPassword);
      setPassSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassSuccess(false), 4000);
    } catch (err: any) {
      console.error("Change password error:", err);
      if (err.code === "auth/requires-recent-login") {
        setPassError("Sesi login Anda sudah terlalu lama. Silakan Logout dan Login kembali untuk mengubah password.");
      } else {
        setPassError(err.message || "Gagal memperbarui password admin.");
      }
    } finally {
      setIsChangingPass(false);
    }
  };

  const handleResetStats = async () => {
    if (confirm("Apakah Anda yakin ingin meriset statistik kunjungan menjadi 0?")) {
      setIsResettingStats(true);
      try {
        await resetStats();
      } catch (err) {
        console.error("Error resetting stats:", err);
      } finally {
        setIsResettingStats(false);
      }
    }
  };

  const handleDownloadDatabase = async () => {
    setIsExportingDb(true);
    setDbActionError("");
    setDbActionSuccess("");
    try {
      let currentSiteData = formData;
      try {
        const snap = await getDoc(doc(db, "siteData", "content"));
        if (snap.exists()) {
          currentSiteData = snap.data() as SiteData;
        }
      } catch (e) {
        console.warn("Could not fetch siteData from firestore for export, using current form state:", e);
      }

      let currentStats: any = stats;
      try {
        const snapStats = await getDoc(doc(db, "siteData", "stats"));
        if (snapStats.exists()) {
          currentStats = snapStats.data();
        }
      } catch (e) {
        console.warn("Could not fetch stats for export:", e);
      }

      let commentsList: any[] = allComments;
      try {
        const commentsSnap = await getDocs(collection(db, "blogComments"));
        const list: any[] = [];
        commentsSnap.forEach((d) => {
          list.push({ id: d.id, ...d.data() });
        });
        if (list.length > 0) commentsList = list;
      } catch (e) {
        console.warn("Could not fetch comments for export:", e);
      }

      const backupPayload = {
        _info: "Portfolio Firestore Database Backup Export",
        version: "1.0",
        exportedAt: new Date().toISOString(),
        siteData: currentSiteData,
        siteStats: currentStats,
        blogComments: commentsList,
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "database.json";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDbActionSuccess("database.json berhasil diekspor & didownload!");
      setTimeout(() => setDbActionSuccess(""), 5000);
    } catch (err: any) {
      console.error("Export database error:", err);
      setDbActionError("Gagal mendownload database: " + (err?.message || "Terjadi kesalahan"));
    } finally {
      setIsExportingDb(false);
    }
  };

  const handleImportDatabase = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    setDbActionError("");
    setDbActionSuccess("");

    if (
      !window.confirm(
        "PERINGATAN: IMPOR DATABASE DARI FILE JSON\n\nApakah Anda yakin ingin mengimpor database dari file ini? Seluruh data website (pengaturan, portofolio, artikel blog, dan komentar) akan ditimpa dengan data dari file database.json."
      )
    ) {
      return;
    }

    setIsImportingDb(true);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Format file JSON tidak valid.");
      }

      let importedSiteData: SiteData | null = null;
      let importedStats: any = null;
      let importedComments: any[] | null = null;

      if (parsed.siteData && typeof parsed.siteData === "object") {
        importedSiteData = parsed.siteData as SiteData;
        importedStats = parsed.siteStats || null;
        importedComments = Array.isArray(parsed.blogComments) ? parsed.blogComments : null;
      } else if (parsed.hero || parsed.header || parsed.services || parsed.projects) {
        importedSiteData = parsed as SiteData;
      } else {
        throw new Error("File JSON tidak berisi data portofolio yang valid.");
      }

      if (importedSiteData) {
        await updateSiteData(importedSiteData);
        setFormData(importedSiteData);
        setStackInput((importedSiteData.about?.stack || []).join(", "));
        const tagsMap: Record<number, string> = {};
        (importedSiteData.projects || []).forEach((p, idx) => {
          tagsMap[idx] = (p.tags || []).join(", ");
        });
        setTagInputs(tagsMap);
        const parasMap: Record<number, string> = {};
        (importedSiteData.blog || []).forEach((b, idx) => {
          parasMap[idx] = (b.articleDetail?.paragraphs || []).join("\n\n");
        });
        setParagraphInputs(parasMap);
      }

      if (importedStats) {
        const statsDocRef = doc(db, "siteData", "stats");
        await setDoc(statsDocRef, importedStats, { merge: true });
      }

      if (importedComments && importedComments.length > 0) {
        for (const comment of importedComments) {
          if (comment && comment.authorName && comment.content) {
            const commentId = comment.id || "c_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
            const { id, ...dataToSave } = comment;
            await setDoc(doc(db, "blogComments", commentId), dataToSave, { merge: true });
          }
        }
      }

      setDbActionSuccess(
        `database.json berhasil diimpor! Data ${importedSiteData?.projects?.length || 0} proyek & ${importedSiteData?.blog?.length || 0} artikel berhasil dipulihkan.`
      );
      setTimeout(() => setDbActionSuccess(""), 6000);
    } catch (err: any) {
      console.error("Import database error:", err);
      setDbActionError("Gagal mengimpor file: " + (err?.message || "Format JSON tidak valid"));
    } finally {
      setIsImportingDb(false);
    }
  };

  // Metrics Calculations for Free Tier Limits
  const totalVisits = stats?.totalVisits || 0;
  const estimatedBandwidthMB = Math.round(totalVisits * 0.8 * 10) / 10; // Avg 0.8MB per visit
  const hostingLimitMB = 10240; // 10 GB free limit
  const hostingUsagePercent = Math.min(Math.round((estimatedBandwidthMB / hostingLimitMB) * 1000) / 10, 100);

  const firestoreDailyLimit = 50000;
  const estimatedDailyReads = Math.min(totalVisits, firestoreDailyLimit);
  const firestoreUsagePercent = Math.min(Math.round((estimatedDailyReads / firestoreDailyLimit) * 1000) / 10, 100);

  const tabList = [
    { id: "stats", label: "Statistik Web & Kuota", icon: BarChart3 },
    { id: "appearance", label: "Warna & Tema", icon: Palette },
    { id: "headerFooter", label: "Header, Nav & Contact", icon: Layout },
    { id: "hero", label: "Section Hero & Resume", icon: User },
    { id: "services", label: "What I Do", icon: Layers },
    { id: "projects", label: "Portofolio & Case Study", icon: Briefcase },
    { id: "about", label: "Tentang (About)", icon: User },
    { id: "blog", label: "Katalog & Detail Blog", icon: FileText },
    { id: "comments", label: "💬 Komentar Blog", icon: MessageSquare },
    { id: "security", label: "Keamanan & Sandi", icon: ShieldCheck },
  ];

  return (
    <main className="min-h-screen pt-20 sm:pt-24 pb-20 bg-zinc-950 text-zinc-100 font-body overflow-x-hidden w-full max-w-full">
      {/* TOP ADMIN HEADER BAR - 100% RESPONSIVE NO OVERFLOW */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-zinc-900/95 border-b border-zinc-800 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center justify-between w-full max-w-full overflow-hidden">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse shrink-0"></span>
          <h1 className="font-display font-bold text-sm sm:text-lg text-white truncate">Admin Dashboard</h1>
          <span className="hidden sm:inline-block text-[11px] sm:text-xs bg-zinc-800 text-zinc-400 px-2.5 py-0.5 rounded-full border border-zinc-700 truncate max-w-[140px] md:max-w-none">
            {user.email}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-zinc-300 hover:text-white bg-zinc-800/80 hover:bg-zinc-700/80 border border-zinc-700/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
            title="Buka Pratinjau Web Utama di Tab Baru"
          >
            <ExternalLink className="w-3.5 h-3.5 text-accent shrink-0" />
            <span className="hidden sm:inline">Pratinjau Web</span>
            <span className="sm:hidden">Web</span>
          </a>
          {cleanSuccess && (
            <span className="text-[11px] sm:text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3 shrink-0" /> <span className="hidden sm:inline">{cleanNotice || "Data Dibersihkan!"}</span>
            </span>
          )}
          {saveSuccess && (
            <span className="text-[11px] sm:text-xs text-green-400 bg-green-500/10 border border-green-500/30 px-2.5 py-1 rounded-full flex items-center gap-1">
              <CheckCircle className="w-3 h-3 shrink-0" /> <span className="hidden sm:inline">Perubahan</span> Disimpan!
            </span>
          )}
          <button
            onClick={handleCleanAllSampleData}
            disabled={isCleaning}
            className="text-xs text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Bersihkan Semua Data Contoh Template"
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{isCleaning ? "Membersihkan..." : "Bersihkan Data Contoh"}</span>
            <span className="sm:hidden">Bersihkan</span>
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="shimmer bg-accent text-white text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full hover:bg-accent-light transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{isSaving ? "Menyimpan..." : "Simpan"}</span>
            <span className="hidden sm:inline">{!isSaving && " Perubahan"}</span>
          </button>
          <button
            onClick={logout}
            className="text-xs text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full transition-colors flex items-center gap-1.5"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD BODY - STRICT CONTAINER LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 grid md:grid-cols-5 gap-6 md:gap-8 w-full max-w-full items-start">
        {/* SIDEBAR TABS - STICKY ON DESKTOP */}
        <aside className="md:col-span-1 min-w-0 w-full md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-7rem)] md:overflow-y-auto pr-1">
          {/* MOBILE NATIVE DROPDOWN SELECT (<768px) - ZERO HORIZONTAL OVERFLOW */}
          <div className="block md:hidden mb-2 w-full">
            <label className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
              Pilih Menu Pengaturan
            </label>
            <div className="relative w-full">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 text-xs sm:text-sm appearance-none font-medium focus:outline-none focus:border-accent"
              >
                {tabList.map((tab) => (
                  <option key={tab.id} value={tab.id}>
                    {tab.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* DESKTOP SIDEBAR TABS (≥768px) */}
          <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest px-3 mb-2 hidden md:block">
            Pengaturan Website
          </p>
          <div className="hidden md:flex md:flex-col space-y-1 w-full">
            {tabList.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors flex items-center gap-2.5 ${
                    activeTab === tab.id
                      ? "bg-accent text-white font-semibold shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* MAIN PANEL CONTENT - STRICT MOBILE CONTAINER */}
        <section className="md:col-span-4 min-w-0 w-full max-w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 overflow-hidden">
          {/* NOTICE BANNER IF SAMPLE DATA IS ACTIVE */}
          {isSampleDataActive(formData) && (
            <div className="mb-6 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-amber-300">
                    Website Masih Menggunakan Data Contoh Template (Eliott)
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-1 leading-relaxed">
                    Semua teks nama bawaan (&quot;Eliott&quot;), teks navbar contoh, gambar Unsplash, proyek bawaan (Finlo, Orea, Pulse), artikel blog contoh, dan item What I Do dummy dapat dibersihkan dalam 1 klik.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCleanAllSampleData}
                disabled={isCleaning}
                className="shrink-0 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> {isCleaning ? "Membersihkan..." : "Bersihkan Semua Data Contoh"}
              </button>
            </div>
          )}
          {/* TAB: STATISTIK & KUOTA */}
          {activeTab === "stats" && (
            <div className="space-y-6 sm:space-y-8 max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-1">Statistik Kunjungan &amp; Penggunaan Kuota</h2>
                  <p className="text-xs text-zinc-400">
                    Pantau jumlah total kunjungan publik, estimasi pemakaian data, dan status kuota gratis Firebase Spark Plan.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleResetStats}
                  disabled={isResettingStats}
                  className="text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 px-3 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Riset Statistik
                </button>
              </div>

              {/* STATS METRIC CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-medium">Total Kunjungan</span>
                    <Activity className="w-4 h-4 text-accent" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-white">{totalVisits.toLocaleString()}</p>
                  <p className="text-[11px] text-zinc-500">Pageviews terdeteksi</p>
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-medium">Estimasi Transfer Data</span>
                    <HardDrive className="w-4 h-4 text-blue-400" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-white">{estimatedBandwidthMB} MB</p>
                  <p className="text-[11px] text-zinc-500">Dari batas 10 GB / bulan</p>
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-medium">Status Firestore Reads</span>
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-white">{estimatedDailyReads.toLocaleString()}</p>
                  <p className="text-[11px] text-zinc-500">Dari batas 50.000 / hari</p>
                </div>

                <div className="bg-zinc-800/60 border border-zinc-700/60 rounded-2xl p-4 sm:p-5 space-y-2">
                  <div className="flex items-center justify-between text-zinc-400">
                    <span className="text-xs font-medium">Firebase Storage</span>
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  </div>
                  <p className="font-display text-2xl sm:text-3xl font-bold text-green-400">0 Byte</p>
                  <p className="text-[11px] text-zinc-500">Menggunakan Google Drive</p>
                </div>
              </div>

              {/* HOSTING & FIRESTORE QUOTA PROGRESS BARS */}
              <div className="space-y-4 pt-4 border-t border-zinc-800 max-w-full">
                <h3 className="font-semibold text-sm text-white">Status Pemakaian Kuota Firebase Gratis (Spark Plan)</h3>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-medium">Firebase Hosting Bandwidth (Outbound)</span>
                    <span className="text-accent font-mono font-semibold">{hostingUsagePercent}% Terpakai</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-500"
                      style={{ width: `${hostingUsagePercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Batas gratis: 10 GB per bulan. Reset otomatis setiap tanggal 1 bulan baru.
                  </p>
                </div>

                <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-medium">Cloud Firestore Document Reads</span>
                    <span className="text-emerald-400 font-mono font-semibold">{firestoreUsagePercent}% Terpakai</span>
                  </div>
                  <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${firestoreUsagePercent}%` }}
                    ></div>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Batas gratis: 50.000 pembacaan dokumen per hari. Reset otomatis setiap pukul 07:00 WIB.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 1: APPEARANCE & THEME MODE */}
          {activeTab === "appearance" && (
            <div className="space-y-6 sm:space-y-8 max-w-full">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-1">Mode Tampilan &amp; Warna Accent</h2>
                <p className="text-xs text-zinc-400">
                  Atur tema global website (Dark/Light Mode) dan ubah warna aksen website.
                </p>
              </div>

              <div className="p-4 sm:p-5 bg-zinc-800/60 rounded-2xl border border-zinc-700/60 space-y-3">
                <label className="block text-xs font-semibold text-white">Mode Tampilan Website Global</label>
                <div className="flex flex-wrap gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, themeMode: "dark" })}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      formData.themeMode === "dark"
                        ? "bg-zinc-950 text-white border-accent shadow-md ring-2 ring-accent/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    🌙 Dark Mode (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, themeMode: "light" })}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      formData.themeMode === "light"
                        ? "bg-white text-zinc-900 border-accent shadow-md ring-2 ring-accent/30"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                    }`}
                  >
                    ☀️ Light Mode
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-zinc-800/60 rounded-2xl border border-zinc-700/60">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor || "#FFFFFF"}
                    onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border-0 cursor-pointer bg-transparent"
                  />
                  <div>
                    <label className="block text-xs font-medium text-zinc-300">Kode Warna Hex Accent</label>
                    <input
                      type="text"
                      value={formData.accentColor || ""}
                      onChange={(e) => setFormData({ ...formData, accentColor: e.target.value })}
                      placeholder="#FFFFFF"
                      className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono mt-1 w-28 sm:w-auto"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: "#FFFFFF" })}
                    className="text-[11px] sm:text-xs bg-white hover:bg-zinc-200 border border-zinc-300 text-zinc-900 font-semibold px-2.5 py-1.5 rounded-lg"
                  >
                    Putih (Default)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: "#FF6B2B" })}
                    className="text-[11px] sm:text-xs bg-orange-600 hover:bg-orange-500 text-white px-2.5 py-1.5 rounded-lg"
                  >
                    Oranye
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: "#3B82F6" })}
                    className="text-[11px] sm:text-xs bg-blue-600 hover:bg-blue-500 text-white px-2.5 py-1.5 rounded-lg"
                  >
                    Biru
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: "#10B981" })}
                    className="text-[11px] sm:text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded-lg"
                  >
                    Hijau
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, accentColor: "#8B5CF6" })}
                    className="text-[11px] sm:text-xs bg-purple-600 hover:bg-purple-500 text-white px-2.5 py-1.5 rounded-lg"
                  >
                    Ungu
                  </button>
                </div>
              </div>

              {/* DATA MANAGEMENT & TEMPLATE SAMPLE CLEANUP */}
              <div className="p-4 sm:p-5 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-sm text-white">Manajemen Data Template &amp; Pembersihan</h3>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Bersihkan seluruh data contoh bawaan website agar bersih atau muat ulang data contoh jika diperlukan.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCleanAllSampleData}
                      disabled={isCleaning}
                      className="bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{isCleaning ? "Memproses..." : "Bersihkan Data Contoh"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRestoreSampleData}
                      disabled={isCleaning}
                      className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Muat Ulang Data Contoh</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HEADER, NAV, CONTACT & FORMSPREE */}
          {activeTab === "headerFooter" && (
            <div className="space-y-6 max-w-full">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4">Header, Navbar &amp; Section Contact</h2>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 space-y-3">
                <h3 className="font-semibold text-sm text-white">Teks Navigation Bar Header</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nav Link What I Do</label>
                    <input
                      type="text"
                      value={formData.header?.navServices || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, navServices: e.target.value },
                        })
                      }
                      placeholder="Contoh: What I Do"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nav Link Work</label>
                    <input
                      type="text"
                      value={formData.header?.navWork || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, navWork: e.target.value },
                        })
                      }
                      placeholder="Contoh: Work / Proyek"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nav Link About</label>
                    <input
                      type="text"
                      value={formData.header?.navAbout || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, navAbout: e.target.value },
                        })
                      }
                      placeholder="Contoh: About / Tentang"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nav Link Blog</label>
                    <input
                      type="text"
                      value={formData.header?.navBlog || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, navBlog: e.target.value },
                        })
                      }
                      placeholder="Contoh: Blog / Artikel"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Nav Link Contact</label>
                    <input
                      type="text"
                      value={formData.header?.navContact || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, navContact: e.target.value },
                        })
                      }
                      placeholder="Contoh: Contact / Kontak"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Tombol Hire Me Header</label>
                    <input
                      type="text"
                      value={formData.header?.hireMeButton || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          header: { ...formData.header, hireMeButton: e.target.value },
                        })
                      }
                      placeholder="Contoh: Hire me / Hubungi"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Prefix Brand Header</label>
                  <input
                    type="text"
                    value={formData.header?.brandPrefix || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        header: { ...formData.header, brandPrefix: e.target.value },
                      })
                    }
                    placeholder="Contoh: eli / John"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Suffix Brand Header (Accent)</label>
                  <input
                    type="text"
                    value={formData.header?.brandSuffix || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        header: { ...formData.header, brandSuffix: e.target.value },
                      })
                    }
                    placeholder="Contoh: ott / Doe"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <h3 className="font-semibold text-sm text-white">Teks Section Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Badge Contact</label>
                    <input
                      type="text"
                      value={formData.contactSection?.badgeText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, badgeText: e.target.value },
                        })
                      }
                      placeholder="Contoh: Get in touch / Kontak"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Judul Contact</label>
                    <input
                      type="text"
                      value={formData.contactSection?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, title: e.target.value },
                        })
                      }
                      placeholder="Contoh: Let's work together / Mari Bekerja Sama"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Deskripsi Contact</label>
                  <textarea
                    rows={3}
                    value={formData.contactSection?.description || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactSection: { ...formData.contactSection, description: e.target.value },
                      })
                    }
                    placeholder="Contoh: Saya terbuka untuk berbagai proyek freelance UI/UX & Web Development..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Email Kontak</label>
                    <input
                      type="text"
                      value={formData.contactSection?.email || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, email: e.target.value },
                        })
                      }
                      placeholder="Contoh: hello@domain.com"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Teks Tombol Kirim Message</label>
                    <input
                      type="text"
                      value={formData.contactSection?.buttonText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactSection: { ...formData.contactSection, buttonText: e.target.value },
                        })
                      }
                      placeholder="Contoh: Send Message → / Kirim Pesan"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <h3 className="font-semibold text-sm text-white">Integrasi Formspree Contact Form</h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">URL Endpoint Formspree</label>
                  <input
                    type="text"
                    value={formData.footer?.formspreeUrl || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        footer: { ...formData.footer, formspreeUrl: e.target.value },
                      })
                    }
                    placeholder="Contoh: https://formspree.io/f/xeqwyz..."
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800 space-y-4">
                <h3 className="font-semibold text-sm text-white">Media Sosial Footer</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL Twitter</label>
                    <input
                      type="text"
                      value={formData.footer?.twitterUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, twitterUrl: e.target.value },
                        })
                      }
                      placeholder="Contoh: https://twitter.com/username"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL GitHub</label>
                    <input
                      type="text"
                      value={formData.footer?.githubUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, githubUrl: e.target.value },
                        })
                      }
                      placeholder="Contoh: https://github.com/username"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL LinkedIn</label>
                    <input
                      type="text"
                      value={formData.footer?.linkedinUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, linkedinUrl: e.target.value },
                        })
                      }
                      placeholder="Contoh: https://linkedin.com/in/username"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">URL Instagram</label>
                    <input
                      type="text"
                      value={formData.footer?.instagramUrl || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          footer: { ...formData.footer, instagramUrl: e.target.value },
                        })
                      }
                      placeholder="Contoh: https://instagram.com/username"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HERO & RESUME */}
          {activeTab === "hero" && (
            <div className="space-y-6 max-w-full">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4">Section Hero &amp; Resume</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Badge Status (Misal: Available for work)</label>
                  <input
                    type="text"
                    value={formData.hero?.badgeText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, badgeText: e.target.value },
                      })
                    }
                    placeholder="Contoh: Available for work / Siap Menerima Proyek"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Nama Panggilan (Warna Accent)</label>
                  <input
                    type="text"
                    value={formData.hero?.name || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, name: e.target.value },
                      })
                    }
                    placeholder="Contoh: Eliott / Nama Anda"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Teks Tombol Portofolio</label>
                  <input
                    type="text"
                    value={formData.hero?.workButtonText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, workButtonText: e.target.value },
                      })
                    }
                    placeholder="Contoh: View my work / Lihat Karya"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-800/60 rounded-2xl border border-zinc-700/60">
                <label className="block text-xs font-semibold text-accent mb-1">
                  Link Button Resume / CV (Google Drive / PDF / Web)
                </label>
                <input
                  type="text"
                  value={formData.hero?.resumeUrl || ""}
                  onChange={(e) =>
                    handleDrivePhotoChange(e.target.value, (converted) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, resumeUrl: converted },
                      })
                    )
                  }
                  placeholder="Tempel link Google Drive PDF atau link CV..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Deskripsi Singkat Bio Hero</label>
                <textarea
                  rows={3}
                  value={formData.hero?.description || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      hero: { ...formData.hero, description: e.target.value },
                    })
                  }
                  placeholder="Contoh: Freelance UI/UX Designer & Frontend Developer yang berfokus menciptakan produk digital..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                ></textarea>
              </div>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/50 space-y-3">
                <p className="text-xs font-semibold text-zinc-300">
                  Statistik Hero (Opsional — Kosongkan jika tidak ingin ditampilkan)
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Projects Done (Opsional)</label>
                    <input
                      type="text"
                      value={formData.hero?.projectsDone || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, projectsDone: e.target.value },
                        })
                      }
                      placeholder="Contoh: 34+"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Happy Clients (Opsional)</label>
                    <input
                      type="text"
                      value={formData.hero?.happyClients || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, happyClients: e.target.value },
                        })
                      }
                      placeholder="Contoh: 21+"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Experience (Opsional)</label>
                    <input
                      type="text"
                      value={formData.hero?.experienceYears || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hero: { ...formData.hero, experienceYears: e.target.value },
                        })
                      }
                      placeholder="Contoh: 5y / 3+ Thn"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-800">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Foto Profil Hero (Link Google Drive / Unsplash)
                </label>
                <input
                  type="text"
                  value={formData.hero?.profilePhoto || ""}
                  onChange={(e) =>
                    handleDrivePhotoChange(e.target.value, (converted) =>
                      setFormData({
                        ...formData,
                        hero: { ...formData.hero, profilePhoto: converted },
                      })
                    )
                  }
                  placeholder="Tempel link foto Google Drive atau Unsplash..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                />

                {formData.hero?.profilePhoto && (
                  <div className="mt-3 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden relative border border-zinc-700">
                    <Image
                      src={formData.hero.profilePhoto}
                      alt="Hero preview"
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: WHAT I DO (SERVICES) */}
          {activeTab === "services" && (
            <div className="space-y-6 max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white">What I Do</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Kelola daftar keahlian &amp; layanan dengan pilihan list ikon bebas per-box.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    // Filter out initial dummy sample services s1, s2, s3 when adding a custom service
                    const activeServices = (formData.services || []).filter(
                      (s) => s.id !== "s1" && s.id !== "s2" && s.id !== "s3"
                    );
                    const newService: ServiceItem = {
                      id: "s_" + Date.now(),
                      title: "",
                      description: "",
                      iconName: "Sparkles",
                      createdAt: new Date().toISOString(),
                    };
                    setFormData({
                      ...formData,
                      services: [newService, ...activeServices],
                    });
                  }}
                  className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-1.5 self-start sm:self-auto transition-all shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah What I Do
                </button>
              </div>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Badge Section What I Do</label>
                  <input
                    type="text"
                    value={formData.servicesSection?.badgeText || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: { ...formData.servicesSection, badgeText: e.target.value },
                      })
                    }
                    placeholder="Contoh: What I do / Keahlian"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Judul Section What I Do</label>
                  <input
                    type="text"
                    value={formData.servicesSection?.title || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        servicesSection: { ...formData.servicesSection, title: e.target.value },
                      })
                    }
                    placeholder="Contoh: What I Do / Layanan Unggulan"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {(formData.services || []).length === 0 ? (
                  <div className="p-8 text-center bg-zinc-800/20 border border-zinc-700/40 rounded-2xl text-zinc-400">
                    <p className="text-xs">Belum ada box What I Do. Klik tombol <strong>Tambah What I Do</strong> di atas untuk menambahkan.</p>
                  </div>
                ) : (
                  (formData.services || []).map((service, index) => (
                    <div
                      key={service.id || index}
                      className="bg-zinc-800/60 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm"
                    >
                      <div className="flex justify-between items-center pb-2 border-b border-zinc-700/50">
                        <span className="text-xs font-semibold text-accent">What I Do #{index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.services.filter((_, i) => i !== index);
                            setFormData({ ...formData, services: updated });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Hapus
                        </button>
                      </div>

                      {/* Icon Selection per Box */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-zinc-900/60 rounded-xl border border-zinc-700/60">
                        <div>
                          <span className="text-xs font-semibold text-zinc-200 block">Pilihan Ikon Box:</span>
                          <span className="text-[11px] text-zinc-400">Pilih ikon visual dari daftar ikon (bisa berbeda atau sama)</span>
                        </div>
                        <ServiceIconPicker
                          selectedIcon={service.iconName || "Sparkles"}
                          onSelect={(iconId) => {
                            const updated = [...formData.services];
                            updated[index].iconName = iconId;
                            setFormData({ ...formData, services: updated });
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Judul What I Do</label>
                        <input
                          type="text"
                          value={service.title || ""}
                          onChange={(e) => {
                            const updated = [...formData.services];
                            updated[index].title = e.target.value;
                            setFormData({ ...formData, services: updated });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                          placeholder="Contoh: UI/UX Design, Frontend Development"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1 font-medium">Deskripsi What I Do</label>
                        <textarea
                          rows={3}
                          value={service.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.services];
                            updated[index].description = e.target.value;
                            setFormData({ ...formData, services: updated });
                          }}
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-accent"
                          placeholder="Tuliskan rincian apa yang Anda kerjakan atau layanan yang Anda tawarkan..."
                        ></textarea>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 5: PROJECTS & PER-PROJECT CASE STUDY */}
          {activeTab === "projects" && (
            <div className="space-y-6 max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Portofolio Work &amp; Case Study per Proyek
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    // Filter out initial sample projects (finlo, orea, pulse) when user adds new project
                    const activeProjects = (formData.projects || []).filter(
                      (p) => p.id !== "finlo" && p.id !== "orea" && p.id !== "pulse"
                    );
                    const newProj: ProjectItem = {
                      id: "p_" + Date.now(),
                      title: "Judul Proyek Baru",
                      category: "research-publication",
                      categoryLabel: "Research & Publication",
                      tags: ["Project"],
                      description: "Deskripsi singkat proyek...",
                      image: "",
                      projectUrl: "",
                      createdAt: new Date().toISOString(),
                      caseStudy: {
                        title: "",
                        subtitle: "",
                        client: "",
                        role: "",
                        timeline: "",
                        deliverables: "",
                        projectUrl: "",
                      },
                    };
                    const updated = [newProj, ...activeProjects];
                    setFormData({
                      ...formData,
                      projects: updated,
                    });
                    const newTagInputs: Record<number, string> = { 0: "Project" };
                    activeProjects.forEach((p, idx) => {
                      newTagInputs[idx + 1] = tagInputs[idx] !== undefined ? tagInputs[idx] : (p.tags || []).join(", ");
                    });
                    setTagInputs(newTagInputs);
                    setExpandedProjectIndex(0);
                  }}
                  className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Proyek
                </button>
              </div>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 space-y-3">
                <h3 className="font-semibold text-sm text-white">Teks Section &amp; Halaman Portofolio</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Badge Section</label>
                    <input
                      type="text"
                      value={formData.projectsSection?.badgeText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, badgeText: e.target.value },
                        })
                      }
                      placeholder="Contoh: Portfolio / Karya"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Judul Section</label>
                    <input
                      type="text"
                      value={formData.projectsSection?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, title: e.target.value },
                        })
                      }
                      placeholder="Contoh: Selected work / Proyek Pilihan"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Link Lihat Semua</label>
                    <input
                      type="text"
                      value={formData.projectsSection?.viewAllText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, viewAllText: e.target.value },
                        })
                      }
                      placeholder="Contoh: All projects → / Semua Proyek"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Judul Halaman Semua Proyek (/projects)</label>
                    <input
                      type="text"
                      value={formData.projectsSection?.pageTitle || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, pageTitle: e.target.value },
                        })
                      }
                      placeholder="Contoh: All Projects / Portofolio Lengkap"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Deskripsi Halaman Semua Proyek</label>
                    <input
                      type="text"
                      value={formData.projectsSection?.pageSubtitle || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          projectsSection: { ...formData.projectsSection, pageSubtitle: e.target.value },
                        })
                      }
                      placeholder="Contoh: Kumpulan proyek terbaik yang pernah saya buat..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-w-full">
                {(formData.projects || []).map((project, index) => {
                  const isExpanded = expandedProjectIndex === index;
                  const cs = project.caseStudy || {};

                  return (
                    <div
                      key={project.id || index}
                      className="bg-zinc-800/60 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-4 max-w-full"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-accent truncate">Proyek #{index + 1}: {project.title || "Tanpa Judul"}</span>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedProjectIndex(isExpanded ? null : index)
                            }
                            className="text-xs text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isExpanded ? "Tutup Edit Case Study" : "Edit Detail Case Study"}</span>
                            <span className="sm:hidden">{isExpanded ? "Tutup Detail" : "Edit Detail"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.projects.filter((_, i) => i !== index);
                              setFormData({ ...formData, projects: updated });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Judul Proyek</label>
                          <input
                            type="text"
                            value={project.title || ""}
                            onChange={(e) => {
                              const updated = [...formData.projects];
                              updated[index].title = e.target.value;
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="Contoh: Finlo — Personal Finance Dashboard"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">Kategori Filter</label>
                          <select
                            value={project.category || "research-publication"}
                            onChange={(e) => {
                              const updated = [...formData.projects];
                              const cat = e.target.value;
                              const categoryLabelMap: Record<string, string> = {
                                "research-publication": "Research & Publication",
                                "copyright": "Copyright",
                                "graphic-design": "Graphic Design",
                                "video-editing": "Video Editing",
                                "community-service": "Community Service",
                                "research-innovation": "Research Innovation",
                                "book-writing": "Book Writing",
                                "competition": "Competition",
                                "volunteer": "Volunteer",
                                "webapp": "Web App",
                                "uiux": "UI/UX Design",
                                "mobile": "Mobile App",
                              };
                              updated[index].category = cat;
                              updated[index].categoryLabel = categoryLabelMap[cat] || cat;
                              setFormData({ ...formData, projects: updated });
                            }}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white"
                          >
                            <option value="research-publication">Research & Publication</option>
                            <option value="copyright">Copyright</option>
                            <option value="graphic-design">Graphic Design</option>
                            <option value="video-editing">Video Editing</option>
                            <option value="community-service">Community Service</option>
                            <option value="research-innovation">Research Innovation</option>
                            <option value="book-writing">Book Writing</option>
                            <option value="competition">Competition</option>
                            <option value="volunteer">Volunteer</option>
                            <option value="webapp">Web App (Legacy)</option>
                            <option value="uiux">UI/UX Design (Legacy)</option>
                            <option value="mobile">Mobile App (Legacy)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">
                          Tag Proyek (Pisahkan dengan koma, contoh: SaaS, Figma, Tailwind)
                        </label>
                        <input
                          type="text"
                          value={tagInputs[index] !== undefined ? tagInputs[index] : (project.tags || []).join(", ")}
                          onChange={(e) => {
                            const raw = e.target.value;
                            setTagInputs((prev) => ({ ...prev, [index]: raw }));
                            const tagArray = raw.split(",").map((t) => t.trim()).filter(Boolean);
                            const updated = [...formData.projects];
                            updated[index].tags = tagArray;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="Contoh: SaaS, Figma, Tailwind CSS"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-zinc-400 mb-1">Deskripsi Proyek</label>
                        <textarea
                          rows={2}
                          value={project.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.projects];
                            updated[index].description = e.target.value;
                            setFormData({ ...formData, projects: updated });
                          }}
                          placeholder="Tuliskan deskripsi ringkas tentang proyek ini..."
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-zinc-400 mb-1">
                            Link Sampul Foto Proyek (Google Drive / Unsplash)
                          </label>
                          <input
                            type="text"
                            value={project.image || ""}
                            onChange={(e) => {
                              const converted = convertGoogleDriveUrl(e.target.value);
                              const updated = [...formData.projects];
                              updated[index].image = converted;
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="Tempel link foto Google Drive atau Unsplash..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-zinc-400 mb-1 flex items-center justify-between">
                            <span>Link Situs Proyek Lengkap (Opsional)</span>
                            <span className="text-[10px] text-accent bg-accent-subtle px-1.5 py-0.5 rounded border border-accent/20">Live Demo / Web</span>
                          </label>
                          <input
                            type="url"
                            value={project.projectUrl || ""}
                            onChange={(e) => {
                              const updated = [...formData.projects];
                              updated[index].projectUrl = e.target.value;
                              if (updated[index].caseStudy) {
                                updated[index].caseStudy = {
                                  ...updated[index].caseStudy,
                                  projectUrl: e.target.value,
                                };
                              }
                              setFormData({ ...formData, projects: updated });
                            }}
                            placeholder="Contoh: https://myproject.com atau https://github.com/..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                          />
                        </div>
                      </div>

                      {/* SUB-EDITOR: Per-Project Case Study */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-zinc-700/80 space-y-4 bg-zinc-900/90 p-3.5 sm:p-4 rounded-xl max-w-full">
                          <h4 className="font-semibold text-sm text-accent">
                            Detail Case Study untuk Proyek &quot;{project.title || "Baru"}&quot;
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Judul Case Study (Opsional)</label>
                              <input
                                type="text"
                                value={cs.title || ""}
                                onChange={(e) => {
                                  const updated = [...formData.projects];
                                  updated[index].caseStudy = {
                                    ...(updated[index].caseStudy || {}),
                                    title: e.target.value,
                                  };
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Biarkan kosong untuk memakai Judul Proyek"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Client Name (Opsional)</label>
                              <input
                                type="text"
                                value={cs.client || ""}
                                onChange={(e) => {
                                  const updated = [...formData.projects];
                                  updated[index].caseStudy = {
                                    ...(updated[index].caseStudy || {}),
                                    client: e.target.value,
                                  };
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Contoh: PT ABC / Kosongkan jika tidak ada"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Role (Opsional)</label>
                              <input
                                type="text"
                                value={cs.role || ""}
                                onChange={(e) => {
                                  const updated = [...formData.projects];
                                  updated[index].caseStudy = {
                                    ...(updated[index].caseStudy || {}),
                                    role: e.target.value,
                                  };
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Contoh: Lead Product Designer & Frontend Developer"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Timeline (Opsional)</label>
                              <input
                                type="text"
                                value={cs.timeline || ""}
                                onChange={(e) => {
                                  const updated = [...formData.projects];
                                  updated[index].caseStudy = {
                                    ...(updated[index].caseStudy || {}),
                                    timeline: e.target.value,
                                  };
                                  setFormData({ ...formData, projects: updated });
                                }}
                                placeholder="Contoh: 4 minggu / 6 weeks"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Sub-Judul Case Study (Opsional)</label>
                            <textarea
                              rows={2}
                              value={cs.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...formData.projects];
                                updated[index].caseStudy = {
                                  ...(updated[index].caseStudy || {}),
                                  subtitle: e.target.value,
                                };
                                setFormData({ ...formData, projects: updated });
                              }}
                              placeholder="Biarkan kosong untuk memakai Deskripsi Proyek"
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Foto Hero Case Study (Google Drive Link)</label>
                            <input
                              type="text"
                              value={cs.heroImage || ""}
                              onChange={(e) => {
                                const converted = convertGoogleDriveUrl(e.target.value);
                                const updated = [...formData.projects];
                                updated[index].caseStudy = {
                                  ...(updated[index].caseStudy || {}),
                                  heroImage: converted,
                                };
                                setFormData({ ...formData, projects: updated });
                              }}
                              placeholder="Tempel link banner Google Drive / Unsplash..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Isi Brief Proyek</label>
                            <textarea
                              rows={3}
                              value={cs.briefContent1 || ""}
                              onChange={(e) => {
                                const updated = [...formData.projects];
                                updated[index].caseStudy = {
                                  ...(updated[index].caseStudy || {}),
                                  briefContent1: e.target.value,
                                };
                                setFormData({ ...formData, projects: updated });
                              }}
                              placeholder="Tuliskan latar belakang masalah, tujuan, dan solusi dari proyek ini..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                            ></textarea>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: ABOUT */}
          {activeTab === "about" && (
            <div className="space-y-6 max-w-full">
              <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-4">Section About Me</h2>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Judul Section</label>
                <input
                  type="text"
                  value={formData.about?.title || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, title: e.target.value },
                    })
                  }
                  placeholder="Contoh: Crafting digital experiences with precision & care"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-500"
                />
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Paragraf 1</label>
                <textarea
                  rows={3}
                  value={formData.about?.bioParagraph1 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, bioParagraph1: e.target.value },
                    })
                  }
                  placeholder="Tuliskan paragraf pertama tentang latar belakang, pengalaman, dan keahlian Anda..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">Paragraf 2</label>
                <textarea
                  rows={3}
                  value={formData.about?.bioParagraph2 || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      about: { ...formData.about, bioParagraph2: e.target.value },
                    })
                  }
                  placeholder="Tuliskan paragraf kedua tentang pendekatan kerja, filosofi desain, atau minat Anda..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                ></textarea>
              </div>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 space-y-4">
                <h3 className="font-semibold text-sm text-white">Stack &amp; Tools / Skills Sub-section</h3>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Judul Sub-section Stack</label>
                  <input
                    type="text"
                    value={formData.about?.stackTitle || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, stackTitle: e.target.value },
                      })
                    }
                    placeholder="Contoh: Stack & tools / Keahlian Teknis"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1">
                    Daftar Skill / Stack (Pisahkan dengan koma)
                  </label>
                  <input
                    type="text"
                    value={stackInput !== "" ? stackInput : (formData.about?.stack || []).join(", ")}
                    onChange={(e) => {
                      const raw = e.target.value;
                      setStackInput(raw);
                      const stackArray = raw.split(",").map((s) => s.trim()).filter(Boolean);
                      setFormData({
                        ...formData,
                        about: { ...formData.about, stack: stackArray },
                      });
                    }}
                    placeholder="Contoh: Next.js, React, TypeScript, Tailwind CSS, Figma"
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-zinc-400 mb-1">
                  Foto About (Google Drive / Unsplash Link)
                </label>
                <input
                  type="text"
                  value={formData.about?.photo || ""}
                  onChange={(e) =>
                    handleDrivePhotoChange(e.target.value, (converted) =>
                      setFormData({
                        ...formData,
                        about: { ...formData.about, photo: converted },
                      })
                    )
                  }
                  placeholder="Tempel link foto Google Drive atau Unsplash..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500"
                />
              </div>
            </div>
          )}

          {/* TAB 7: BLOG & PER-ARTICLE DETAIL */}
          {activeTab === "blog" && (
            <div className="space-y-6 max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-display text-lg sm:text-xl font-bold text-white">
                  Katalog &amp; Detail Blog per Artikel
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    // Filter out sample blog articles when adding a new article
                    const activeBlog = (formData.blog || []).filter(
                      (b) =>
                        b.id !== "design-systems-2025" &&
                        b.id !== "nextjs-15-performance" &&
                        b.id !== "ui-micro-interactions"
                    );
                    const newBlog: BlogItem = {
                      id: "b_" + Date.now(),
                      title: "Judul Artikel Baru",
                      category: "dev",
                      categoryLabel: "Dev",
                      date: new Date().toLocaleDateString("id-ID", { month: "long", year: "numeric" }),
                      createdAt: new Date().toISOString(),
                      excerpt: "Ringkasan isi artikel...",
                      image: "",
                      articleDetail: {
                        title: "Judul Artikel Lengkap",
                        subtitle: "Sub-judul artikel...",
                        authorName: formData.hero?.name || "Penulis",
                        authorRole: formData.hero?.description?.slice(0, 40) || "Author",
                        readTime: "3 min read",
                        paragraphs: ["Paragraf pertama isi artikel..."],
                      },
                    };
                    const updated = [newBlog, ...activeBlog];
                    setFormData({
                      ...formData,
                      blog: updated,
                    });
                    setExpandedBlogIndex(0);
                  }}
                  className="bg-accent text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" /> Tambah Artikel
                </button>
              </div>

              <div className="p-4 bg-zinc-800/40 rounded-2xl border border-zinc-700/60 space-y-3">
                <h3 className="font-semibold text-sm text-white">Teks Section &amp; Halaman Blog</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Badge Section</label>
                    <input
                      type="text"
                      value={formData.blogSection?.badgeText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blogSection: { ...formData.blogSection, badgeText: e.target.value },
                        })
                      }
                      placeholder="Contoh: Thoughts / Artikel"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Judul Section</label>
                    <input
                      type="text"
                      value={formData.blogSection?.title || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blogSection: { ...formData.blogSection, title: e.target.value },
                        })
                      }
                      placeholder="Contoh: From the blog / Artikel Terbaru"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Link Lihat Semua</label>
                    <input
                      type="text"
                      value={formData.blogSection?.viewAllText || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blogSection: { ...formData.blogSection, viewAllText: e.target.value },
                        })
                      }
                      placeholder="Contoh: All articles → / Semua Artikel"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Judul Halaman Blog (/blog)</label>
                    <input
                      type="text"
                      value={formData.blogSection?.pageTitle || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blogSection: { ...formData.blogSection, pageTitle: e.target.value },
                        })
                      }
                      placeholder="Contoh: The Blog / Artikel & Tulisan"
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-zinc-400 mb-1">Deskripsi Halaman Blog</label>
                    <input
                      type="text"
                      value={formData.blogSection?.pageSubtitle || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          blogSection: { ...formData.blogSection, pageSubtitle: e.target.value },
                        })
                      }
                      placeholder="Contoh: Berbagi wawasan seputar UI/UX, teknologi web, dan pengembangan..."
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6 max-w-full">
                {(formData.blog || []).map((article, index) => {
                  const isExpanded = expandedBlogIndex === index;
                  const ad = article.articleDetail || {};

                  return (
                    <div
                      key={article.id || index}
                      className="bg-zinc-800/60 border border-zinc-700/80 rounded-2xl p-4 sm:p-5 space-y-4 max-w-full"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-accent truncate">Artikel #{index + 1}: {article.title || "Tanpa Judul"}</span>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedBlogIndex(isExpanded ? null : index)
                            }
                            className="text-xs text-zinc-300 hover:text-white bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-lg flex items-center gap-1"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isExpanded ? "Tutup Edit Detail Artikel" : "Edit Isi Lengkap Artikel"}</span>
                            <span className="sm:hidden">{isExpanded ? "Tutup Detail" : "Edit Detail"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formData.blog.filter((_, i) => i !== index);
                              setFormData({ ...formData, blog: updated });
                            }}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>

                      <input
                        type="text"
                        value={article.title || ""}
                        onChange={(e) => {
                          const updated = [...formData.blog];
                          updated[index].title = e.target.value;
                          setFormData({ ...formData, blog: updated });
                        }}
                        placeholder="Contoh: Building Design Systems That Engineers Actually Enjoy Using"
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-sm text-white placeholder-zinc-500"
                      />

                      <div>
                        <label className="block text-[11px] text-zinc-400 mb-1">Tanggal Publikasi</label>
                        <input
                          type="text"
                          value={article.date || ""}
                          onChange={(e) => {
                            const updated = [...formData.blog];
                            updated[index].date = e.target.value;
                            if (updated[index].articleDetail) {
                              updated[index].articleDetail = {
                                ...updated[index].articleDetail,
                                date: e.target.value,
                              };
                            }
                            setFormData({ ...formData, blog: updated });
                          }}
                          placeholder="Contoh: March 2025 / 21 Agustus 2026"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                        />
                      </div>

                      <textarea
                        rows={2}
                        value={article.excerpt || ""}
                        onChange={(e) => {
                          const updated = [...formData.blog];
                          updated[index].excerpt = e.target.value;
                          setFormData({ ...formData, blog: updated });
                        }}
                        placeholder="Tuliskan ringkasan isi artikel (excerpt) yang menarik pembaca..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                      ></textarea>

                      <input
                        type="text"
                        value={article.image || ""}
                        onChange={(e) => {
                          const converted = convertGoogleDriveUrl(e.target.value);
                          const updated = [...formData.blog];
                          updated[index].image = converted;
                          setFormData({ ...formData, blog: updated });
                        }}
                        placeholder="Tempel link gambar thumbnail (Google Drive / Unsplash)..."
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500"
                      />

                      {/* SUB-EDITOR: Per-Article Detail Content */}
                      {isExpanded && (
                        <div className="pt-4 border-t border-zinc-700/80 space-y-4 bg-zinc-900/90 p-3.5 sm:p-4 rounded-xl max-w-full">
                          <h4 className="font-semibold text-sm text-accent">
                            Isi Lengkap Artikel &quot;{article.title || "Baru"}&quot;
                          </h4>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Nama Penulis</label>
                              <input
                                type="text"
                                value={ad.authorName || ""}
                                onChange={(e) => {
                                  const updated = [...formData.blog];
                                  updated[index].articleDetail = {
                                    ...(updated[index].articleDetail || {}),
                                    authorName: e.target.value,
                                  };
                                  setFormData({ ...formData, blog: updated });
                                }}
                                placeholder="Contoh: John Doe / Penulis"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Jabatan Penulis</label>
                              <input
                                type="text"
                                value={ad.authorRole || ""}
                                onChange={(e) => {
                                  const updated = [...formData.blog];
                                  updated[index].articleDetail = {
                                    ...(updated[index].articleDetail || {}),
                                    authorRole: e.target.value,
                                  };
                                  setFormData({ ...formData, blog: updated });
                                }}
                                placeholder="Contoh: UI/UX Designer & Frontend Dev"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] text-zinc-400 mb-1">Waktu Baca (Read Time)</label>
                              <input
                                type="text"
                                value={ad.readTime || ""}
                                onChange={(e) => {
                                  const updated = [...formData.blog];
                                  updated[index].articleDetail = {
                                    ...(updated[index].articleDetail || {}),
                                    readTime: e.target.value,
                                  };
                                  setFormData({ ...formData, blog: updated });
                                }}
                                placeholder="Contoh: 5 min read / 4 menit baca"
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Sub-Judul Artikel Detail</label>
                            <textarea
                              rows={2}
                              value={ad.subtitle || ""}
                              onChange={(e) => {
                                const updated = [...formData.blog];
                                updated[index].articleDetail = {
                                  ...(updated[index].articleDetail || {}),
                                  subtitle: e.target.value,
                                };
                                setFormData({ ...formData, blog: updated });
                              }}
                              placeholder="Contoh: Sub-judul atau ringkasan pembuka artikel..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">Kutipan Penting (Quote)</label>
                            <textarea
                              rows={2}
                              value={ad.quoteText || ""}
                              onChange={(e) => {
                                const updated = [...formData.blog];
                                updated[index].articleDetail = {
                                  ...(updated[index].articleDetail || {}),
                                  quoteText: e.target.value,
                                };
                                setFormData({ ...formData, blog: updated });
                              }}
                              placeholder="Contoh: Kutipan inspiratif atau inti pokok artikel ini..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500"
                            ></textarea>
                          </div>

                          <div>
                            <label className="block text-[11px] text-zinc-400 mb-1">
                              Isi Paragraf Artikel (Tekan Enter dua kali untuk paragraf baru)
                            </label>
                            <textarea
                              rows={6}
                              value={
                                paragraphInputs[index] !== undefined
                                  ? paragraphInputs[index]
                                  : (ad.paragraphs || []).join("\n\n")
                              }
                              onChange={(e) => {
                                const raw = e.target.value;
                                setParagraphInputs((prev) => ({ ...prev, [index]: raw }));
                                const paras = raw
                                  .split("\n")
                                  .map((p) => p.trim())
                                  .filter(Boolean);
                                const updated = [...formData.blog];
                                updated[index].articleDetail = {
                                  ...(updated[index].articleDetail || {}),
                                  paragraphs: paras,
                                };
                                setFormData({ ...formData, blog: updated });
                              }}
                              placeholder="Tulis paragraf pertama di sini...&#10;&#10;Tulis paragraf kedua di sini..."
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white placeholder-zinc-500 leading-relaxed font-sans"
                            ></textarea>
                            <p className="text-[11px] text-zinc-500 mt-1">
                              Sistem otomatis memberikan spasi bawah rapi antar paragraf di halaman blog.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: BLOG COMMENTS MANAGEMENT */}
          {activeTab === "comments" && (
            <div className="space-y-6 max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-1">
                    Moderasi &amp; Manajemen Komentar Blog
                  </h2>
                  <p className="text-xs text-zinc-400">
                    Kelola dan moderasi seluruh komentar publik yang masuk ke artikel blog Anda. Komentar yang dihapus akan terhapus permanen dari Firestore.
                  </p>
                </div>
                <div className="text-xs bg-zinc-800 border border-zinc-700 px-3 py-1.5 rounded-xl text-zinc-300 self-start sm:self-auto">
                  Total Komentar: <span className="font-bold text-accent">{allComments.length}</span>
                </div>
              </div>

              {allComments.length === 0 ? (
                <div className="p-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl text-center space-y-2">
                  <MessageSquare className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="text-sm text-zinc-400 font-medium">Belum ada komentar dari pengunjung.</p>
                  <p className="text-xs text-zinc-500">Komentar publik yang dikirim pengunjung pada halaman artikel blog akan muncul di sini secara real-time.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allComments.map((comment) => {
                    const article = (formData.blog || []).find((b) => b.id === comment.articleId);
                    const articleTitle = article?.title || comment.articleId || "Artikel Umum";

                    return (
                      <div
                        key={comment.id}
                        className="bg-zinc-800/60 border border-zinc-700/70 rounded-2xl p-4 sm:p-5 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-700/50 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                              {comment.authorName ? comment.authorName.charAt(0).toUpperCase() : "U"}
                            </div>
                            <div>
                              <span className="font-semibold text-sm text-white">{comment.authorName}</span>
                              <span className="text-[11px] text-zinc-400 ml-2">
                                {comment.createdAt
                                  ? new Date(comment.createdAt).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-[11px] bg-zinc-900 text-zinc-400 border border-zinc-700 px-2.5 py-1 rounded-lg truncate max-w-[200px]">
                              {articleTitle}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteComment(comment.id)}
                              disabled={deletingCommentId === comment.id}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{deletingCommentId === comment.id ? "Menghapus..." : "Hapus Komentar"}</span>
                            </button>
                          </div>
                        </div>

                        <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap pl-1">
                          {comment.content}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 8: SECURITY & PASSWORD CHANGE */}
          {activeTab === "security" && (
            <div className="space-y-6 max-w-full">
              <div>
                <h2 className="font-display text-lg sm:text-xl font-bold text-white mb-1">Keamanan &amp; Ubah Password Admin</h2>
                <p className="text-xs text-zinc-400">
                  Ubah password akun Firebase Admin Anda secara berkala untuk menjaga keamanan portal dashboard.
                </p>
              </div>

              {passError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 sm:p-4 rounded-2xl text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3.5 sm:p-4 rounded-2xl text-xs flex items-center gap-2.5">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>Password Admin berhasil diperbarui! Gunakan password baru untuk login berikutnya.</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Password Baru</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showNewPassword ? "text" : "password"}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimal 6 karakter"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Toggle password visibility"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Konfirmasi Password Baru</label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Ketik ulang password baru"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-11 pr-11 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-accent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="shimmer bg-accent text-white font-medium text-xs py-3 px-6 rounded-xl hover:bg-accent-light transition-colors mt-2 disabled:opacity-50 flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {isChangingPass ? "Memperbarui..." : "Ubah Password Admin"}
                </button>
              </form>

              {/* DATABASE BACKUP & RESTORE (JSON EXPORT / IMPORT) */}
              <div className="mt-8 pt-8 border-t border-zinc-800 space-y-4">
                <div>
                  <h3 className="font-display text-base sm:text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Database className="w-5 h-5 text-accent" />
                    Backup &amp; Pemulihan Database (database.json)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Ekspor seluruh data website (isi konten, portofolio, artikel, statistik, dan komentar) ke file <code className="text-accent bg-zinc-800 px-1.5 py-0.5 rounded font-mono">database.json</code> sebagai cadangan, atau impor file JSON untuk memulihkan seluruh data website Anda.
                  </p>
                </div>

                {dbActionError && (
                  <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 sm:p-4 rounded-2xl text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{dbActionError}</span>
                  </div>
                )}

                {dbActionSuccess && (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-3.5 sm:p-4 rounded-2xl text-xs flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>{dbActionSuccess}</span>
                  </div>
                )}

                {/* Hidden File Input for JSON Upload */}
                <input
                  type="file"
                  ref={dbFileInputRef}
                  onChange={handleImportDatabase}
                  accept=".json,application/json"
                  className="hidden"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* EXPORT / DOWNLOAD CARD */}
                  <div className="p-4 sm:p-5 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors rounded-2xl border border-zinc-700/60 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-accent-subtle flex items-center justify-center text-accent mb-2">
                        <Download className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-white">Download database.json</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Unduh seluruh dokumen Firestore saat ini menjadi file database.json lokal di komputer Anda.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadDatabase}
                      disabled={isExportingDb}
                      className="shimmer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 w-full"
                    >
                      <Download className="w-4 h-4 text-accent" />
                      <span>{isExportingDb ? "Mengekspor JSON..." : "Download database.json"}</span>
                    </button>
                  </div>

                  {/* IMPORT / UPLOAD CARD */}
                  <div className="p-4 sm:p-5 bg-zinc-800/40 hover:bg-zinc-800/60 transition-colors rounded-2xl border border-zinc-700/60 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2">
                        <Upload className="w-4 h-4" />
                      </div>
                      <h4 className="font-semibold text-sm text-white">Import / Upload database.json</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        Pulihkan atau unggah data website dari file database.json yang telah Anda simpan sebelumnya.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => dbFileInputRef.current?.click()}
                      disabled={isImportingDb}
                      className="shimmer bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 w-full"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{isImportingDb ? "Mengimpor Data..." : "Upload & Import database.json"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
