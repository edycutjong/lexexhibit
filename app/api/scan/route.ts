import { NextResponse } from 'next/server';
import { detectSuspiciousPatterns } from '@/lib/suspicious-detector';
import { Transaction } from '@/lib/tx-classifier';
import { fetchWalletTransactions } from '@/lib/alchemy';
import { supabase } from '@/lib/supabase';

import demoTrace from '@/data/demo-trace.json';
import demoInnocent from '@/data/demo-innocent.json';

export async function POST(req: Request) {
  try {
    const { address } = await req.json();
    const normalizedAddress = address.toLowerCase();

    // ── 1. Demo wallets — instant, no API or DB calls ──────────────────────────
    if (normalizedAddress === demoTrace.address.toLowerCase()) {
      const transactions = detectSuspiciousPatterns(demoTrace.transactions as Transaction[]);
      return NextResponse.json({ ledger: { transactions, summary: demoTrace.summary } });
    }

    if (normalizedAddress === demoInnocent.address.toLowerCase()) {
      const transactions = detectSuspiciousPatterns(demoInnocent.transactions as Transaction[]);
      return NextResponse.json({ ledger: { transactions, summary: demoInnocent.summary } });
    }

    // ── 2. Supabase cache check ────────────────────────────────────────────────
    if (supabase) {
      try {
        const { data: cached } = await supabase
          .from('cached_traces')
          .select('tx_data, tx_count, total_value_usd')
          .eq('wallet_address', normalizedAddress)
          .eq('chain', 'ethereum')
          .gt('expires_at', new Date().toISOString())
          .maybeSingle();

        if (cached) {
          return NextResponse.json({
            ledger: {
              transactions: cached.tx_data as Transaction[],
              summary: { totalValueUsd: cached.total_value_usd, txCount: cached.tx_count },
            },
            cached: true,
          });
        }
      } catch (dbErr) {
        console.warn('Cache read failed (continuing):', dbErr);
      }
    }

    // ── 3. Live Alchemy fetch ──────────────────────────────────────────────────
    const { transactions, totalValueUsd } = await fetchWalletTransactions(normalizedAddress);
    const summary = { totalValueUsd, txCount: transactions.length };

    // ── 4. Write result to cache for subsequent requests ───────────────────────
    if (supabase && transactions.length > 0) {
      supabase
        .from('cached_traces')
        .upsert(
          {
            wallet_address: normalizedAddress,
            chain: 'ethereum',
            tx_data: transactions,
            tx_count: transactions.length,
            total_value_usd: totalValueUsd,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          { onConflict: 'wallet_address,chain' }
        )
        .then(({ error }) => {
          if (error) console.warn('Cache write failed:', error.message);
        });
    }

    return NextResponse.json({ ledger: { transactions, summary } });
  } catch (error) {
    console.error('Scan Error:', error);
    return NextResponse.json({ error: 'Failed to trace wallet' }, { status: 500 });
  }
}
