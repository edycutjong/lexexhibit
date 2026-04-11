'use client';

import { Transaction } from "@/lib/tx-classifier";
import { ArrowRight, Lock, Repeat, Globe, Fingerprint, ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useRef, useEffect } from "react";

export function FundFlowDiagram({ transactions }: { transactions: Transaction[] }) {
  const [focusedNodeIndex, setFocusedNodeIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<(HTMLDivElement | null)[]>([]);

  // +1 because we always have the Origin Wallet node at index 0
  const totalNodes = transactions ? transactions.length + 1 : 0;

  useEffect(() => {
    const container = scrollContainerRef.current;
    const targetNode = nodesRef.current[focusedNodeIndex];
    if (container && targetNode) {
       const containerHalfWidth = container.offsetWidth / 2;
       const nodeHalfWidth = targetNode.offsetWidth / 2;
       const targetOffsetLeft = targetNode.offsetLeft;
       
       container.scrollTo({
         left: targetOffsetLeft - containerHalfWidth + nodeHalfWidth,
         behavior: 'smooth'
       });
    }
  }, [focusedNodeIndex]);

  if (!transactions || transactions.length === 0) return null;

  const firstTx = transactions[0];
  
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="relative group w-full">
      <div 
        ref={scrollContainerRef}
        className="w-full bg-zinc-950 border border-white/5 shadow-inner shadow-black/50 rounded-xl p-8 overflow-x-auto relative scrollbar-hide"
      >
        {/* Background ambient glow line */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[2px] bg-zinc-900 z-0"></div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex items-center min-w-max relative z-10"
        >
          {/* Origin Node = Index 0 */}
          <motion.div 
            variants={itemVariants} 
            className="flex flex-col items-center cursor-pointer"
            ref={(el) => { nodesRef.current[0] = el; }}
            onClick={() => setFocusedNodeIndex(0)}
          >
             <div className={`bg-zinc-900 p-4 rounded-xl border shadow-[0_0_20px_rgba(245,158,11,0.2)] flex flex-col items-center gap-2 relative transition-all duration-300 ${focusedNodeIndex === 0 ? 'border-amber-400 scale-110 shadow-[0_0_25px_rgba(245,158,11,0.4)]' : 'border-amber-500/40 opacity-70 hover:opacity-100'}`}>
               <Fingerprint className={`w-6 h-6 mb-1 ${focusedNodeIndex === 0 ? 'text-amber-400' : 'text-amber-500'}`} />
               <span className={`text-xs uppercase tracking-widest font-bold ${focusedNodeIndex === 0 ? 'text-amber-400' : 'text-amber-500'}`}>Target Wallet</span>
               <span className="font-mono text-sm text-zinc-100 bg-black/40 px-3 py-1 rounded">{firstTx.from.slice(0,6)}..{firstTx.from.slice(-4)}</span>
             </div>
          </motion.div>
          
          {/* Transaction Hops = Index 1 to N */}
          {transactions.map((tx, i) => {
            const nodeIndex = i + 1;
            const isFocused = focusedNodeIndex === nodeIndex;
            
            let Icon = Globe;
            let nodeColor = "border-white/10";
            let labelColor = "text-zinc-400";
            
            if (tx.category === 'mixer_interaction') {
              Icon = Lock;
              nodeColor = isFocused ? "border-red-400" : "border-red-500/50";
              labelColor = isFocused ? "text-red-300" : "text-red-400";
            } else if (tx.category === 'swap') {
              Icon = Repeat;
              nodeColor = isFocused ? "border-blue-400" : "border-blue-500/50";
              labelColor = isFocused ? "text-blue-300" : "text-blue-400";
            } else if (tx.category === 'bridge') {
              Icon = ArrowRight;
              nodeColor = isFocused ? "border-purple-400" : "border-purple-500/50";
              labelColor = isFocused ? "text-purple-300" : "text-purple-400";
            }

            return (
               <motion.div 
                 key={i} 
                 variants={itemVariants} 
                 className="flex items-center"
                 ref={(el) => { nodesRef.current[nodeIndex] = el; }}
               >
                  {/* Connecting Line + Data Transfer */}
                  <div className="flex flex-col items-center justify-center w-32 relative">
                     <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-zinc-800 -translate-y-1/2 z-0 overflow-hidden">
                        {/* Animated dash traveling */}
                        <motion.div 
                          initial={{ left: "-100%" }}
                          animate={{ left: "100%" }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                          className="absolute top-0 bottom-0 w-1/2 bg-linear-to-r from-transparent via-amber-500 to-transparent"
                        />
                     </div>
                     <div className="bg-zinc-950 px-3 py-1 border border-zinc-800 rounded-full z-10 flex flex-col items-center transition-transform">
                       <span className="text-[10px] text-emerald-400 font-mono font-bold drop-shadow-[0_0_5px_rgba(52,211,153,0.5)]">
                         ${Math.floor(parseFloat(tx.value) * 3000).toLocaleString()} USD
                       </span>
                       <span className="text-[9px] text-zinc-500 font-mono">
                         {parseFloat(tx.tokenValue || tx.value).toFixed(2)} {tx.tokenSymbol || 'ETH'}
                       </span>
                     </div>
                  </div>
                  
                  {/* Destination Node */}
                  <div className="flex flex-col items-center cursor-pointer" onClick={() => setFocusedNodeIndex(nodeIndex)}>
                     <div className={`bg-zinc-900 p-4 rounded-xl border shadow-lg flex flex-col items-center gap-2 transition-all duration-300 ${nodeColor} ${isFocused ? 'scale-110 shadow-[0_0_25px_rgba(255,255,255,0.1)]' : 'opacity-70 hover:opacity-100 hover:-translate-y-1'}`}>
                       <Icon className={`w-5 h-5 mb-1 ${labelColor}`} />
                       <span className={`text-[10px] uppercase tracking-widest font-bold ${labelColor}`}>
                          {tx.category === 'mixer_interaction' ? 'Mixer (Tornado)' : 
                           tx.category === 'swap' ? 'DEX Swap' : 
                           tx.category === 'bridge' ? 'Bridge Contract' : 'Wallet'}
                       </span>
                       <span className="font-mono text-sm text-zinc-300 bg-black/40 px-3 py-1 rounded">{tx.to.slice(0,6)}..{tx.to.slice(-4)}</span>
                     </div>
                  </div>
               </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Floating Navigation Controls */}
      <button 
        onClick={() => setFocusedNodeIndex(Math.max(0, focusedNodeIndex - 1))}
        disabled={focusedNodeIndex === 0}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/90 backdrop-blur border border-white/20 rounded-full text-white disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 z-20 shadow-xl"
        aria-label="Previous node"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <button 
        onClick={() => setFocusedNodeIndex(Math.min(totalNodes - 1, focusedNodeIndex + 1))}
        disabled={focusedNodeIndex === totalNodes - 1}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/90 backdrop-blur border border-white/20 rounded-full text-white disabled:opacity-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800 z-20 shadow-xl"
        aria-label="Next node"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
