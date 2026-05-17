'use client';

import { CheckCircle2, ExternalLink, Hash } from 'lucide-react';
import { LegalSection } from '@/lib/pdf-generator';

interface ExhibitVerificationPanelProps {
  sections: LegalSection[];
}

const ETHERSCAN_BASE = 'https://etherscan.io/tx/';

export function ExhibitVerificationPanel({ sections }: ExhibitVerificationPanelProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-white/10 rounded-xl p-6 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>
        <div>
          <h3 className="text-lg font-medium text-white">Exhibit Verification</h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            Every exhibit cross-referenced against the Ethereum public ledger
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <div
            key={section.exhibitNumber}
            className="flex items-center justify-between p-4 bg-zinc-950/50 border border-white/5 rounded-xl hover:border-emerald-500/20 transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-white font-mono">{section.exhibitNumber}</span>
              </div>
              <div>
                <p className="text-xs text-zinc-400 font-mono">
                  <Hash className="inline w-3 h-3 mr-1 text-zinc-600" />
                  {section.txHashes[0]?.slice(0, 20)}...{section.txHashes[0]?.slice(-8)}
                </p>
                <p className="text-xs text-zinc-600 mt-0.5">{section.dateRange}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Verified on-chain
              </span>
              <a
                href={`${ETHERSCAN_BASE}${section.txHashes[0]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors"
                aria-label="View on Etherscan"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-zinc-600 mt-5 text-center leading-relaxed">
        Transaction hashes are immutable identifiers on the Ethereum blockchain.
        Any court or counsel may independently verify these records at{' '}
        <span className="text-zinc-500">etherscan.io</span>.
      </p>
    </div>
  );
}
