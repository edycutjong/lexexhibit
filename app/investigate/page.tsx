'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2, FileText, CheckCircle2, ShieldCheck, Globe, Banknote, Activity } from 'lucide-react';
import { TransactionTimeline } from '@/components/TransactionTimeline';
import { AffidavitPreview } from '@/components/AffidavitPreview';
import { FundFlowDiagram } from '@/components/FundFlowDiagram';
import { Transaction } from '@/lib/tx-classifier';
import { motion, AnimatePresence } from 'framer-motion';

export function InvestigateDashboard() {
  const searchParams = useSearchParams();
  const rawWallet = searchParams?.get('wallet');
  const wallet = rawWallet || '0x098B716B8Aaf21512996dC57EB0615e2383E2f96';

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    transactions: Transaction[],
    summary: { totalValueUsd: number, txCount: number }
  } | null>(null);

  const [pdfState, setPdfState] = useState<'idle'|'tracing'|'translating'|'formatting'|'done'>('idle');
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null);
  
  const pdfRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Perform simulated endpoint fetch
    async function loadData() {
      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: wallet })
        });
        const json = await res.json();
        setData(json.ledger);
      } catch (err) {
        console.error(err);
      } finally {
         setIsLoading(false);
      }
    }
    loadData();
  }, [wallet]);

  const generateAffidavit = async () => {
    setPdfState('tracing');
    
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    try {
      // Start the network request in parallel with our cinematic UI timeline
      const fetchPromise = fetch('/api/generate-affidavit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactions: data?.transactions || [] })
      });

      // 1. Tracing State (0-1.5s)
      await delay(1500);
      
      // 2. Translating State (1.5s-3.0s)
      setPdfState('translating');
      await delay(1500);
      
      // 3. Formatting State (3.0s-4.5s)
      setPdfState('formatting');
      await delay(1500);

      // 4. Await network resolution (if still pending) and complete
      const res = await fetchPromise;
      const json = await res.json();
      
      setPdfDataUrl(json.pdfBase64);
      setPdfState('done');
      
      setTimeout(() => {
        pdfRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 300);
      
    } catch (err) {
      console.error(err);
      setPdfState('idle');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-4">
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-4 border-amber-500/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="text-amber-500 font-mono tracking-widest text-sm animate-pulse">
          TRACING FUND MOVEMENTS...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
      {/* Left Column: Trace details */}
      <div className="w-full md:w-[45%] flex flex-col gap-6">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky top-20 z-10 bg-zinc-950/80 backdrop-blur-xl pb-6 border-b border-white/5"
        >
           <div className="flex items-center gap-4 mb-4">
             <div className="p-3 bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-xl border border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
               <ShieldCheck className="text-amber-500 w-7 h-7" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-white tracking-tight">
                 Forensic Wallet Trace
               </h2>
               <div className="flex items-center gap-2 mt-1.5">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                 </span>
                 <p className="text-zinc-400 font-mono text-xs break-all tracking-wider">
                   {wallet}
                 </p>
               </div>
             </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <Banknote className="w-4 h-4 text-emerald-500" />
                    Total Suspect Value
                 </p>
                 <p className="text-3xl text-emerald-400 font-mono font-bold drop-shadow-[0_0_10px_rgba(52,211,153,0.4)]">
                   {data?.summary?.totalValueUsd != null ? `$${data.summary.totalValueUsd.toLocaleString()}` : '$Unknown'}
                 </p>
              </div>
              <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-xl p-5 shadow-xl relative overflow-hidden group">
                 <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-colors"></div>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-500" />
                    Transactions Parsed
                 </p>
                 <p className="text-3xl text-amber-500 font-mono font-bold drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                   {data?.summary?.txCount ?? 0}
                 </p>
              </div>
           </div>
        </motion.div>

        <div className="flex-1 overflow-visible pt-4 pb-20">
            <TransactionTimeline transactions={data?.transactions || []} />
        </div>
      </div>

      {/* Right Column: PDF generation */}
      <div className="w-full md:w-[55%] flex flex-col gap-6">
         <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
            {/* Background scan glow if generating */}
            {pdfState !== 'idle' && pdfState !== 'done' && (
               <motion.div 
                 className="absolute inset-0 bg-amber-500/5 blur-3xl z-0"
                 animate={{ opacity: [0.5, 1, 0.5] }}
                 transition={{ repeat: Infinity, duration: 2 }}
               />
            )}
            
            <div className="relative z-10">
              <h3 className="text-lg font-medium text-white mb-4">Case Documentation</h3>
              <p className="text-zinc-400 text-sm mb-6">
                Generate a formalized, court-admissible affidavit attesting to the asset movements identified in the trace ledger.
              </p>

              <AnimatePresence mode="wait">
                {pdfState === 'idle' || pdfState === 'done' ? (
                  <motion.button 
                    key="generate-btn"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={generateAffidavit}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)]"
                  >
                    <FileText className="w-5 h-5" />
                    {pdfState === 'done' ? 'Regenerate Legal Affidavit' : 'Generate Legal Affidavit'}
                  </motion.button>
                ) : (
                  <motion.div 
                    key="progress-bar"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full bg-zinc-950 p-5 rounded-xl border border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.15)] space-y-4 font-mono text-sm relative overflow-hidden"
                  >
                    {/* Progress Background Sweep */}
                    <motion.div 
                      className="absolute top-0 bottom-0 left-0 bg-amber-500/10 border-r-2 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)] z-0"
                      initial={{ width: "0%" }}
                      animate={{ width: pdfState === 'tracing' ? "33%" : pdfState === 'translating' ? "66%" : "95%" }}
                      transition={{ duration: 1.5, ease: "easeInOut" }}
                    />
                    
                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center gap-4">
                          {pdfState === 'tracing' ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          <span className={pdfState === 'tracing' ? "text-amber-400 font-bold" : "text-zinc-400"}>
                            [1/3] Translating Ledger Graph...
                          </span>
                      </div>
                      <div className="flex items-center gap-4">
                          {pdfState === 'translating' ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : 
                          pdfState === 'tracing' ? <div className="w-4" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                          <span className={pdfState === 'translating' ? "text-amber-400 font-bold" : pdfState === 'tracing' ? 'text-zinc-600' : "text-zinc-400"}>
                            [2/3] Synthesizing Legal Prose via GPT-4o...
                          </span>
                      </div>
                      <div className="flex items-center gap-4">
                          {pdfState === 'formatting' ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <div className="w-4" />}
                          <span className={pdfState === 'formatting' ? "text-amber-400 font-bold" : "text-zinc-600"}>
                            [3/3] Emitting Certified PDF Affidavit...
                          </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
         </div>

         <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-zinc-400" />
              Asset Trajectory Topology
            </h3>
            <FundFlowDiagram transactions={data?.transactions || []} />
         </div>

         {/* Attach ref to scroll to pdf directly upon finish */}
         <div ref={pdfRef} className={pdfState === 'done' ? "animate-in fade-in slide-in-from-bottom-4 duration-1000" : ""}>
           <AffidavitPreview pdfDataUrl={pdfDataUrl} />
         </div>
      </div>
    </div>
  );
}

export default function InvestigatePage() {
  return (
     <Suspense fallback={<div className="h-screen w-full flex items-center justify-center text-amber-500"><Loader2 className="w-6 h-6 animate-spin"/></div>}>
        <InvestigateDashboard />
     </Suspense>
  );
}
