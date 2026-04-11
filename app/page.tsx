'use client';

import { WalletInput } from "@/components/WalletInput";
import { Scale } from "lucide-react";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8 px-4 text-center relative overflow-hidden">
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
         {/* Ping circle */}
         <div className="absolute inset-0 rounded-full border border-amber-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
      </motion.div>
      
      <motion.h1 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
        className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6 drop-shadow-lg"
      >
        Etherscan isn&apos;t <span className="text-transparent bg-clip-text bg-linear-to-r from-amber-400 via-yellow-500 to-amber-600 drop-shadow-[0_0_20px_rgba(245,158,11,0.2)]">admissible</span> in court.
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto mb-12 font-light"
      >
        Translate complex DeFi wallet histories into beautifully formatted, 
        court-ready legal affidavits in under 15 seconds.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="w-full relative z-10"
      >
        <WalletInput />
      </motion.div>
    </div>
  );
}
