import { NextResponse } from 'next/server';
import { Transaction } from '@/lib/tx-classifier';
import { formatLegalProse } from '@/lib/legal-formatter';
import { generateAffidavitPdfBase64 } from '@/lib/pdf-generator';
import { supabase } from '@/lib/supabase';

// A real version would send data to GPT-4o here. For the demo, we map the txs using local formatters.

export async function POST(req: Request) {
  try {
    const { transactions, wallet } = await req.json();

    const sections = (transactions as Transaction[]).map((tx, index) => {
      const charCode = 'A'.charCodeAt(0) + index;
      const exhibitLetter = String.fromCharCode(charCode);

      const legalProse = formatLegalProse(
        tx.timestamp,
        tx.from,
        tx.to,
        tx.tokenValue || tx.value || '0',
        tx.tokenSymbol || 'ETH',
        tx.method || '',
        exhibitLetter,
        tx.suspiciousFlags || []
      );

      return {
        exhibitNumber: exhibitLetter,
        paragraphNumber: index + 1,
        legalProse,
        txHashes: [tx.hash],
        dateRange: `On or about ${new Date(tx.timestamp * 1000).toLocaleDateString()}`,
      };
    });

    const pdfBase64 = await generateAffidavitPdfBase64(sections, transactions as Transaction[]);

    // Persist report to Supabase for audit trail (fire-and-forget, never blocks response)
    if (supabase) {
      supabase
        .from('generated_reports')
        .insert({
          wallet_address: (wallet as string | undefined)?.toLowerCase() ?? 'unknown',
          sections,
          exhibit_count: sections.length,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase report write failed:', error.message);
        });
    }

    return NextResponse.json({ pdfBase64, sections, exhibitCount: sections.length });
  } catch (error) {
    console.error('Generate Error:', error);
    return NextResponse.json({ error: 'Failed to generate document' }, { status: 500 });
  }
}
