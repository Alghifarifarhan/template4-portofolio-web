import type { Metadata } from "next";
import { PT_Sans, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/context/AuthContext";
import { SiteProvider } from "@/context/SiteContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ScrollReveal } from "@/components/ScrollReveal";

const ptSans = PT_Sans({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio.web.app"),
  title: "Portfolio",
  description: "Personal Portfolio & Showcase",
  keywords: ["portfolio", "showcase", "projects", "developer", "designer"],
  icons: {
    icon: "/image/olifyhub.png",
    shortcut: "/image/olifyhub.png",
    apple: "/image/olifyhub.png",
  },
  openGraph: {
    title: "Portfolio",
    description: "Personal Portfolio & Showcase",
    url: process.env.NEXT_PUBLIC_SITE_URL || "https://your-portfolio.web.app",
    siteName: "Portfolio",
    type: "website",
    images: [
      {
        url: "/image/olifyhub.png",
        width: 512,
        height: 512,
        alt: "Portfolio Icon",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Portfolio",
    description: "Personal Portfolio & Showcase",
    images: ["/image/olifyhub.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${ptSans.variable} ${dmSans.variable} scroll-smooth dark`}>
      <head>
        <link rel="icon" type="image/png" href="/image/olifyhub.png" />
        <link rel="apple-touch-icon" href="/image/olifyhub.png" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var d = localStorage.getItem("portfolio_site_data");
                  if (d) {
                    var p = JSON.parse(d);
                    if (p.themeMode === "light") {
                      document.documentElement.classList.remove("dark");
                    } else {
                      document.documentElement.classList.add("dark");
                    }
                    if (p.accentColor) {
                      document.documentElement.style.setProperty("--color-accent", p.accentColor);
                    }
                  } else {
                    document.documentElement.classList.add("dark");
                  }
                  document.documentElement.classList.add("hydrated");
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-body antialiased min-h-screen flex flex-col justify-between">
        <AuthProvider>
          <SiteProvider>
            <ThemeProvider>
              <Header />
              <ScrollReveal />
              <div className="flex-1">{children}</div>
              <Footer />
            </ThemeProvider>
          </SiteProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
