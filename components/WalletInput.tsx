'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader2, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function WalletInput({
  className,
}: {
  className?: string;
}) {
  const [address, setAddress] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lexexhibit-history');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved) setHistory(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return;
    
    // Save to history
    const updatedHistory = Array.from(new Set([address, ...history])).slice(0, 3);
    setHistory(updatedHistory);
    localStorage.setItem('lexexhibit-history', JSON.stringify(updatedHistory));

    setIsScanning(true);
    // Simulate a scan delay for effect
    setTimeout(() => {
      // In a real flow, it might POST to /api/scan, but we'll 
      // navigate to the investigate dashboard where the scan will take place.
      router.push(`/investigate?wallet=${encodeURIComponent(address)}`);
    }, 1500);
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto space-y-4", className)}>
      <form onSubmit={handleScan} className="relative group z-10">
        <div className="absolute -inset-0.5 bg-linear-to-r from-blue-500 to-amber-500 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-zinc-900 rounded-lg ring-1 ring-white/10 overflow-hidden">
          <div className="pl-4 pr-2 text-zinc-500">
            {isScanning ? (
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 py-4 px-2 tracking-wider"
            placeholder="Search Ethereum wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isScanning}
          />
          <button
            type="submit"
            disabled={!address || isScanning}
            className="bg-amber-600 hover:bg-amber-500 text-white font-medium px-6 py-4 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Investigate
          </button>
        </div>
      </form>
      
      <div className="flex flex-col items-center justify-center relative z-10 mt-6 pt-4 border-t border-white/5">
        <p className="text-xs text-zinc-500 mb-3">
          Quick start with demo wallets:
        </p>
        <div className="flex gap-3">
          <button 
            type="button"
            onClick={() => setAddress('0x098B716B8Aaf21512996dC57EB0615e2383E2f96')}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-amber-400 border border-zinc-700 transition-colors"
          >
            0x098B716... (Guilty: Bridge Exploiter)
          </button>
          <button 
            type="button"
            onClick={() => setAddress('0xInnocentUser1234567890abcdef1234567890a')}
            className="text-xs px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-emerald-400 border border-zinc-700 transition-colors"
          >
            0xInnocent... (Clean: Retail Trader)
          </button>
        </div>

        {history.length > 0 && (
          <div className="mt-8 w-full">
            <div className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-wider mb-3 justify-center">
              <History className="w-3 h-3" />
              <span>Recent Investigations</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {history.map((h) => (
                <button
                  key={h}
                  type="button"
                  onClick={() => setAddress(h)}
                  className="text-xs px-3 py-1.5 rounded-full bg-zinc-900 border border-white/10 hover:border-amber-500/50 hover:text-amber-400 text-zinc-400 transition-colors truncate max-w-[200px]"
                  title={h}
                >
                  {h.slice(0, 6)}...{h.slice(-4)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* WOW PAGE TRANSITION OVERLAY */}
      {isScanning && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-zinc-950/90 backdrop-blur-xl">
          {/* Sweeping laser line */}
          <motion.div
            initial={{ top: "-10%" }}
            animate={{ top: "110%" }}
            transition={{ duration: 1.5, ease: "linear" }}
            className="absolute left-0 right-0 w-full h-[150px] bg-linear-to-b from-transparent to-amber-500/20 border-b-2 border-amber-500 pointer-events-none"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1.2 }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
            className="mb-6 relative"
          >
            <div className="absolute inset-0 bg-amber-500 blur-xl opacity-30 rounded-full"></div>
            <Search className="w-20 h-20 text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] relative z-10" />
          </motion.div>

          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-4xl font-mono text-amber-400 font-bold tracking-[0.3em] uppercase drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]"
          >
            TRACING ASSETS
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-zinc-400 mt-4 font-mono animate-pulse"
          >
            Decrypting transaction graph layers...
          </motion.p>
        </div>
      )}
    </div>
  );
}
