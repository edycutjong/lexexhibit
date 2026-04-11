'use client';

import { Transaction } from '@/lib/tx-classifier';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRightLeft, ArrowUpRight, Ban, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function SuspiciousFlags({ flags, className }: { flags: string[], className?: string }) {
  if (!flags || flags.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {flags.map((flag) => (
        <span 
          key={flag} 
          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20"
        >
          <AlertCircle className="w-3 h-3" />
          {flag.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      ))}
    </div>
  );
}

const CategoryIcon = ({ category }: { category: string }) => {
  switch (category) {
    case 'transfer':
      return <ArrowUpRight className="w-4 h-4 text-emerald-400" />;
    case 'swap':
      return <ArrowRightLeft className="w-4 h-4 text-blue-400" />;
    case 'mixer_interaction':
      return <Ban className="w-4 h-4 text-rose-500" />;
    case 'bridge':
      return <Zap className="w-4 h-4 text-purple-400" />;
    default:
      return <ArrowUpRight className="w-4 h-4 text-zinc-400" />;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'transfer':
      return { border: 'hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(52,211,153,0.1)]', glow: 'bg-emerald-500/40', text: 'text-emerald-400' };
    case 'swap':
      return { border: 'hover:border-blue-500/40 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]', glow: 'bg-blue-500/40', text: 'text-blue-400' };
    case 'mixer_interaction':
      return { border: 'border-rose-500/20 hover:border-rose-500/50 bg-rose-500/5 hover:shadow-[0_0_25px_rgba(243,24,100,0.15)]', glow: 'bg-rose-500/50', text: 'text-rose-400' };
    case 'bridge':
      return { border: 'hover:border-purple-500/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.1)]', glow: 'bg-purple-500/40', text: 'text-purple-400' };
    default:
      return { border: 'hover:border-zinc-500/40', glow: 'bg-zinc-500/40', text: 'text-zinc-400' };
  }
};

export function TransactionTimeline({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) return null;

  return (
    <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
      {transactions.map((tx, index) => {
        const styles = getCategoryStyles(tx.category);
        
        return (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
          >
            {/* Icon node - Must remain purely absolute to center correctly on the line! */}
            <div className="absolute left-0 md:left-1/2 -ml-5 md:ml-0 flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-zinc-900 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-transform group-hover:scale-110">
               <div className={cn("absolute inset-0 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity z-0", styles.glow)} />
               <div className={cn("z-10 relative transition-colors", styles.text)}>
                 <CategoryIcon category={tx.category} />
               </div>
            </div>

            {/* Card */}
            <div className={cn("w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-zinc-900/50 p-4 rounded-xl border border-white/5 transition-all duration-300 ml-14 md:ml-0", styles.border)}>
              <div className="flex items-center justify-between mb-2">
                 <div className="text-xs text-zinc-400">
                    {format(new Date(tx.timestamp * 1000), 'MMM d, yyyy HH:mm:ss')}
                 </div>
                 <div className="text-xs font-mono text-zinc-500">
                   {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                 </div>
              </div>
              
              <div className="mb-2">
                <div className="text-sm text-zinc-300">
                   <span className="font-semibold text-white">
                     {tx.method || tx.category.toUpperCase()}
                   </span>
                   {' • '}
                   <span className={cn("font-mono font-bold", styles.text)}>
                     {parseFloat(tx.tokenValue || tx.value || '0').toLocaleString()} {tx.tokenSymbol || 'ETH'}
                   </span>
                </div>
              </div>

              <div className="text-xs text-zinc-500 font-mono break-all mb-3">
                 To: {tx.to}
              </div>

              <SuspiciousFlags flags={tx.suspiciousFlags} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
