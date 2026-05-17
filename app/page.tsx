'use client';

import { WalletInput } from "@/components/WalletInput";
import { Scale, AlertTriangle, DollarSign, Clock } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { motion } from "framer-motion";
import Link from "next/link";

const DEMO_WALLET = '0x098B716B8Aaf21512996dC57EB0615e2383E2f96';

const STATS = [
  { icon: DollarSign, value: '$35B+', label: 'in crypto hidden in divorce cases annually' },
  { icon: DollarSign, value: '$400/hr', label: 'avg. forensic blockchain expert rate' },
  { icon: Clock,       value: '<15s',   label: 'wallet to court-ready affidavit' },
];

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 text-center relative overflow-hidden">
      <AnimatedBackground />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 p-5 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md relative"
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Scale className="w-14 h-14 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]" />
        </motion.div>
        <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg"
      >
        Etherscan isn&apos;t{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          admissible
        </span>{' '}
        in court.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-8 font-light"
      >
        Translate complex DeFi wallet histories into beautifully formatted,
        court-ready legal affidavits in under 15 seconds.
      </motion.p>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="flex flex-wrap justify-center gap-6 mb-10"
      >
        {STATS.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-2.5 px-4 py-2.5 bg-zinc-900/60 border border-white/5 rounded-xl backdrop-blur-sm">
            <Icon className="w-4 h-4 text-amber-500 shrink-0" />
            <div className="text-left">
              <span className="text-sm font-bold text-white font-mono">{value}</span>
              <span className="text-xs text-zinc-500 ml-2">{label}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Wallet input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full relative z-10"
      >
        <WalletInput />
      </motion.div>

      {/* Demo shortcut */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-6 flex items-center gap-2 text-sm"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        <span className="text-zinc-600">No wallet?</span>
        <Link
          href={`/investigate?wallet=${DEMO_WALLET}`}
          className="text-amber-500 hover:text-amber-400 font-medium transition-colors underline underline-offset-2"
        >
          Run the Ronin Bridge exploit demo
        </Link>
      </motion.div>
    </div>
  );
}
