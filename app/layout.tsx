import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LexExhibit | Court-Admissible Blockchain Analytics",
  description: "Translate complex DeFi wallet histories into court-admissible legal affidavits in one click.",
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "LexExhibit | Court-Admissible Blockchain Analytics",
    description: "Translate complex DeFi wallet histories into court-admissible legal affidavits in one click.",
    url: "https://lexexhibit.edycu.dev",
    siteName: "LexExhibit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "LexExhibit Forensic Analytics",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LexExhibit | Court-Admissible Blockchain Analytics",
    description: "Translate complex DeFi wallet histories into court-admissible legal affidavits in one click.",
    images: ["/og-image.png"],
  },
  themeColor: "#f59e0b",
};

import Link from "next/link";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.className} bg-zinc-950 text-zinc-50 min-h-screen selection:bg-amber-500/30 selection:text-amber-200`}>
        <header className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
             <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity">
                <Image src="/icon.png" alt="LexExhibit Logo" width={32} height={32} className="w-8 h-8" />
                <span><span className="text-amber-500">Lex</span>Exhibit</span>
             </Link>

          </div>
        </header>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
