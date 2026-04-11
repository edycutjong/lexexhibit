import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LexExhibit | Court-Admissible Blockchain Analytics",
  description: "Translate complex DeFi wallet histories into court-admissible legal affidavits in one click.",
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
                <span className="text-amber-500">Lex</span>Exhibit
             </Link>
             <nav className="text-sm font-medium text-zinc-400 flex gap-6">
                <a href="https://github.com/edycutjong/LexExhibit#%E2%9A%99%EF%B8%8F-how-we-built-it" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">How it works</a>
                <a href="mailto:demo@lexexhibit.ai?subject=LexExhibit Pricing" className="hover:text-white transition-colors">Pricing</a>
                <a href="mailto:demo@lexexhibit.ai?subject=Enterprise Law Firm Setup" className="hover:text-white transition-colors">For Law Firms</a>
             </nav>
          </div>
        </header>
        <main className="max-w-7xl mx-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
