"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Banknote, Activity, ChevronRight, ChevronLeft, Target } from 'lucide-react';
import { Transaction } from '@/lib/tx-classifier';

interface FundFlowDiagramProps {
  transactions: Transaction[];
}

export const FundFlowDiagram: React.FC<FundFlowDiagramProps> = ({ transactions }) => {
  const [focusedIndex, setFocusedIndex] = useState(0);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  // Automatically scroll focused node into view
  useEffect(() => {
    if (nodesRef.current[focusedIndex]) {
       nodesRef.current[focusedIndex]?.scrollTo({
           behavior: 'smooth',
           left: 0
       });
       // Alternative for JSDOM where scrollTo might be limited
       nodesRef.current[focusedIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
  }, [focusedIndex]);

  if (!transactions || transactions.length === 0) return null;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mixer_interaction': return <span className="text-amber-500 w-7 h-7" data-testid="icon-ShieldCheck" />;
      case 'swap': return <span className="text-emerald-500 w-7 h-7" data-testid="icon-ArrowUpRight" />;
      case 'bridge': return <span className="text-blue-500 w-7 h-7" data-testid="icon-ArrowUpRight" />;
      default: return <span className="text-zinc-500 w-7 h-7" data-testid="icon-Target" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'mixer_interaction': return 'Mixer (Tornado)';
      case 'swap': return 'DEX Swap';
      case 'bridge': return 'Bridge Contract';
      default: return 'Wallet';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="w-full bg-zinc-950/50 border border-white/5 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
      {/* Background patterns */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.1),transparent_50%)]" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
              <ShieldCheck className="text-amber-500 w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Forensic Wallet Trace</h2>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
                <p className="text-zinc-400 font-mono text-xs break-all tracking-wider">{transactions[0].from}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-500" />
                Total Suspect Value
              </p>
              <p className="text-3xl text-emerald-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                ${Math.floor(transactions.reduce((acc, tx) => acc + parseFloat(tx.value) * 3000, 0)).toLocaleString()}
              </p>
            </div>
            <div className="bg-linear-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors" />
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-500" />
                Transactions Parsed
              </p>
              <p className="text-3xl text-amber-500 font-mono font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                {transactions.length}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-visible pt-4 pb-20">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex items-center"
          >
            {/* Source Node */}
            <motion.div 
              variants={itemVariants} 
              className="relative group cursor-pointer"
              onClick={() => setFocusedIndex(0)}
              ref={(el) => { nodesRef.current[0] = el; }}
              data-testid="diagram-node"
            >
              <div className={`p-5 rounded-2xl border transition-all duration-500 ${focusedIndex === 0 ? 'bg-zinc-800 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-105' : 'bg-zinc-900/50 border-white/5 hover:border-zinc-700'}`}>
                <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 mb-3">
                  <Target className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="text-xs font-bold text-white uppercase tracking-widest">Target Wallet</p>
              </div>
            </motion.div>

            {transactions.map((tx, i) => {
              const nodeIndex = i + 1;
              return (
                <React.Fragment key={i}>
                  <motion.div 
                    variants={itemVariants} 
                    className="flex items-center"
                    ref={(el) => { nodesRef.current[nodeIndex] = el; }}
                    data-testid="diagram-node"
                  >
                    {/* Connecting Line */}
                    <div className="flex flex-col items-center justify-center w-32 relative">
                      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-800 -translate-y-1/2 z-0 overflow-hidden">
                        <motion.div 
                          initial={{ left: "-100%" }}
                          animate={{ left: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-amber-500 to-transparent"
                        />
                      </div>
                      <div className="bg-zinc-950 px-3 py-1 border border-zinc-800 rounded-full z-10 flex flex-col items-center">
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">${Math.floor(parseFloat(tx.value) * 3000).toLocaleString()}</span>
                        <span className="text-[9px] text-zinc-500 font-mono">{parseFloat(tx.value).toFixed(2)} ETH</span>
                      </div>
                    </div>
                    
                    {/* Destination Node */}
                    <div 
                      className={`p-5 rounded-2xl border transition-all duration-500 cursor-pointer ${focusedIndex === nodeIndex ? 'bg-zinc-800 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.15)] scale-105' : 'bg-zinc-900/50 border-white/5 hover:border-zinc-700'}`}
                      onClick={() => setFocusedIndex(nodeIndex)}
                    >
                      <div className="p-3 bg-zinc-950 rounded-xl border border-white/5 mb-3">
                        {getCategoryIcon(tx.category)}
                      </div>
                      <p className="text-xs font-bold text-white uppercase tracking-widest">{getCategoryLabel(tx.category)}</p>
                      <p className="text-[9px] text-zinc-500 font-mono mt-1 opacity-60">Via: {tx.hash.substring(0, 10)}...</p>
                    </div>
                  </motion.div>
                </React.Fragment>
              );
            })}
          </motion.div>
        </div>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 right-8 flex items-center gap-3">
            <button 
                onClick={() => setFocusedIndex(Math.max(0, focusedIndex - 1))}
                className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30"
                disabled={focusedIndex === 0}
                aria-label="Previous node"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-500">
                <span className="text-amber-500">{focusedIndex + 1}</span> / {transactions.length + 1}
            </div>
            <button 
                onClick={() => setFocusedIndex(Math.min(transactions.length, focusedIndex + 1))}
                className="p-3 bg-zinc-900 border border-white/5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all disabled:opacity-30"
                disabled={focusedIndex === transactions.length}
                aria-label="Next node"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};
